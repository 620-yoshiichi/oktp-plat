import {NextRequest, NextResponse} from 'next/server'
import {isCron} from 'src/non-common/serverSideFunction'

// kobutsu = 古物台帳
// 古物台帳のデータを同期するためのAPI

export const GET = async (req: NextRequest) => {
  if ((await isCron({req})) === false) {
    const res = {success: false, message: `Unauthorized`, result: null}
    const status = {status: 401, statusText: `Unauthorized`}
    return NextResponse.json(res, status)
  }

  return NextResponse.json({success: true, message: `Nothing happened`, result: null})
  // const sateiIdList = await prisma.qR_Prosess.findMany({
  //   distinct: [`sateiId`],
  //   select: {sateiId: true},
  // })

  // await processBatchWithRetry({
  //   soruceList: sateiIdList,
  //   mainProcess: async batch => {
  //     return await doTransaction({
  //       transactionQueryList: batch.map(qr => {
  //         return {
  //           model: `ucar`,
  //           method: `upsert`,
  //           queryObject: {
  //             where: {sateiID: qr.sateiId},
  //             ...createUpdate({
  //               sateiID: qr.sateiId,
  //               sateiDataConfirmedAt: new Date(),
  //             }),
  //           },
  //         }
  //       }),
  //     })
  //   },
  // })
}
