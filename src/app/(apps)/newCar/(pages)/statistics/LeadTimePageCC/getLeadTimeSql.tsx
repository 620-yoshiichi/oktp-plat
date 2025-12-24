import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import {LeadTimeColumnList} from '@app/(apps)/newCar/(pages)/statistics/LeadTimePageCC/LeadTimeColumnsList'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {leadTimeSql, newCarSql} from '@app/(apps)/newCar/(models)/newCarSql'
import {Days} from '@cm/class/Days/Days'

export type getLeadTimeSqlType = (props: {additionalWherePhrase?: string}) => {leadTimeDetailSql: string; leadTimeAggSql: string}
export const getLeadTimeSql = ({from, to, dataKey, groupBySelect, groupBy, orderBy, additionalWherePhrase}) => {
  //集計レコードの取得
  const leadTimeAggSql = sql`
  WITH "LeadTimes" AS (${newCarSql.subQuery.getleadTimeFields()})

  SELECT
    COUNT("NewCar"."id") AS "count",
    ${groupBySelect},
    ${leadTimeSql.getAvgOrMedianCols(`average`)}

    FROM "NewCar"
      LEFT JOIN "Store" AS "Store" ON "Store"."id" = "NewCar"."storeId"
      LEFT JOIN "User" AS "User" ON "User"."id" = "NewCar"."userId"
      LEFT JOIN "Store" AS "UserStore" ON "UserStore"."id" = "User"."storeId"
    LEFT JOIN "LeadTimes" ON "LeadTimes"."id" = "NewCar"."id"

    WHERE
      "${dataKey}" >= '${formatDate(from)}'
        AND "${dataKey}" < '${formatDate(Days.month.getNextMonthLastDate(to, 0))}'

    GROUP BY ${groupBy}
    ORDER BY ${orderBy}
    `

  //明細レコードの取得
  const leadTimeDetailSql = sql`
  WITH "LeadTimes" AS (${newCarSql.subQuery.getleadTimeFields()})

  SELECT
    "NO_CYUMON",
    "KJ_KAINMEI1",
    "KJ_MEIGIME1",
    "KJ_KURUMAME",
    "DD_NOSYA",
    "UserStore"."name" AS "storeName",
    "UserStore"."code" AS "storeCode",
    "User"."code" AS "userCode",
    "User"."name" AS "userName",
    ${leadTimeSql.getLeadTimeFields()}

    FROM "NewCar"
      LEFT JOIN "Store" AS "Store" ON "Store"."id" = "NewCar"."storeId"
      LEFT JOIN "User" AS "User" ON "User"."id" = "NewCar"."userId"
      LEFT JOIN "Store" AS "UserStore" ON "UserStore"."id" = "User"."storeId"
      LEFT JOIN "LeadTimes" ON "LeadTimes"."id" = "NewCar"."id"

    WHERE
      "${dataKey}" >= '${formatDate(from)}'
        AND "${dataKey}" < '${formatDate(Days.month.getNextMonthLastDate(to, 0))}'
        ${additionalWherePhrase ?? ''}




    ORDER BY ${orderBy}`

  return {
    leadTimeAggSql,
    leadTimeDetailSql,
  }
}

export const getGroupByProps = ({commonFilterQuery}) => {
  let groupBy = ''
  let selectCols: any[] = []
  let groupBySelect = ''
  let orderBy = ''
  const sortTargetCol = LeadTimeColumnList.find(d => d.sortTarget)
  const sortFieldKey = sortTargetCol?.avgDataKey

  if (commonFilterQuery.by === '店舗') {
    selectCols = [
      {label: `店舗コード`, key: `storeCode`, sql: sql`"Store"."code" AS "storeCode"`},
      {label: `店舗`, key: `storeName`, sql: sql`"Store"."name" AS "storeName"`},
    ]
    groupBySelect = selectCols.map(d => d.sql).join(',')
    groupBy = sql`"storeCode" , "storeName"`

    if (commonFilterQuery.sort === 'CODE') {
      orderBy = sql`"storeCode" ASC`
    } else if (commonFilterQuery.sort === 'ASC') {
      orderBy = sql`"${sortFieldKey}" ASC`
    } else if (commonFilterQuery.sort === 'DESC') {
      orderBy = sql`"${sortFieldKey}"  DESC`
    }
  } else if (commonFilterQuery.by === 'スタッフ') {
    selectCols = [
      {label: `店舗`, key: `storeName`, sql: sql`"UserStore"."name" AS "storeName"`},
      {label: `スタッフコード`, key: `userCode`, sql: sql`"User"."code" AS "userCode"`},
      {label: `スタッフ`, key: `userName`, sql: sql`"User"."name" AS "userName"`},
    ]
    groupBySelect = selectCols.map(d => d.sql).join(',')

    groupBy = sql`
    "storeName", "userCode" , "userName"
    `

    if (commonFilterQuery.sort === 'CODE') {
      orderBy = sql`"userCode" ASC`
    } else if (commonFilterQuery.sort === 'ASC') {
      orderBy = sql`"${sortFieldKey}" ASC`
    } else if (commonFilterQuery.sort === 'DESC') {
      orderBy = sql`"${sortFieldKey}" DESC`
    }
  }

  return {
    selectCols,
    groupBy,
    groupBySelect,
    orderBy,
  }
}
