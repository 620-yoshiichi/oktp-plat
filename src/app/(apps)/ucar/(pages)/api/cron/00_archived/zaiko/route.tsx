import {NextRequest, NextResponse} from 'next/server'

import {isCron} from 'src/non-common/serverSideFunction'

export const GET = async (req: NextRequest) => {
  if ((await isCron({req})) === false) {
    const res = {success: false, message: `Unauthorized`, result: null}
    const status = {status: 401, statusText: `Unauthorized`}
    return NextResponse.json(res, status)
  }

  return NextResponse.json({success: true, message: `Nothing happened`, result: null})
  // const result = {}
  // const ZAIKO_Base_tmp_BQ = new BQ({datasetId: 'OrdersDB', tableId: 'ZAIKO_Base_tmp'})

  // const yesterday = formatDate(subDays(getMidnight(), subDaysCount))

  // const updateTargetInKobutsu = await ZAIKO_Base_tmp_BQ.GET({
  //   sqlString: sql`
  //   SELECT APPINDEX, NO_SYARYOU, CD_ZAIKOTEN
  //   FROM okayamatoyopet.OrdersDB.ZAIKO_Base_tmp
  //   WHERE DT_SAISINUP >= '${yesterday}'`,
  // })

  // const NO_SYARYOU = updateTargetInKobutsu.map(obj => UcarCL.converter.shapeNumber98(obj.NO_SYARYOU))

  // const stores = await prisma.store.findMany({})

  // const targetCarsInDb = await prisma.ucar.findMany({
  //   select: {
  //     id: true,
  //     Number98: {select: {number: true}},
  //   },
  //   where: {Number98: {number: {in: NO_SYARYOU}}},
  //   orderBy: [{createdAt: 'desc'}],
  // } as Prisma.UcarFindManyArgs)

  // const queries: transactionQuery[] = []

  // targetCarsInDb.forEach(carInDb => {
  //   const carToUpdate = updateTargetInKobutsu.find(kobutsuUcar =>
  //     UcarCL.converter.matchSateiWithKobutsu({ucar: carInDb, kobutsuUcar})
  //   )

  //   if (carToUpdate) {
  //     const store = stores.find(obj => Number(obj.code) === Number(carToUpdate.CD_ZAIKOTEN))

  //     queries.push({
  //       method: 'update',
  //       model: 'ucar',
  //       queryObject: {
  //         where: {id: carInDb.id},
  //         data: {
  //           CD_ZAIKOTEN: carToUpdate?.CD_ZAIKOTEN,
  //           CD_ZAIKOTEN_NAME: store?.name,
  //         },
  //       },
  //     })
  //   }
  // })

  // const {result: updatedUcarData} = await doTransaction({transactionQueryList: queries})
  // console.debug(`${updatedUcarData.length}件のデータを更新しました。`)

  // result[`updatedUcarData`] = updatedUcarData.length

  // return NextResponse.json(result)
}
