import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Days} from '@cm/class/Days/Days'
import {addDays} from 'date-fns'

export type RegistryParams = {
  baseMonth?: Date
  storeId?: number | 'all'
  userId?: number | 'all'
}

export type Predicate = {
  key: string
  // WHERE句に埋め込むブール式（括弧付き）を返す
  getSql: (p: Required<RegistryParams> & {firstDay: string; nextFirstDay: string}) => string
  // Prisma where 相当（将来の詳細一覧用）
  getWhere: (p: Required<RegistryParams> & {firstDay: Date; nextFirstDay: Date}) => any
}

// 月初と翌月初（[firstDay, nextFirstDay) の半開区間）
export const getMonthBoundaries = (baseMonth?: Date) => {
  const base = baseMonth ?? getMidnight()
  const {firstDayOfMonth, lastDayOfMonth} = Days.month.getMonthDatum(base)
  const nextMonthFirst = addDays(lastDayOfMonth, 1)

  return {
    firstDay: formatDate(firstDayOfMonth),
    nextFirstDay: formatDate(nextMonthFirst),
    firstDayDate: firstDayOfMonth,
    nextFirstDayDate: addDays(lastDayOfMonth, 1),
  }
}

// 新方式: A~C × H~K × O/P1/P2/Q のコンポジション
type GroupA = 'A' | 'B' | 'C'
type GroupH = 'H' | 'I' | 'J' | 'K'
type GroupO = 'O' | 'P1' | 'P2' | 'Q'

type CompositeKey = `${GroupA}_${GroupH}_${GroupO}`

type AtomicPredicate = {
  getSql: (ctx: {firstDay: string; nextFirstDay: string}) => string
  getWhere: (ctx: {firstDay: Date; nextFirstDay: Date}) => any
}

// A/B/C: 振当日(DD_FR) と基準月の関係
const atomicA: Record<GroupA, AtomicPredicate> = {
  // A: 振当日がBC日付[=前月以前] → DD_FR < firstDay
  A: {
    getSql: ({firstDay}) => `("DD_FR" < '${firstDay}')`,
    getWhere: ({firstDay}) => ({DD_FR: {lt: firstDay}}),
  },
  // B: 振当日がBC日付[=当月] → firstDay <= DD_FR < nextFirstDay
  B: {
    getSql: ({firstDay, nextFirstDay}) => `("DD_FR" >= '${firstDay}' AND "DD_FR" < '${nextFirstDay}')`,
    getWhere: ({firstDay, nextFirstDay}) => ({DD_FR: {gte: firstDay, lt: nextFirstDay}}),
  },
  // C: 振当日がBC日付[=翌月以降] → DD_FR >= nextFirstDay
  C: {
    getSql: ({nextFirstDay}) => `("DD_FR" >= '${nextFirstDay}')`,
    getWhere: ({nextFirstDay}) => ({DD_FR: {gte: nextFirstDay}}),
  },
}

