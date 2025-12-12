import {isImcompleted} from '@app/(apps)/newCar/(constants)/checkpoints/checkpoints'

import {Prisma} from '@prisma/generated/prisma/client'
import {addMonths} from 'date-fns'
import {NEW_CAR_CONST} from '@app/(apps)/newCar/(constants)/newCar-constants'

export type Month = Date | '過去'
export type getQueryByMonthType = {month: Month; wheres: {key: string; condition: Prisma.NewCarWhereInput}[]}

export type ProgressReportRecord = {
  key: string
  count: number
  month: Month
}

export const getWheres = ({userId, storeId, month, firstMonth, newCarWhere}) => {
  const {COMMON_WHERE} = NEW_CAR_CONST.NEW_CAR.WHERE

  const onThisMonth = month === `過去` ? {} : {gte: month, lt: addMonths(month, 1)}

  type condition = Prisma.NewCarWhereInput

  const FR_THIS_MONTH = {DD_FR: onThisMonth}
  const CUSTOM_DD_SEISANYOTEI = {
    OR: [{DD_FR: onThisMonth}, {CUSTOM_DD_SEISANYOTEI: onThisMonth}],
  }

  //2ヶ月前
  const m2_target = {m2Alert: onThisMonth}
  const m2_Set = {
    m2Alert: onThisMonth,
    NOT: {...isImcompleted(`m2Status`)},
  }
  const m2_remaining = {
    m2Alert: onThisMonth,
    ...isImcompleted(`m2Status`),
  }

  // 1ヶ月前
  const m1_target = {m1Alert: onThisMonth}
  const m1_Set = {
    m1Alert: onThisMonth,
    NOT: {...isImcompleted(`m1Status`)},
  }
  const m1_remaining = {
    m1Alert: onThisMonth,
    ...isImcompleted(`m1Status`),
  }

  // // 登録
  // const toroku_target = {DD_FR: onThisMonth}
  // const toroku_Set = {
  //   ...toroku_target,
  //   OR: [{lastApprovedDesiredTorokuDate: {not: null}}],
  // }

  // const toroku_remaining = {
  //   //未登録 かつ 申請承諾がない
  //   ...toroku_target,
  //   DD_TOUROKU: null,
  //   lastApprovedDesiredTorokuDate: null,
  // }

  // const toroku_Achieved = {DD_TOUROKU: onThisMonth}

  // // 配送
  // const haisou_target = {DD_FR: onThisMonth}
  // const haisou_Set = {DD_HAISKIBO: onThisMonth}

  // const haisou_remaining = {
  //   ...haisou_target,
  //   DD_HAISKIBO: null,
  // }

  // 1ヶ月前
  // const m1_target = {m1Alert: onThisMonth}
  // const m1_Set = {
  //   m1Alert: onThisMonth,
  //   NOT: {...isImcompleted(`m1Status`)},
  // }
  // const m1_remaining = {
  //   m1Alert: onThisMonth,
  //   ...isImcompleted(`m1Status`),
  // }
  // 納車
  const nousha_target = {
    DD_FR: onThisMonth,
  }
  const nousha_Set = {
    DD_FR: onThisMonth,
    NOT: {...isImcompleted(`m0Status`)},
  }
  const nousha_remaining = {
    DD_FR: onThisMonth,
    ...isImcompleted(`m0Status`),
  }

  const nousha_Avhieved = {DD_NOSYA: onThisMonth}

  const result: {[key: string]: condition} = {
    FR_THIS_MONTH,
    CUSTOM_DD_SEISANYOTEI,
    m2_target,
    m2_Set,
    m2_remaining,

    m1_target,
    m1_Set,
    m1_remaining,

    // toroku_target,
    // toroku_Set,
    // toroku_remaining,
    // toroku_Achieved,

    // haisou_target,
    // haisou_Set,

    // haisou_remaining,

    nousha_target,
    nousha_Set,
    nousha_remaining,
    nousha_Avhieved,
  }

  Object.keys(result).forEach(key => {
    result[key] = {
      AND: [COMMON_WHERE, result[key]],
    }
  })

  const toArray = obj =>
    Object.keys(obj).map(key => {
      const value = obj[key]

      return {
        key,
        condition: {
          ...newCarWhere,
          ...value,
          userId,
          storeId,
        },
      }
    })

  const data = toArray(result)

  return data
}

export const fieldNameKeyValueMapping = {
  FR_THIS_MONTH: `当月振当`,
  CUSTOM_DD_SEISANYOTEI: `当月生産`,
  m2_target: `2ヶ月前_活動対象`,
  m2_Set: `2ヶ月前_活動済`,
  m2_remaining: `2ヶ月前_未活動`,

  m1_target: `1ヶ月前_活動対象`,
  m1_Set: `1ヶ月前_活動済`,
  m1_remaining: `1ヶ月前_未活動`,

  toroku_target: `登録希望申請対象`,
  toroku_Set: `登録希望申請済`,
  toroku_remaining: `登録希望未申請`,
  toroku_Achieved: `登録実績`,

  haisou_target: `配送希望入力対象`,
  haisou_Set: `配送希望入力済み`,

  haisou_remaining: `配送希望未入力`,

  nousha_target: `納車対象`,
  nousha_Set: `納車予定`,
  nousha_remaining: `未納車`,
  nousha_Avhieved: `納車済み`,
}
