//classを切り替える

import {
  getstoreMonthsWhereList,
  parseMonthLabelToDate,
  createMonthWhere,
} from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/lib'
import {getStoreQueryList, storeMonthsWhereListType} from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/constants'

export async function get_mikomiS_additionalWhere({query}) {
  const [storeLabel, monthLabel, theFourSourceLabel, dataLabel] = query[`mikomiS`].split(`__`)

  const isAfterPeriod = monthLabel.includes(`以降`)
  const firstDayOfMonth = parseMonthLabelToDate(monthLabel)
  const monthWhere = createMonthWhere(firstDayOfMonth, isAfterPeriod)

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
