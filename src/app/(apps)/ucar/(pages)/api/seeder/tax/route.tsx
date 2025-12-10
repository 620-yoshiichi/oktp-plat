import {NextRequest, NextResponse} from 'next/server'

import {fetchAlt} from '@cm/lib/http/fetch-client'

import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import prisma from 'src/lib/prisma'
import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'
import {formatDate, toIsoDateIfExist} from '@cm/class/Days/date-utils/formatters'

export const POST = async (req: NextRequest) => {
  const spread_res = await GoogleSheet_Read({
    spreadsheetId: `https://docs.google.com/spreadsheets/d/13p8oNLrGTmh9TceaKLmXrlwISXvmuqveAaWpvRAAp4c/edit?gid=1524061969#gid=1524061969`,
    range: 'DB!A8:AG',
  })
  const data = spread_res.values ?? []

  const header = [
    `accountingRecievedAt`,
    `paybackScheduledAt`,
    'number98',
    'sateiID',
    'store',
    'stuff',
    'customerName',
    'plate',
    'registeredAt',
    `shiireDate`,
    `annualTax`,
    `earlyYear`,
    `earlyMonth`,
    'bankName',
    'branchName',
    'bankKana',
    'storeCode',
    'accountType',
    'accountNumber',
    'accountName',
    'proccessedAs',
    'processedDate',
    'petCount',
    'petPrice',
    'prefCount',
    'prefPrice',
    `exception`,
    `paymentNoticeRecieved`,
    `isPayed`,
  ]

  const body = data
  const rows = body.map(d => {
    const obj = Object.fromEntries(header.map((key, idx) => [key, d[idx]]))
    return obj
  })

  const number98List = await prisma.number98.findMany({
    select: {id: true, number: true},
  })

  // A8:AE
  const transactionQueryList: transactionQuery<'ucar', 'upsert'>[] = []
  rows.forEach(item => {
    const {
      accountingRecievedAt,
      paybackScheduledAt,
      number98,
      sateiID,
      store,
      stuff,
      customerName,
      plate,
      registeredAt,
      shiireDate,
      annualTax,
      earlyYear,
      earlyMonth,
      bankName,
      branchName,
      bankKana,
      storeCode,
      accountType,
      accountNumber,
      accountNameKana,
      proccessedAs,
      processedDate,
      petCount,
      petPrice,
      prefCount,
      prefPrice,
      exception,
      paymentNoticeRecieved,
      isPayed,
    } = item

    console.log(item) //logs
    return
    if (!sateiID) return

    const upperCarregisteredAt = registeredAt ? formatDate(new Date(registeredAt), `iso`) : null

    const earlyRecievedAt = new Date(earlyYear, earlyMonth - 1, 1)

    const Number98Obj = number98List.find(obj => String(obj.number) === String(number98))

    const data = {
      accountingRecievedAt: [`true`, `TRUE`, true].includes(accountingRecievedAt) ? true : false,

      paybackScheduledAt: toIsoDateIfExist(paybackScheduledAt),
      sateiID: String(sateiID),

      upperCarregisteredAt: toIsoDateIfExist(upperCarregisteredAt),

      customerName,
      annualTax: Number(annualTax),
      earlyRecievedAt: toIsoDateIfExist(earlyRecievedAt),

      accountType,
      accountNumber: String(accountNumber),
      accountNameKana,
      petCount: petCount ? Number(petCount) : null,
      petPrice: petPrice ? Number(petPrice) : null,
      prefCount: prefCount ? Number(prefCount) : null,
      prefPrice: prefPrice ? Number(prefPrice) : null,
      exception,
      paymentNoticeRecieved,
      isPayed: isPayed ? true : false,
      taxJobNote: [bankName, branchName, bankKana, storeCode].join(`\n`),
      number98Id: Number98Obj?.id,
    }
    const paylaod: any = {
      where: {sateiID: String(sateiID)},
      create: data,
      update: data,
    }

    transactionQueryList.push({
      model: `ucar`,
      method: `upsert`,
      queryObject: paylaod,
    })
  })
  const {result} = await doTransaction({transactionQueryList})

  return NextResponse.json({upsertedCount: result.length, lastData: result[result.length - 1]})
}
