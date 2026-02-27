'use server'

import {ProgressReportRecord, Month} from '@app/(apps)/newCar/class/ProgressReport/(lib)/getWheres'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import {useRawSql} from '@cm/class/SqlBuilder/useRawSql'
import {addMonths} from 'date-fns'

const INCOMPLETE_STATUSES = [`対象`, `遅れ`]
const INCOMPLETE_IN = INCOMPLETE_STATUSES.map(s => `'${s}'`).join(', ')

const METRIC_KEYS = [
  'FR_THIS_MONTH',
  'CUSTOM_DD_SEISANYOTEI',
  'm2_target',
  'm2_Set',
  'm2_remaining',
  'm1_target',
  'm1_Set',
  'm1_remaining',
  'nousha_target',
  'nousha_Set',
  'nousha_remaining',
  'nousha_Avhieved',
] as const

const buildScopeWhere = ({newCarWhere, userId, storeId}: {newCarWhere: any; userId: any; storeId: any}): string => {
  const conditions: string[] = []

  if (newCarWhere?.OR && Array.isArray(newCarWhere.OR)) {
    const orParts = newCarWhere.OR.map(part => {
      const sub: string[] = []
      if (part.userId != null) sub.push(`"userId" = ${Number(part.userId)}`)
      if (part.storeId != null) sub.push(`"storeId" = ${Number(part.storeId)}`)
      return sub.length > 0 ? sub.join(' AND ') : null
    }).filter(Boolean)
    if (orParts.length > 0) conditions.push(`(${orParts.join(' OR ')})`)
  } else {
    if (newCarWhere?.userId != null) conditions.push(`"userId" = ${Number(newCarWhere.userId)}`)
    if (newCarWhere?.storeId != null) conditions.push(`"storeId" = ${Number(newCarWhere.storeId)}`)
  }

  if (userId != null && !conditions.some(c => c.includes('"userId"'))) {
    conditions.push(`"userId" = ${Number(userId)}`)
  }
  if (storeId != null && !conditions.some(c => c.includes('"storeId"'))) {
    conditions.push(`"storeId" = ${Number(storeId)}`)
  }

  return conditions.length > 0 ? conditions.join(' AND ') : '1=1'
}

const buildCommonWhereSql = (): string => {
  // @see newCar-constants.tsx COMMON_WHERE_CORE (isNewCommonWhereApplied = true since 2025-09-01)
  return [
    `("DD_TOUROKU" >= '2025-03-01' OR "DD_TOUROKU" IS NULL)`,
    `NOT ("NO_CYUMON" LIKE '98%' AND "DD_JUCYU" < '2021-01-01')`,
    `"DD_TORIKESI" IS NULL`,
  ].join(' AND ')
}

export const cacheFetchProgressReportRecords = async ({
  months,
  newCarWhere,
  userId,
  storeId,
}: {
  months: Month[]
  newCarWhere: any
  userId: any
  storeId: any
}) => {
  const scopeWhere = buildScopeWhere({newCarWhere, userId, storeId})
  const commonWhere = buildCommonWhereSql()

  const allRecords: ProgressReportRecord[] = []

  for (const month of months) {
    if (month === '過去') continue

    const monthDate = new Date(month)
    const nextMonthDate = addMonths(monthDate, 1)
    const monthStart = monthDate.toISOString()
    const monthEnd = nextMonthDate.toISOString()

    const inMonth = (field: string) => `"${field}" >= '${monthStart}' AND "${field}" < '${monthEnd}'`

    const query = sql`
      SELECT
        COUNT(CASE WHEN ${inMonth('DD_FR')} THEN 1 END)::int AS "FR_THIS_MONTH",
        COUNT(CASE WHEN (${inMonth('DD_FR')}) OR (${inMonth('CUSTOM_DD_SEISANYOTEI')}) THEN 1 END)::int AS "CUSTOM_DD_SEISANYOTEI",

        COUNT(CASE WHEN ${inMonth('m2Alert')} THEN 1 END)::int AS "m2_target",
        COUNT(CASE WHEN ${inMonth('m2Alert')} AND ("m2Status" NOT IN (${INCOMPLETE_IN}) OR "m2Status" IS NULL) THEN 1 END)::int AS "m2_Set",
        COUNT(CASE WHEN ${inMonth('m2Alert')} AND "m2Status" IN (${INCOMPLETE_IN}) THEN 1 END)::int AS "m2_remaining",

        COUNT(CASE WHEN ${inMonth('m1Alert')} THEN 1 END)::int AS "m1_target",
        COUNT(CASE WHEN ${inMonth('m1Alert')} AND ("m1Status" NOT IN (${INCOMPLETE_IN}) OR "m1Status" IS NULL) THEN 1 END)::int AS "m1_Set",
        COUNT(CASE WHEN ${inMonth('m1Alert')} AND "m1Status" IN (${INCOMPLETE_IN}) THEN 1 END)::int AS "m1_remaining",

        COUNT(CASE WHEN ${inMonth('DD_FR')} THEN 1 END)::int AS "nousha_target",
        COUNT(CASE WHEN ${inMonth('DD_FR')} AND ("m0Status" NOT IN (${INCOMPLETE_IN}) OR "m0Status" IS NULL) THEN 1 END)::int AS "nousha_Set",
        COUNT(CASE WHEN ${inMonth('DD_FR')} AND "m0Status" IN (${INCOMPLETE_IN}) THEN 1 END)::int AS "nousha_remaining",
        COUNT(CASE WHEN ${inMonth('DD_NOSYA')} THEN 1 END)::int AS "nousha_Avhieved"

      FROM "NewCar"
      WHERE ${commonWhere}
        AND ${scopeWhere}
    `

    const {rows} = await useRawSql({sql: query})
    const row = rows[0]

    if (row) {
      for (const key of METRIC_KEYS) {
        allRecords.push({
          key,
          month,
          count: Number(row[key] ?? 0),
        })
      }
    }
  }

  return allRecords
}
