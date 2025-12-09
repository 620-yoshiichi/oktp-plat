// import {NextRequest, NextResponse} from 'next/server'

// import prisma from 'src/lib/prisma'
// import {BQ_parser} from '@app/api/google/big-query/bigQueryParser'
// import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
// import {doTransactionUcarBaseList} from '@app/(apps)/ucar/(pages)/api/seeder/oldProcess/helper/upsertUcarBaseLIst'
// import {ObjectMap} from '@cm/lib/methods/common'
// import {Prisma} from '@prisma/client'
// import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
// import {BQ} from '@app/api/google/big-query/BigQuery'
// import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
// type processData = ucarProcessType

// export const POST = async (req: NextRequest) => {
//   // await prisma.ucar.deleteMany({
//   //   where: {Assessment_ID: {not: ''}},
//   // })
//   // return NextResponse.json({
//   //   success: true,
//   //   message: `データを削除しました`,
//   // })
//   const result = {}
//   const {offset, limit} = await req.json()
//   console.log(offset, limit)

//   const adminUser = await prisma.user.findUnique({
//     where: {email: `admin@gmail.com`},
//   })

//   console.debug(`${offset + 1} 件目から ${offset + limit} 件目までのデータを更新します。`)

//   // マスタデータ取得

//   const [users] = await Promise.all([prisma.user.findMany()])

//   try {
//     //BQ: Ucar_QR, QR_Prosess データを取得
//     const allData = await new BQ({datasetId: 'Ucar_QR', tableId: 'QR_Prosess'}).GET({
//       sqlString: sql`
//   SELECT *
//   FROM okayamatoyopet.Ucar_QR.QR_Prosess
//   -- LIMIT ${limit}
//   -- ${offset ? `OFFSET ${offset}` : ``}
//   `,
//     })

//     await processBatchWithRetry({
//       soruceList: allData,
//       mainProcess: async batch => {
//         // データをクレンジング
//         const cleansedData = batch.map(d => {
//           return ObjectMap(d, (key, value) => {
//             return BQ_parser.parseDate(value)
//           }) as processData
//         })

//         // 手始めにQRシート発行データのみを作成し、その他のプロセスのリストを作成する。
//         const ucarBaseUpsertRes = await doTransactionUcarBaseList({
//           cleansedData,
//           users,
//           adminUser,
//           processes: [],
//         })

//         if (!ucarBaseUpsertRes.success) {
//           throw new Error(`ucarBaseUpsertRes.success is false`)
//         }

//         const transactionQueryList: (transactionQuery<'ucarProcess', 'upsert'> | transactionQuery<'ucar', 'update'>)[] = []

//         if (ucarBaseUpsertRes.result) {
//           // シート発行以外のプロセスデータを作成する。
//           ucarBaseUpsertRes.result.forEach(ucar => {
//             const list = ucar.list
//             list?.forEach(d => {
//               const {theProcessMaster, date} = d ?? {}
//               const unique_sateiID_date_processCode = {
//                 sateiID: ucar?.sateiID,
//                 processCode: theProcessMaster.code,
//                 date: date,
//               }
//               const ucarProcessArgs: Prisma.UcarProcessUpsertArgs = {
//                 where: {unique_sateiID_date_processCode},
//                 create: {
//                   dataSource: `spreadsheet`,
//                   ...unique_sateiID_date_processCode,
//                   userId: ucar?.userId ?? 0,

//                   date: date,
//                 },
//                 update: {date},
//               }

//               transactionQueryList.push({
//                 model: `ucarProcess`,
//                 method: `upsert`,
//                 queryObject: ucarProcessArgs,
//               })

//               const lastUpdatedProcessMaster = list[list.length - 1]

//               // let LastProcessData
//               if (lastUpdatedProcessMaster?.theProcessMaster) {
//                 transactionQueryList.push({
//                   model: `ucar`,
//                   method: `update`,
//                   queryObject: {
//                     where: {id: ucar?.id},
//                     data: {
//                       ucarLastProcessMasterId: lastUpdatedProcessMaster.theProcessMaster.id,
//                     },
//                   },
//                 })
//               }
//             })
//           })
//         }

//         const UpsertRes = await doTransaction({
//           transactionQueryList,
//         })
//       },
//     })

//     return NextResponse.json({
//       success: false,
//       message: '再度作り直す必要あり',
//     })
//     return NextResponse.json({
//       success: true,
//       message: `データを更新しました`,
//       result,
//     })
//   } catch (error) {
//     console.error(error.stack) //////////
//     return NextResponse.json({
//       success: false,
//       message: `データを更新できませんでした`,
//       error: error.stack,
//     })
//   } finally {
//     console.timeEnd(req.nextUrl.pathname)
//   }
// }
