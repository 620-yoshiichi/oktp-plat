// import {BQ} from '@app/api/google/big-query/BigQuery'
// import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
// import {ObjectMap} from '@cm/lib/methods/common'
// import {BQ_parser} from '@app/api/google/big-query/bigQueryParser'
// import {Prisma} from '@prisma/client'
// import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
// import {doTransactionUcarBaseList} from '@app/(apps)/ucar/(pages)/api/seeder/oldProcess/helper/upsertUcarBaseLIst'

// type processData = {
//   sateiId: string
//   Sorting_results: string
//   datetime_0: any
//   email_0: string
//   store_0: string
//   runnable_0: string
//   remarks_0: string
//   shitadoriKubun_0: string
//   orderNumber_0: string
//   datetime_1: string
//   datetime_2: string
//   datetime_3: string
//   datetime_4: string
//   datetime_6: string
//   datetime_7: string
//   datetime_8: string
//   datetime_9: string
//   datetime_11: string
//   datetime_12: string
//   datetime_13: string
//   datetime_14: string
//   max_update: string
// }

// /**
//  * 旧QR工程チェックデータをBigQueryから取得
//  * ucarテーブルに反映する */
// export const upsertQrProcessDataFromBigQuery = async ({offset, limit, users, adminUser, processes}) => {
//   //BQ: Ucar_QR, QR_Prosess データを取得
//   const allData = await new BQ({datasetId: 'Ucar_QR', tableId: 'QR_Prosess'}).GET({
//     sqlString: sql`
//   SELECT *
//   FROM okayamatoyopet.Ucar_QR.QR_Prosess
//   LIMIT ${limit}
//   ${offset ? `OFFSET ${offset}` : ``}
//   `,
//   })

//   // データをクレンジング
//   const cleansedData = allData.map(d => {
//     return ObjectMap(d, (key, value) => {
//       return BQ_parser.parseDate(value)
//     }) as processData
//   })

//   // 手始めにQRシート発行データのみを作成し、その他のプロセスのリストを作成する。
//   const ucarBaseUpsertRes = await doTransactionUcarBaseList({cleansedData, users, adminUser, processes})

//   if (!ucarBaseUpsertRes.success) {
//     throw new Error(`ucarBaseUpsertRes.success is false`)
//   }

//   const transactionQueryList: transactionQuery[] = []

//   if (ucarBaseUpsertRes.result) {
//     // シート発行以外のプロセスデータを作成する。
//     ucarBaseUpsertRes.result.forEach(ucar => {
//       const list = ucar.list

//       list?.forEach(d => {
//         const {theProcessMaster, date} = d ?? {}

//         const ucarProcessArgs: Prisma.UcarProcessUpsertArgs = {
//           where: {
//             unique_sateiID_date_processCode: {
//               sateiID: ucar?.sateiID,
//               ucarProcessMasterId: theProcessMaster.id,
//               date: date,
//             },
//           },
//           create: {
//             dataSource: `spreadsheet`,
//             Ucar: {connect: {sateiID: ucar?.sateiID}},
//             User: {connect: {id: ucar?.userId ?? 0}},
//             Store: {connect: {id: ucar?.storeId ?? 0}},
//             processCode: theProcessMaster.code,
//             date: date,
//           },
//           update: {date},
//         }

//         transactionQueryList.push({
//           model: `ucarProcess`,
//           method: `upsert`,
//           queryObject: ucarProcessArgs,
//         })

//         const lastUpdatedProcessMaster = list[list.length - 1]

//         // let LastProcessData
//         if (lastUpdatedProcessMaster?.theProcessMaster) {
//           transactionQueryList.push({
//             model: `ucar`,
//             method: `update`,
//             queryObject: {
//               where: {id: ucar?.id},
//               data: {
//                 ucarLastProcessMasterId: lastUpdatedProcessMaster.theProcessMaster.id,
//               },
//             },
//           })
//         }
//       })
//     })
//   }

//   const ucarProcessMasterUpsertRes = await doTransaction({transactionQueryList})

//   return {
//     ucarBaseUpsertRes,
//     ucarProcessMasterUpsertRes,
//   }
// }
