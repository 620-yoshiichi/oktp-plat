import {GoogleDrive_GeneratePdf} from '@app/api/google/actions/driveAPI'
import {GoogleSheet_BatchUpdate, getSheetIdx, GoogleSheet_GetSheetList} from '@app/api/google/actions/sheetAPI'

import {SheetRequests} from '@app/api/google/actions/SheetRequests'
import {UCAR_GOOGLE_CONSTANTS} from '@app/(apps)/ucar/(constants)/ucar-google-constants'
import {UcarCL} from '../../UcarCL'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'
export const requestDeliberySS = async ({sateiID, type}) => {
  const ucar = await UcarCL.fetcher.getUcarDataBySateiId(sateiID)

  const NOTICE = type === `配送手配` ? UCAR_GOOGLE_CONSTANTS.hikitoriNotice : UCAR_GOOGLE_CONSTANTS.cancelNotice

  const {SS_URL, SH_NAME, parentFolderIds} = NOTICE

  const getProcessEnterPass = (processCode: string) =>
    `=ENCODEURL("${process.env.NEXT_PUBLIC_BASEPATH}/ucar/create-process?sateiID=${sateiID}&processCode=${processCode}")`

  const {CR_HAISO_JURYO, CR_CHAKU, CR_GENCHI_SHORI_YOSEI} = UcarProcessCl.CODE.raw

  const URL_CR_HAISO_JURYO = getProcessEnterPass(CR_HAISO_JURYO.code)
  const URL_GENTI_SHORI = getProcessEnterPass(CR_GENCHI_SHORI_YOSEI.code)
  const URL_CR_CHAKU = getProcessEnterPass(CR_CHAKU.code)

  const {
    notation
  } = new UcarCL(ucar)

  const  {plate, modelName, modelYear,
    chassisNumber,
    exteriorColor

  } = notation


  const runnableStr = UCAR_CODE.RUNNABLE.byCode(ucar.runnable ?? '')?.label

  try {
    const updateRow = [
      ucar.storeToPickUp ?? '',
      modelName ?? '',
      runnableStr,
      new Date(),
      plate,
      chassisNumber,
      exteriorColor,
      ucar.remarks ?? '',
      modelYear
    ]

    const urls = [URL_CR_HAISO_JURYO, URL_GENTI_SHORI, URL_CR_CHAKU]

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
          ...urls.map((v, i) => SheetRequests.setFormula(upDateSheetId ?? 0, 2, 10 + i, v)),
        ],
      })
    }

    console.debug('PDFを生成処理③')
    const generatePdf_res = await GoogleDrive_GeneratePdf({

      spreadsheetId: SS_ID,
      parentFolderIds,
      pdfName: `${ucar.sateiID}_${type}`
    })

    console.debug(generatePdf_res)

    console.timeEnd('PDFを生成処理')

    return {success: true, message: `CRへ配送手配を実施しました。`}
  } catch (error) {
    return {success: false, message: `CRへ配送手配時にエラーが発生しました。管理者まで連絡してください。`}
  }
}
