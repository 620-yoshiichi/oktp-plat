'use server'

import {getstoreMonthsWhereList} from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/lib'
import {getStoreQueryList, storeMonthsWhereListType} from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/constants'
import prisma from 'src/lib/prisma'

export const serverInitMikomiTableData = async ({monthsQueryList, thisMonth}) => {
  const storeQueryList = await getStoreQueryList()
  //キャッシュしてデータを取得

  const storeMonthsWhereList: storeMonthsWhereListType[] = getstoreMonthsWhereList({
    storeQueryList,
    monthsQueryList,
    thisMonth,
  })

  const roopGetCount = async storeMonthsWhere => {
    const where = storeMonthsWhere.whereQuery

    const agg = await prisma.newCar.aggregate({_count: true, where})
    const count = agg?._count

    const result = {count, ...storeMonthsWhere, children: undefined as any}
    if (storeMonthsWhere?.children) {
      const children = await Promise.all(
        storeMonthsWhere?.children?.map(async child => {
          return await roopGetCount(child)
        })
      )
      result.children = children
    }
    return result
  }

  const dataList: storeMonthsWhereListType[] = await Promise.all(
    storeMonthsWhereList.map(async sm => {
      const {count, children} = await roopGetCount(sm)
      return {...sm, count, children}
    })
  )

  return {dataList, storeQueryList}
}
