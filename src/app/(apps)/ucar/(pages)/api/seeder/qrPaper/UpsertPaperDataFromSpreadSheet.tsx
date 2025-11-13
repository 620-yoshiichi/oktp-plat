import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'

import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Days} from '@cm/class/Days/Days'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

export const UpsertPaperDataFromSpreadSheet = async ({allUsers}) => {
  const spread_res = await GoogleSheet_Read({
    spreadsheetId: `1W9UO04kueStte4-AQ1MExbjhwGl_RMEO7aMsM2LMJLo`,
    range: '新システム反映用!A2:AU',
  })
  const data = spread_res?.values ?? []

  const header = data?.[0]
  data.splice(0, 3)

  const body = data

  const rows = body.map(d => {
    const obj = Object.fromEntries(header.map((key, idx) => [key, d[idx]]))
    return obj
  })

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
        garageProvedAt = undefined,
        remarksHq = undefined,
      } = row

      const daihatsuReserve = isNaN(Number(Assessment_ID)) ? String(Assessment_ID) : null

      const toIsoDate = (date: string) => {
        const dateStr = formatDate(date)

        if (Days.validate.isDate(new Date(dateStr))) return toUtc(dateStr).toISOString()
      }

      const payload = {
        Assessment_ID: String(Assessment_ID),
        number98,
        daihatsuReserve,
        customerName,
        arrivedAt: arrivedAt ? toIsoDate(arrivedAt) : undefined,
        purchaseType,
        inkanCertificateExpiredAt: inkanCertificateExpiredAt ? toIsoDate(inkanCertificateExpiredAt) : undefined,
        inkanAlternate,
        inspectionExpiredAt: inspectionExpiredAt ? toIsoDate(inspectionExpiredAt) : undefined,
        inspectionAlternate,
        processedAs,
        passedAt: passedAt === 'TRUE' ? toIsoDate(arrivedAt) : undefined,

        garageProvedAt: garageProvedAt ? toIsoDate(garageProvedAt) : undefined,

        remarksHq,
      }

      const queryObject = {
        where: {Assessment_ID: String(Assessment_ID)},
        create: payload,
        update: payload,
      }

      transactionQueryList.push({
        model: `ucar`,
        method: `upsert`,
        queryObject,
      })
    })
    const transactionRes = await doTransaction({transactionQueryList})
    return transactionRes
  } else {
    return spread_res
  }
}
