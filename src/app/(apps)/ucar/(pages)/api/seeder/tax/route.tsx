import {NextRequest, NextResponse} from 'next/server'

import {fetchAlt} from '@cm/lib/http/fetch-client'

import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import prisma from 'src/lib/prisma'
import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'
import {formatDate, toIsoDateIfExist} from '@cm/class/Days/date-utils/formatters'

export const POST = async (req: NextRequest) => {
  const header = [
    `accountingRecievedAt`,
    `paybackScheduledAt`,
    'number98',
    'Assessment_ID',
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

  // const offset = 0
  const doPostUrl = `https://script.google.com/macros/s/AKfycbxFygaYt9Q-6THWa-PqKXbGOHNmBbN98rOi0I4JfWSren46JmhcxCdL-rWRSFfcPzdq/exec`
  const res = await fetchAlt(doPostUrl, {action: `getTaxData`})

  const tax_csv_res = await GoogleSheet_Read({
    spreadsheetId: `https://docs.google.com/spreadsheets/d/13p8oNLrGTmh9TceaKLmXrlwISXvmuqveAaWpvRAAp4c/edit?pli=1&gid=450796568#gid=450796568`,
    range: `DB!A8:AG`,
  })

  const tax_csv = tax_csv_res?.values ?? []

  const number98List = await prisma.number98.findMany({
    select: {id: true, number: true},
  })

  // A8:AE
  const transactionQueryList: transactionQuery<'ucar', 'upsert'>[] = []
  res.result.forEach(item => {
    const {
      accountingRecievedAt,
      paybackScheduledAt,
      number98,
      Assessment_ID,
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
    if (!Assessment_ID) return

    const upperCarregisteredAt = registeredAt ? formatDate(new Date(registeredAt), `iso`) : null

    const earlyRecievedAt = new Date(earlyYear, earlyMonth - 1, 1)

    const Number98Obj = number98List.find(obj => String(obj.number) === String(number98))

    const data = {
      accountingRecievedAt: [`true`, `TRUE`, true].includes(accountingRecievedAt) ? true : false,

      paybackScheduledAt: toIsoDateIfExist(paybackScheduledAt),
      Assessment_ID: String(Assessment_ID),

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
      where: {sateiID: String(Assessment_ID)},
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
