import {NextRequest, NextResponse} from 'next/server'

import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {Days} from '@cm/class/Days/Days'
import {Prisma} from '@prisma/client'
import prisma from 'src/lib/prisma'
import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'
import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

export const POST = async (req: NextRequest) => {
  console.time(req.nextUrl.pathname)

  const [
    //
    rows,
    number98List,
  ] = await Promise.all([getQrPaperData(), prisma.number98.findMany({})])

  if (rows.length > 0) {
    const transactionQueryList: transactionQuery[] = []
    rows?.forEach((row: any) => {
      const {
        number98 = undefined,
        Assessment_ID = undefined,
        customerName = undefined,
        arrivedAt = undefined,
        purchaseType = undefined,
        inkanCertificateExpiredAt = undefined,
        inspectionExpiredAt = undefined,
        inspectionAlternate = undefined,
        inkanAlternate = undefined,
        processedAs = undefined,
        passedAt = undefined,
        Barracks = undefined,
      } = row

      const daihatsuReserve = isNaN(Number(Assessment_ID)) ? String(Assessment_ID) : null

      const payload = {
        Assessment_ID: String(Assessment_ID),
        daihatsuReserve,
        customerName,
        Barracks,
        arrivedAt: arrivedAt ? toIsoDate(arrivedAt) : undefined,
        purchaseType,
        inkanCertificateExpiredAt: inkanCertificateExpiredAt ? toIsoDate(inkanCertificateExpiredAt) : undefined,
        inkanAlternate,
        inspectionExpiredAt: inspectionExpiredAt ? toIsoDate(inspectionExpiredAt) : undefined,
        inspectionAlternate,
        processedAs,
        passedAt: passedAt === 'TRUE' ? toIsoDate(arrivedAt) : undefined,
      }

      const num98Record = number98List.find(
        n => UcarCL.converter.shapeNumber98(n?.number ?? ``) === UcarCL.converter.shapeNumber98(number98 ?? ``)
      )

      const data = {
        ...payload,
        number98,
      }
      const queryObject: Prisma.UcarUpsertArgs = {
        where: {sateiID: String(Assessment_ID)},
        create: data,
        update: data,
      }

      transactionQueryList.push({
        model: `ucar`,
        method: `upsert`,
        queryObject,
      })
    })

    const transactionRes = await processBatchWithRetry({
      soruceList: transactionQueryList,
      mainProcess: async (batch: any[]) => {
        const transactionRes = await doTransaction({transactionQueryList: batch})
        console.debug(transactionRes.result.length)
      },
      options: {batchSize: 1000, retries: 1},
    })

    console.timeEnd(req.nextUrl.pathname)
    return NextResponse.json(transactionRes)
  } else {
    console.timeEnd(req.nextUrl.pathname)
    return NextResponse.json({
      success: false,
      message: `データがありません`,
    })
  }

  // result[`UpsertPaperDataFromSpreadSheet`] = upsertPaperDataFromSpreadSheetRes.result.length
}

const getQrPaperData = async () => {
  const spread_res = await GoogleSheet_Read({
    spreadsheetId: `1W9UO04kueStte4-AQ1MExbjhwGl_RMEO7aMsM2LMJLo`,
    range: '新システム反映用!A2:AU',
  })
  const data = spread_res.values ?? []
  const header = data?.[0]
  data.splice(0, 3)

  const body = data

  const rows = body.map(d => {
    const obj = Object.fromEntries(header.map((key, idx) => [key, d[idx]]))
    return obj
  })
  return rows
}

const toIsoDate = (date: string) => {
  const dateStr = formatDate(date)
  if (Days.validate.isDate(new Date(dateStr))) return toUtc(dateStr).toISOString()
}
