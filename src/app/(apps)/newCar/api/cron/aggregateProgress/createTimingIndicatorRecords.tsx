// import {Days} from '@cm/class/Days/Days'
// import {getMidnight} from '@cm/class/Days/date-utils/calculations'
// import {formatDate} from '@cm/class/Days/date-utils/formatters'
// import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
// import {useRawSql} from '@cm/class/SqlBuilder/useRawSql'
// import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
// import {Prisma} from '@prisma/client'

// export const createTimingIndicatorRecords = async ({ProgressAggregationTable, queryByThisMonth = true}) => {
//   const transactionQueryList: transactionQuery[] = []
//   const aggregationFields = [
//     {timing: `m0Status`, count: `m0StatusCount`, alert: `DD_FR`},
//     {timing: `m1Status`, count: `m1StatusCount`, alert: `m1Alert`},
//     {timing: `m2Status`, count: `m2StatusCount`, alert: `m2Alert`},
//   ]

//   const {firstDayOfMonth, lastDayOfMonth} = Days.month.getMonthDatum(getMidnight())

//   for (const field of aggregationFields) {
//     const {timing} = field
//     const {rows} = await useRawSql({
//       sql: sql`
//      SELECT
//        CURRENT_DATE as date,
//        car."storeId",
//        car."${field.timing}" as label,
//        COUNT(car."${field.timing}")::INT as count -- カウント
//      FROM  "NewCar" car
//      LEFT JOIN  "Store" s on s.id  = car."storeId"

//      --今月中に条件発生したものに限る
//      ${
//        queryByThisMonth
//          ? `where
//       car."${field.alert}" is not null
//       AND car."${field.alert}" >= '${formatDate(firstDayOfMonth)}'
//       AND car."${field.alert}" <= '${formatDate(lastDayOfMonth)}'`
//          : ``
//      }

//      GROUP BY   s."code", "storeId",s."name", "${field.timing}"
//      ORDER BY  s.code asc , "${field.timing}"  asc
//    `,
//     })

//     for (const row of rows) {
//       const progressAggregationTableId = ProgressAggregationTable.find(data => row?.storeId === data?.storeId)?.id ?? 0

//       if (!progressAggregationTableId) {
//         continue
//       }

//       const payload = {timing, label: row.label, count: row.count, progressAggregationTableId}
//       const args: Prisma.ProgressAggregationTableRecordUpsertArgs = {
//         where: {
//           progressAggregationTableId_timing_label_unique: {
//             progressAggregationTableId,
//             timing: payload.timing,
//             label: payload.label,
//           },
//         },
//         create: payload,
//         update: payload,
//       }
//       transactionQueryList.push({
//         model: `progressAggregationTableRecord`,
//         method: `upsert`,
//         queryObject: args,
//       })
//       // await prisma.progressAggregationTableRecord.upsert(args)
//     }
//   }

//   const res = await doTransaction({transactionQueryList})

//   return res
// }
