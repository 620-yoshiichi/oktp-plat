import {GoogleDrive_GeneratePdf} from '@app/api/google/actions/driveAPI'
import {GoogleSheet_BatchUpdate, getSheetIdx, GoogleSheet_GetSheetList} from '@app/api/google/actions/sheetAPI'

import {SheetRequests} from '@app/api/google/actions/SheetRequests'
import {UCAR_GOOGLE_CONSTANTS} from '@app/(apps)/ucar/(constants)/ucar-google-constants'
import {UcarCL} from '../../UcarCL'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
export const requestDeliberySS = async ({sateiID, type}) => {
  const ucar = await UcarCL.fetcher.getUcarDataBySateiId(sateiID)

  const NOTICE = type === `配送手配` ? UCAR_GOOGLE_CONSTANTS.hikitoriNotice : UCAR_GOOGLE_CONSTANTS.cancelNotice

  const {SS_URL, SH_NAME, parentFolderIds} = NOTICE

  // const baseUrl = isDev ? 'https://oktp-plat.vercel.app' : process.env.NEXT_PUBLIC_BASEPATH
  // `${process.env.NEXT_PUBLIC_BASEPATH}/ucar/create-process?sateiID=${sateiID}&processCode=${processCode}`
  const getProcessEnterPass = (processCode: string) =>
    `=ENCODEURL("http://localhost:3000/ucar/create-process?sateiID=${sateiID}&processCode=${processCode}")`

  const {CR_HAISO_JURYO, CR_CHAKU} = UcarProcessCl.CODE.raw

  const HAISO_JURYO_QR_URL = getProcessEnterPass(CR_HAISO_JURYO.code)
  const TOCHAKU_JURYO_QR_URL = getProcessEnterPass(CR_CHAKU.code)

  const {
    notation: {plate, modelName, modelYear, nenshiki},
  } = new UcarCL(ucar)

  try {
    const updateRow = [
      ucar.storeToPickUp ?? '',
      modelName ?? '',
      ucar.runnable ? `可` : `不可`,
      new Date(),
      plate,
      '',
      '',
      ucar.remarks ?? '',
      nenshiki ?? '',
    ]

    const formulas = [HAISO_JURYO_QR_URL, TOCHAKU_JURYO_QR_URL]

    console.time('PDFを生成処理')
    const sheetList = await GoogleSheet_GetSheetList({spreadsheetId: SS_URL})
    const upDateSheetId = await getSheetIdx({sheetList, sheetName: SH_NAME})

    console.debug('PDFを生成処理①')

    const SS_ID = SS_URL

    console.debug('PDFを生成処理②')

    if (upDateSheetId) {
      await GoogleSheet_BatchUpdate({
        spreadsheetId: SS_ID,
        requests: [
          //
          ...updateRow.map((v, i) => SheetRequests.updateCell(upDateSheetId ?? 0, 1, 10 + i, v)),
          ...formulas.map((v, i) => SheetRequests.setFormula(upDateSheetId ?? 0, 2, 10 + i, v)),
        ],
      })
    }

    console.debug('PDFを生成処理③')
    const generatePdf_res = await GoogleDrive_GeneratePdf({spreadsheetId: SS_ID, parentFolderIds})

    console.debug(generatePdf_res)

    console.timeEnd('PDFを生成処理')

    return {success: true, message: `CRへ配送手配を実施しました。`}
  } catch (error) {
    return {success: false, message: `CRへ配送手配時にエラーが発生しました。管理者まで連絡してください。`}
  }
}
