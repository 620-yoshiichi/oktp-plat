import {NextRequest, NextResponse} from 'next/server'

import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {Days} from '@cm/class/Days/Days'
import prisma from 'src/lib/prisma'
import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'
import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'
import {handlePrismaError} from '@cm/lib/prisma-helper'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {UCAR_CONSTANTS} from '@app/(apps)/ucar/(constants)/ucar-constants'

export const POST = async (req: NextRequest) => {
  const errors = {}
  const shiireGroupUser = await prisma.user.findFirst({
    where: {
      code: UCAR_CONSTANTS.shiireGroupUserCode,
    },
  })
  const result: any = {}
  console.time(req.nextUrl.pathname)

  const [
    //
    rows,
    number98List,
  ] = await Promise.all([getQrPaperData(), prisma.number98.findMany({})])

  await processBatchWithRetry({
    soruceList: rows,
    options: {
      batchSize: 1000,
      retries: 1,
    },

    mainProcess: async batch => {
      batch.map(async row => {
        const sateiID = row.sateiID ? String(row.sateiID) : undefined
        const {
          number98,

          customerName,
          arrivedAt,
          purchaseType,
          inkanCertificateExpiredAtOrigin,
          inspectionExpiredAtOrigin,
          processedAs,
          masshoBi,
          meihenBi,
          remarksHq,
          email,
          ErrorNote,
          passedAt,
          garageProvedAt,
        } = row

        if (!sateiID) {
          console.log(`sateiID is not found: ${row.sateiID}`)
          return null
        }

        const purchaseTypeObj = Object.keys(UCAR_CODE.PURCHASE_TYPES.raw).find(key =>
          UCAR_CODE.PURCHASE_TYPES.raw[key].qrPaperSpreadSheetNotationList.includes(purchaseType)
        )
        const purchaseTypeCode = purchaseTypeObj ? UCAR_CODE.PURCHASE_TYPES.raw[purchaseTypeObj]?.code : undefined

        const processedAsObj = Object.keys(UCAR_CODE.PROCESSED_AS.raw).find(key =>
          UCAR_CODE.PROCESSED_AS.raw[key].qrPaperSpreadSheetNotationList.includes(processedAs)
        )
        const processedAsCode = processedAsObj ? UCAR_CODE.PROCESSED_AS.raw[processedAsObj]?.code : undefined

        //印鑑証明
        const inkanCertificateExpiredAt = Days.validate.isDate(new Date(inkanCertificateExpiredAtOrigin))
          ? toIsoDate(inkanCertificateExpiredAtOrigin)
          : undefined

        const inkanAlternate = Days.validate.isDate(new Date(inkanCertificateExpiredAtOrigin))
          ? undefined
          : inkanCertificateExpiredAtOrigin

        const inkanAlternateCodeKey = Object.keys(UCAR_CODE.INKAN_ALTERNATES.raw).find(key =>
          UCAR_CODE.INKAN_ALTERNATES.raw[key].qrPaperSpreadSheetNotationList.includes(inkanAlternate)
        )
        const inkanAlternateCode = inkanAlternateCodeKey ? UCAR_CODE.INKAN_ALTERNATES.raw[inkanAlternateCodeKey]?.code : undefined

        // 車検
        const inspectionExpiredAt = Days.validate.isDate(new Date(inspectionExpiredAtOrigin))
          ? toIsoDate(inspectionExpiredAtOrigin)
          : undefined

        const inspectionAlternateCodeKey = Object.keys(UCAR_CODE.INSPECTION_ALTERNATE.raw).find(key =>
          UCAR_CODE.INSPECTION_ALTERNATE.raw[key].qrPaperSpreadSheetNotationList.includes(inspectionExpiredAtOrigin)
        )
        const inspectionAlternateCode = inspectionAlternateCodeKey
          ? UCAR_CODE.INSPECTION_ALTERNATE.raw[inspectionAlternateCodeKey]?.code
          : undefined

        const number98Number = number98 ? UcarCL.converter.shapeNumber98(String(number98.replace(/ /g, ''))) : ''

        const payload = {
          number98: number98Number,
          processedAs: processedAsCode,
          purchaseType: purchaseTypeCode,
          arrivedAt: arrivedAt ? toIsoDate(arrivedAt) : undefined,

          //印鑑証明
          inkanCertificateExpiredAt,
          inkanAlternate: inkanAlternateCode,

          //車検
          inspectionExpiredAt,
          inspectionAlternate: inspectionAlternateCode,

          //その他
          taxCustomerName: customerName || undefined,
          masshoBi: masshoBi ? toIsoDate(masshoBi) : undefined,
          meihenBi: meihenBi ? toIsoDate(meihenBi) : undefined,
          remarksHq,
        }

        const qrIssuedAt = new Date(toIsoDate(arrivedAt) ?? toUtc(new Date(2025, 1, 1)))

        //ダイハツの場合
        const sateiIdToNumberlike = Number(sateiID)
        if (sateiID && isNaN(sateiIdToNumberlike)) {
          try {
            const daihatsuReserve = sateiID
            await prisma.ucar.upsert({
              where: {sateiID: sateiID},
              create: {
                ...payload,
                createdAt: qrIssuedAt,
                qrIssuedAt,
                sateiID: sateiID,
                userId: shiireGroupUser?.id as number,
                daihatsuReserve,
                dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.QRPAPER_DAIHATSU.code,
              },
              update: {
                ...payload,
                createdAt: qrIssuedAt,
                qrIssuedAt,
                daihatsuReserve,
                userId: shiireGroupUser?.id as number,
                dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.QRPAPER_DAIHATSU.code,
              },
            })
          } catch (error) {
            const errorMessage = handlePrismaError(error)
            console.log('daihatsuError', {errorMessage, sateiID})
          }
        } else {
          try {
            const res = await prisma.ucar.update({
              where: {sateiID},
              data: {
                ...payload,
                dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.QRPAPER_UPDATE.code,
              },
            })
          } catch (error) {
            const data = {
              ...payload,
              createdAt: qrIssuedAt,
              qrIssuedAt,
              sateiID: sateiID,
              userId: shiireGroupUser?.id as number,
              dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.QRPAPER_CREATE.code,
            }
            try {
              await prisma.ucar.upsert({
                where: {sateiID},
                create: data,
                update: data,
              })
            } catch (error) {
              const errorMessage = handlePrismaError(error)
              console.log('createError', {errorMessage, sateiID, error})
            }
          }
        }
      })
    },
  })

  return NextResponse.json({
    success: true,
    message: 'Ucarデータを作成しました。',
  })

  // if (rows.length > 0) {
  //   await Promise.all(

  //   )

  //   console.timeEnd(req.nextUrl.pathname)
  //   return NextResponse.json({
  //     errors: Object.keys(errors).sort(),
  //   })
  // } else {
  //   console.timeEnd(req.nextUrl.pathname)
  //   return NextResponse.json({
  //     success: false,
  //     message: `データがありません`,
  //   })
  // }
}

const getQrPaperData = async () => {
  const spread_res = await GoogleSheet_Read({
    spreadsheetId: `1W9UO04kueStte4-AQ1MExbjhwGl_RMEO7aMsM2LMJLo`,
    range: '新システム反映用!A2:AV',
  })
  const data = spread_res.values ?? []
  const header = data?.[0]
  data.splice(0, 3)

  const body = data

  const rows = body.map(d => {
    const obj = Object.fromEntries(header.map((key, idx) => [key, d[idx]]))
    return obj
  })

  const uniquedRow: any[] = []
  rows
    .filter(row => row.sateiID)
    .forEach(row => {
      const sateiID = row.sateiID
      if (!uniquedRow.some(r => r?.sateiID === sateiID)) {
        uniquedRow.push(row)
      }
    })
  return uniquedRow
}

const toIsoDate = (date: string) => {
  const dateStr = formatDate(date)
  if (Days.validate.isDate(new Date(dateStr))) {
    const toStr = toUtc(dateStr).toISOString()

    return toStr
  }
}
