import {NEW_CAR_CONST} from '@app/(apps)/newCar/(constants)/newCar-constants'
import {
  fiveMikomiFieldList,
  FourDataSourceList,
  FourDataSourceListType,
  newCarWhereArgs,
  storeMonthsWhereListType,
} from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/constants'

export const getstoreMonthsWhereList = ({storeQueryList, monthsQueryList, thisMonth}) => {
  const getWhere_roop = (source: FourDataSourceListType, getWhereProps) => {
    if (source.getWhere === undefined) {
      source.getWhere = getWhereProps => {
        return {
          OR: source?.children?.map(child => getWhere_roop(child, getWhereProps)),
        }
      }
    }
    const where = source?.getWhere(getWhereProps)
    return where
  }

  const nestCreatefiveMikomiField = ({
    storeWhere,
    storeLabel,
    monthLabel,
    theFourSourceWhere,
    theFourSourceLabel,
    item,
    getWhereProps,
  }) => {
    const theFiveMikomiWhere = getWhere_roop(item, getWhereProps)

    const children = item.children ?? []

    const whereQuery: newCarWhereArgs = {
      AND: [
        //
        NEW_CAR_CONST.NEW_CAR.WHERE.COMMON_WHERE,

        storeWhere,
        theFourSourceWhere,
        theFiveMikomiWhere,
      ],
    }

    const result: storeMonthsWhereListType = {
      dataLabel: item.label,
      storeLabel,
      storeWhere,
      monthLabel,
      theFourSourceLabel,
      theFiveMikomiLabel: item.label,
      whereQuery,
      jpLabel: item.jpLabel,
      children: children.map(child =>
        nestCreatefiveMikomiField({
          storeWhere,
          monthLabel,
          storeLabel,
          theFourSourceWhere,
          theFourSourceLabel,
          item: child,
          getWhereProps,
        })
      ),
    }
    storeMonthsWhereList.push(result)

    return result
  }

  const storeMonthsWhereList: storeMonthsWhereListType[] = []
  storeQueryList.forEach(data => {
    const {storeLabel, storeWhere} = data

    FourDataSourceList.forEach(theFourSource => {
      monthsQueryList.forEach(({monthWhere, monthLabel}) => {
        const getWhereProps = {thisMonth, monthWhere}

        const theFourSourceWhere = theFourSource?.getWhere?.(getWhereProps) ?? {}

        fiveMikomiFieldList.forEach(theFiveMikomi => {
          const data = nestCreatefiveMikomiField({
            monthLabel,
            storeLabel,
            storeWhere,
            theFourSourceWhere,
            theFourSourceLabel: theFourSource.label,
            item: theFiveMikomi,

            getWhereProps,
          })

          // storeMonthsWhereList.push(data)
        })

        // getFourD
      })
    })
  })

  return storeMonthsWhereList
}