// H/I/J/K: 段階的に除外しながらBC月内の主たる日付で分類
// H: 振当日がBC（月内）
// I: Hに該当せず、生産予定日(CUSTOM_DD_SEISANYOTEI)がBC
// J: H/Iに該当せず、(仮区分がA or B) かつ CUSTOM_FR_DATE がBC（月一致はYYYY-MMで判定）
// K: H/I/Jに該当せず、登録見込み(m1_toroku_prediction)がBC
const atomicH: Record<GroupH, AtomicPredicate> = {
  H: {
    getSql: ({firstDay, nextFirstDay}) => `( "DD_FR" >= '${firstDay}' AND "DD_FR" < '${nextFirstDay}')`,

    getWhere: ({firstDay, nextFirstDay}) => ({DD_FR: {gte: firstDay, lt: nextFirstDay}}),
  },
  I: {
    getSql: ({firstDay, nextFirstDay}) =>
      `"DD_FR" IS NULL AND ("CUSTOM_DD_SEISANYOTEI" >= '${firstDay}' AND "CUSTOM_DD_SEISANYOTEI" < '${nextFirstDay}')`,
    getWhere: ({firstDay, nextFirstDay}) => ({
      AND: [{NOT: {DD_FR: {gte: firstDay, lt: nextFirstDay}}}, {CUSTOM_DD_SEISANYOTEI: {gte: firstDay, lt: nextFirstDay}}],
    }),
  },
  J: {
    getSql: ({firstDay, nextFirstDay}) => {
      const monthStr = firstDay.slice(0, 7)
      return `"DD_FR" IS NULL
      AND "CUSTOM_DD_SEISANYOTEI" IS NULL
      AND "CUSTOM_FR_SUFFIX" IS NULL
      AND (substring("CUSTOM_FR_DATE",1,7) = '${monthStr}')`
    },
    getWhere: ({firstDay, nextFirstDay}) => {
      const monthStr = formatDate(firstDay).slice(0, 7)
      return {
        AND: [
          {NOT: {DD_FR: {gte: firstDay, lt: nextFirstDay}}},
          {NOT: {CUSTOM_DD_SEISANYOTEI: {gte: firstDay, lt: nextFirstDay}}},
          {CUSTOM_FR_SUFFIX: {in: ['A', 'B']}},
          {CUSTOM_FR_DATE: {startsWith: monthStr}},
        ],
      }
    },
  },
  K: {
    getSql: ({firstDay, nextFirstDay}) =>
      `"DD_FR" IS NULL
      AND "CUSTOM_DD_SEISANYOTEI" IS NULL
      AND "CUSTOM_FR_SUFFIX" IS NULL
      AND "CUSTOM_FR_DATE" IS NULL
      AND ("m1_toroku_prediction" >= '${firstDay}' AND "m1_toroku_prediction" < '${nextFirstDay}')`,
    getWhere: ({firstDay, nextFirstDay}) => {
      const monthStr = formatDate(firstDay).slice(0, 7)
      return {
        AND: [
          {NOT: {DD_FR: {gte: firstDay, lt: nextFirstDay}}},
          {NOT: {CUSTOM_DD_SEISANYOTEI: {gte: firstDay, lt: nextFirstDay}}},
          {NOT: {AND: [{CUSTOM_FR_SUFFIX: {in: ['A', 'B']}}, {CUSTOM_FR_DATE: {startsWith: monthStr}}]}},
          {m1_toroku_prediction: {gte: firstDay, lt: nextFirstDay}},
        ],
      }
    },
  },
}

// O/P1/P2/Q: 登録段階
// O: 登録完了（DD_TOUROKUがBC）
// P1: Oに該当せず、登録予定日(lastApprovedDesiredTorokuDate)がBC
// P2: O/P1に該当せず、登録見込み(m1_toroku_prediction)がBC
// Q: O/P1/P2に該当しない
const atomicO: Record<GroupO, AtomicPredicate> = {
  O: {
    getSql: ({firstDay, nextFirstDay}) =>
      `("DD_TOUROKU" IS NULL OR ("DD_TOUROKU" >= '${firstDay}' AND "DD_TOUROKU" < '${nextFirstDay}')) `,
    getWhere: ({firstDay, nextFirstDay}) => ({DD_TOUROKU: {gte: firstDay, lt: nextFirstDay}}),
  },
  P1: {
    getSql: ({firstDay, nextFirstDay}) =>
      `"DD_TOUROKU" IS NULL
        AND ("lastApprovedDesiredTorokuDate" >= '${firstDay}'
        AND "lastApprovedDesiredTorokuDate" < '${nextFirstDay}')
        `,
    getWhere: ({firstDay, nextFirstDay}) => ({
      AND: [
        //
        {DD_TOUROKU: null},
        {lastApprovedDesiredTorokuDate: {gte: firstDay, lt: nextFirstDay}},
      ],
    }),
  },
  P2: {
    getSql: ({firstDay, nextFirstDay}) =>
      `"DD_TOUROKU" IS NULL AND "lastApprovedDesiredTorokuDate" IS NULL
    AND ("m1_toroku_prediction" >= '${firstDay}' AND "m1_toroku_prediction" < '${nextFirstDay}')
    `,
    getWhere: ({firstDay, nextFirstDay}) => ({
      AND: [
        //
        {DD_TOUROKU: null},
        {lastApprovedDesiredTorokuDate: null},
        {m1_toroku_prediction: {gte: firstDay, lt: nextFirstDay}},
      ],
    }),
  },
  Q: {
    getSql: ({firstDay, nextFirstDay}) =>
      `"DD_TOUROKU" IS NULL AND "lastApprovedDesiredTorokuDate" IS NULL AND "m1_toroku_prediction" IS NULL`,
    getWhere: ({firstDay, nextFirstDay}) => ({
      AND: [
        {NOT: {DD_TOUROKU: {gte: firstDay, lt: nextFirstDay}}},
        {NOT: {lastApprovedDesiredTorokuDate: {gte: firstDay, lt: nextFirstDay}}},
        {NOT: {m1_toroku_prediction: {gte: firstDay, lt: nextFirstDay}}},
      ],
    }),
  },
}

