import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import {useRawSql} from '@cm/class/SqlBuilder/useRawSql'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {Prisma} from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'
import {newCarAppUserWhere} from '@app/(apps)/newCar/(constants)/forSelectConfig'
import {Days} from '@cm/class/Days/Days'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

/**
 * 日次集計バッチ
 * 月末に進捗データを集計する
 */
export const executeAggregateProgress = async () => {
  const users = await prisma.user.findMany({
    where: newCarAppUserWhere,
  })

  const transactionQueryList: transactionQuery<'userProgressAggregationTable', 'upsert'>[] = []

  const aggregationFields = [
    {timing: `m0Status`, count: `m0StatusCount`, alert: `DD_FR`},
    {timing: `m1Status`, count: `m1StatusCount`, alert: `m1Alert`},
    {timing: `m2Status`, count: `m2StatusCount`, alert: `m2Alert`},
  ]

  const queryByThisMonth = true
  const {firstDayOfMonth, lastDayOfMonth} = Days.month.getMonthDatum(getMidnight())

  for (const field of aggregationFields) {
    const {timing} = field
    const {rows} = await useRawSql({
      sql: sql`
    WITH RECURSIVE status_values AS (
      SELECT DISTINCT "${field.timing}" as label
      FROM "NewCar"
      WHERE "${field.timing}" IS NOT NULL
    ),
    user_status_combinations AS (
      SELECT
        u.id as "userId",
        u."storeId",
        sv.label
      FROM "User" u
      CROSS JOIN status_values sv
      where id in (${users.map(user => user.id).join(',')})
    )


    SELECT
      COALESCE(COUNT(car."${field.timing}")::INT, 0) as count,
      usc."userId",
      usc."storeId",
      usc.label
    FROM user_status_combinations usc
    LEFT JOIN "NewCar" car ON
      car."userId" = usc."userId"
      AND car."${field.timing}" = usc.label
      ${
        queryByThisMonth
          ? sql`AND car."${field.alert}" is not null
             AND car."${field.alert}" >= '${formatDate(firstDayOfMonth)}'
             AND car."${field.alert}" <= '${formatDate(lastDayOfMonth)}'`
          : sql``
      }
    GROUP BY
      usc."userId",
      usc."storeId",
      usc.label
    ORDER BY
      usc."userId",
      usc.label
  `,
    })

    for (const row of rows) {
      const payload = {
        date: getMidnight(),
        timing,
        label: row.label,
        storeId: row.storeId,
        userId: row.userId,
        count: row.count,
      }
      const args: Prisma.UserProgressAggregationTableUpsertArgs = {
        where: {
          date_userId_timing_label_unique: {
            date: getMidnight(),
            timing,
            label: row.label,
            userId: row.userId,
          },
        },
        create: payload,
        update: payload,
      }
      transactionQueryList.push({
        model: `userProgressAggregationTable`,
        method: `upsert`,
        queryObject: args,
      })
    }
  }

  const res = await doTransaction({transactionQueryList})
  console.debug(res)

  return {success: true, message: '日次集計完了', result: {count: transactionQueryList.length}}
}
