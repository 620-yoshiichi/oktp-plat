import {NEW_CAR_CONST} from '@app/(apps)/newCar/(constants)/newCar-constants'
import {
  fiveMikomiFieldList,
  FourDataSourceList,
  FourDataSourceListType,
  newCarWhereArgs,
  storeMonthsWhereListType,
} from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/constants'
import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

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

/**
 * 日付を月初日に正規化する
 * getMonthsBetweenDatesが返す日付（月末日になる場合がある）を月初日に変換
 */
export const normalizeToFirstDayOfMonth = (date: Date): Date => {
  return Days.month.getMonthDatum(date).firstDayOfMonth
}

/**
 * monthLabelから日付を生成する
 * 例: "2025年12月" → 2025年12月1日のDateオブジェクト
 * 例: "2025年12月以降" → 2025年12月1日のDateオブジェクト
 */
export const parseMonthLabelToDate = (monthLabel: string): Date => {
  const [year, month] = monthLabel.replace(/月|以降/g, '').split(`年`)
  return toUtc(new Date(Number(year), Number(month) - 1, 1))
}

/**
 * monthWhere条件を生成する
 * @param firstDayOfMonth 月初日のDateオブジェクト
 * @param isAfterPeriod 「以降」の場合はtrue
 * @returns
 */
export const createMonthWhere = (firstDayOfMonth: Date, isAfterPeriod: boolean) => {
  if (isAfterPeriod) {
    return {gte: firstDayOfMonth}
  } else {
    return {
      gte: firstDayOfMonth,
      lt: Days.month.add(firstDayOfMonth, 1),
    }
  }
}

/**
 * 月クエリアイテムを生成する
 * @param date 日付（月初日に正規化される）
 * @param isAfterPeriod 「以降」の場合はtrue
 * @returns 月クエリアイテム
 */
export const createMonthQueryItem = (
  date: Date,
  isAfterPeriod: boolean = false
): {
  month: Date
  monthLabel: string
  monthWhere: {gte: Date; lt?: Date}
} => {
  const firstDayOfMonth = normalizeToFirstDayOfMonth(date)
  const monthLabel = isAfterPeriod ? `${formatDate(firstDayOfMonth, 'YYYY年MM月')}以降` : formatDate(firstDayOfMonth, 'YYYY年M月')
  const monthWhere = createMonthWhere(firstDayOfMonth, isAfterPeriod)

  return {
    month: firstDayOfMonth,
    monthLabel,
    monthWhere,
  }
}