const compose = (key: CompositeKey): Predicate => {
  const [a, h, o] = key.split('_') as [GroupA, GroupH, GroupO]
  const keyStr = `${a}_${h}_${o}`
  return {
    key: keyStr,
    getSql: ({firstDay, nextFirstDay}) => {
      const aSql = atomicA[a].getSql({firstDay, nextFirstDay})
      const hSql = atomicH[h].getSql({firstDay, nextFirstDay})
      const oSql = atomicO[o].getSql({firstDay, nextFirstDay})
      return `(${aSql}) AND (${hSql}) AND (${oSql})`
    },
    getWhere: ({firstDay, nextFirstDay}) => {
      const aw = atomicA[a].getWhere({firstDay, nextFirstDay})
      const hw = atomicH[h].getWhere({firstDay, nextFirstDay})
      const ow = atomicO[o].getWhere({firstDay, nextFirstDay})
      return {AND: [aw, hw, ow]}
    },
  }
}

export const predicates: Predicate[] = [
  // A系
  compose('A_H_O'),
  compose('A_H_P1'),
  compose('A_H_P2'),
  compose('A_H_Q'),
  compose('A_I_O'),
  compose('A_I_P1'),
  compose('A_I_P2'),
  compose('A_I_Q'),
  compose('A_J_O'),
  compose('A_J_P1'),
  compose('A_J_P2'),
  compose('A_J_Q'),
  compose('A_K_O'),
  compose('A_K_P1'),
  compose('A_K_P2'),
  compose('A_K_Q'),
  // B系
  compose('B_H_O'),
  compose('B_H_P1'),
  compose('B_H_P2'),
  compose('B_H_Q'),
  compose('B_I_O'),
  compose('B_I_P1'),
  compose('B_I_P2'),
  compose('B_I_Q'),
  compose('B_J_O'),
  compose('B_J_P1'),
  compose('B_J_P2'),
  compose('B_J_Q'),
  compose('B_K_O'),
  compose('B_K_P1'),
  compose('B_K_P2'),
  compose('B_K_Q'),
  // C系
  compose('C_H_O'),
  compose('C_H_P1'),
  compose('C_H_P2'),
  compose('C_H_Q'),
  compose('C_I_O'),
  compose('C_I_P1'),
  compose('C_I_P2'),
  compose('C_I_Q'),
  compose('C_J_O'),
  compose('C_J_P1'),
  compose('C_J_P2'),
  compose('C_J_Q'),
  compose('C_K_O'),
  compose('C_K_P1'),
  compose('C_K_P2'),
  compose('C_K_Q'),
]

export const findPredicate = (key: string) => predicates.find(p => p.key === key)
