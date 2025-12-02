//classを切り替える

import {toUtc} from '@cm/class/Days/date-utils/calculations'

import {getstoreMonthsWhereList} from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/lib'
import {getStoreQueryList, storeMonthsWhereListType} from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/constants'
import {Days} from '@cm/class/Days/Days'

export async function get_mikomiS_additionalWhere({query}) {
  const [storeLabel, monthLabel, theFourSourceLabel, dataLabel] = query[`mikomiS`].split(`__`)

  let monthWhere = {}
  const [year, month] = monthLabel.replace(/月|以降/g, '').split(`年`)
  const theMonth = toUtc(new Date(Number(year), Number(month) - 1, 1))
  if (monthLabel.includes(`以降`)) {
    monthWhere = {gte: theMonth}
  } else {
    monthWhere = {gte: theMonth, lt: Days.month.add(theMonth, 1)}
  }

  const storeQueryList = await getStoreQueryList()
  const storeMonthsWhereList: storeMonthsWhereListType[] = getstoreMonthsWhereList({
    storeQueryList: storeQueryList,
    thisMonth: undefined,
    monthsQueryList: [
      {
        monthLabel: monthLabel,
        monthWhere,
      },
    ],
  })

  const flattenedStoreMonthsWhereList: storeMonthsWhereListType[] = []
  storeMonthsWhereList.forEach(sm => {
    flattenedStoreMonthsWhereList.push(sm)
    sm.children?.forEach(child => {
      flattenedStoreMonthsWhereList.push(child)
      child.children?.forEach(son => {
        flattenedStoreMonthsWhereList.push(son)
      })
    })
  })

  const find = flattenedStoreMonthsWhereList.find(sm => {
    return (
      sm?.storeLabel === storeLabel &&
      sm.monthLabel === monthLabel &&
      sm.theFourSourceLabel === theFourSourceLabel &&
      sm.dataLabel === dataLabel
      // sm.theFiveMikomiLabel === theFiveMikomiLabel
    )
  })

  // const {store_Months, modeStr, groupKey} = await getMikomiQueryVariavles({query, newCarWhere})

  const additionalWhere = find?.whereQuery ?? {}

  return {additionalWhere}
}
