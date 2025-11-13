// import {subDaysCount} from '@app/(apps)/ucar/(pages)/api/cron/subDaysCount'
// import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'
// import {BQ} from '@app/api/google/big-query/BigQuery'
// import {formatDate} from '@cm/class/Days/date-utils/formatters'
// import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
// import prisma from 'src/lib/prisma'
// import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
// import {Prisma} from '@prisma/client'
// import {subDays} from 'date-fns'
// import {NextRequest, NextResponse} from 'next/server'
// import {isCron} from 'src/non-common/serverSideFunction'

// // kobutsu = 古物台帳
// // 古物台帳のデータを同期するためのAPI

// export const GET = async (req: NextRequest) => {
//   if ((await isCron({req})) === false) {
//     const res = {success: false, message: `Unauthorized`, result: null}
//     const status = {status: 401, statusText: `Unauthorized`}
//     return NextResponse.json(res, status)
//   }

//   const stores = await prisma.store.findMany({})
//   const result = {}
//   const yesterday = formatDate(subDays(getMidnight(), subDaysCount))
//   const BQ_OldCars_Base = new BQ({datasetId: 'OrdersDB', tableId: 'OldCars_Base'})

//   // 指定期間の古物台帳のデータを取得
//   const updateTargetInKobutsu = await BQ_OldCars_Base.GET({
//     sqlString: sql`
//     SELECT
//     a.APPINDEX,
//     a.KI_HANKAKA,
//     a.NO_SYARYOU,
//     a.DT_SAISINUP,
//     a.NO_SYADAIBA,
//     a.NO_SIRETOSE,
//     b.CD_ZAIKOTEN,

//     FROM okayamatoyopet.OrdersDB.OldCars_Base a
//     left join okayamatoyopet.OrdersDB.ZAIKO_Base_tmp b on b.NO_SYARYOU = a.NO_SYARYOU
//     WHERE a.DT_SAISINUP >= '${yesterday}'
//   `,
//   })

//   // 98番号のリストを作成
//   const NO_SYARYOU = updateTargetInKobutsu.map(obj => UcarCL.converter.shapeNumber98(obj.NO_SYARYOU))

//   const targetCarsInDb = await prisma.ucar.findMany({
//     select: {
//       id: true,
//       Assessment_ID: true,
//       Number98: {select: {number: true}},
//       Barracks: true,
//       number: true,
//     },
//     where: {
//       Number98: {
//         number: {in: NO_SYARYOU},
//       },
//     },

//     orderBy: [{arrivedAt: `desc`}, {createdAt: 'desc'}],
//   } as Prisma.UcarFindManyArgs)

//   const queries: transactionQuery[] = []

//   const updated = {}
//   targetCarsInDb.forEach(car => {
//     const carToUpdate = updateTargetInKobutsu.find(kobutsuItem => {
//       const match = UcarCL.converter.matchSateiWithKobutsu({
//         ucar: car,
//         kobutsuUcar: kobutsuItem,
//       })

//       return match
//     })
//     if (carToUpdate) {
//       // ====重複チェックのため、残す=========
//       if (updated[String(car.id)]) {
//         console.warn(updated[String(car.id)])
//       }
//       updated[String(carToUpdate.id)] = true
//       // ================================

//       const {KI_HANKAKA, CD_ZAIKOTEN} = carToUpdate
//       const store = stores.find(obj => Number(obj.code) === Number(CD_ZAIKOTEN))
//       queries.push({
//         method: 'update',
//         model: 'ucar',
//         queryObject: {
//           where: {id: car.id},
//           data: {
//             KI_HANKAKA: Number(KI_HANKAKA),
//             CD_ZAIKOTEN: Number(CD_ZAIKOTEN),
//             CD_ZAIKOTEN_NAME: store?.name,
//           },
//         },
//       })
//     }
//   })

//   const {result: updatedUcarData} = await doTransaction({transactionQueryList: queries})
//   // console.debug(`${updatedUcarData.length}件のデータを更新しました。`)
//   result[`updatedUcarData`] = updatedUcarData.length

//   return NextResponse.json(result)
// }
