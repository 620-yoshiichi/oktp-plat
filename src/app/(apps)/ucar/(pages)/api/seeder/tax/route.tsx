import {NextRequest, NextResponse} from 'next/server'

import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import prisma from 'src/lib/prisma'
import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'
import {formatDate, toIsoDateIfExist} from '@cm/class/Days/date-utils/formatters'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {handlePrismaError} from '@cm/lib/prisma-helper'
import {Days} from '@cm/class/Days/Days'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'

export const POST = async (req: NextRequest) => {
  const spread_res = await GoogleSheet_Read({
    spreadsheetId: `https://docs.google.com/spreadsheets/d/13p8oNLrGTmh9TceaKLmXrlwISXvmuqveAaWpvRAAp4c/edit?gid=1524061969#gid=1524061969`,
    range: 'DB!A8:AF',
  })
  const data = spread_res.values ?? []

  const header = [
    `accountingRecievedAt`,
    `paybackScheduledAt`,
    'number98',
    'sateiID',
    'store',
    'stuff',
    'taxCustomerName',
    'plate',
    'registeredAt',
    `shiireDate`,
    `annualTax`,
    `earlyYear`,
    `earlyMonth`,
    'bankName',
    'branchName',
    'bankKana',
    'bankBranchCode',
    'accountType',
    'accountNumber',
    'accountNameKana',
    'proccessedAs',
    'processedDate',
    'petCount',
    'petPrice',
    'prefCount',
    'prefPrice',
    `exception`,
    'souhsinJikoku',
    'henkinRequired',
    `paymentNoticeRecieved`,
    `isPayed`,
    'forNewApp',
  ]

  const body = data
  const rows = body.map(d => {
    const obj = Object.fromEntries(header.map((key, idx) => [key, d[idx]]))
    return obj
  })

  // 最初に銀行データを作成
  const {upsertedBanks, upsertedBranches} = await upsertBankData(rows)

  const number98List = await prisma.number98.findMany({
    select: {id: true, number: true},
  })

  // 銀行マスタを取得（bankMasterId / bankBranchMasterId を設定するため）
  const bankMasters = await prisma.bankMaster.findMany({})
  const bankBranchMasters = await prisma.bankBranchMaster.findMany({})

  await processBatchWithRetry({
    soruceList: rows,
    options: {
      batchSize: 2000,
      retries: 1,
    },
    mainProcess: async batch => {
      await Promise.all(
        batch.map(async (item, i) => {
          const {
            accountingRecievedAt,
            paybackScheduledAt,
            number98,
            sateiID,
            store,
            stuff,
            taxCustomerName,
            plate,
            upperCarregisteredAt,
            shiireDate,
            annualTax,
            earlyYear,
            earlyMonth,
            bankName,
            branchName,
            bankKana,
            bankBranchCode,
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
            souhsinJikoku,
            henkinRequired,
            paymentNoticeRecieved,
            isPayed,
            forNewApp,
          } = item

          if (!sateiID) {
            console.log(`sateiID is not found: ${sateiID}`)
            return
          }

          // bankNameから銀行コードを取得（「0173_百十四銀行」形式、4桁にパディング）
          const [rawBankCode] = bankName ? bankName.split('_') : [null]
          const bankCode = rawBankCode ? String(rawBankCode).padStart(4, '0') : null
          // 支店コードは3桁にパディング
          const branchCode = bankBranchCode ? String(bankBranchCode).padStart(3, '0') : null

          // bankMasterId を取得（codeで検索）
          const bankMasterId = bankCode ? bankMasters.find(b => String(b.code) === bankCode)?.id : undefined

          // bankBranchMasterId を取得（bankCodeとcodeで検索）
          const bankBranchMasterId =
            bankCode && branchCode
              ? bankBranchMasters.find(b => String(b.code) === branchCode && b.bankCode === bankCode)?.id
              : undefined

          const exceptionIsDate = Days.validate.isDate(new Date(exception))

          const exceptionStr = exceptionIsDate ? '' : exception

          const exceptionCode = UCAR_CODE.TAX_EXCEPTION.array.find(code => code.label === exceptionStr)

          const souhsinJikokuDate = exceptionIsDate ? toUtc(new Date(exception)) : souhsinJikoku

          const updateData = {
            souhsinJikoku: souhsinJikokuDate ? toIsoDate(souhsinJikokuDate) : undefined,
            henkinRequired: !henkinRequired ? true : false,

            accountingRecievedAt: [`true`, `TRUE`, true].includes(accountingRecievedAt)
              ? toIsoDate(accountingRecievedAt)
              : undefined,
            paybackScheduledAt: paybackScheduledAt ? toIsoDate(paybackScheduledAt) : undefined,

            customerName: taxCustomerName || undefined,
            upperCarregisteredAt: upperCarregisteredAt ? toIsoDate(upperCarregisteredAt) : undefined,
            annualTax: annualTax ? Number(annualTax) : undefined,
            earlyYear: earlyYear ? Number(earlyYear) : undefined,
            earlyMonth: earlyMonth ? Number(earlyMonth) : undefined,
            accountType: accountType || undefined,
            accountNumber: accountNumber ? String(accountNumber) : undefined,
            accountNameKana: accountNameKana || undefined,

            exception: exceptionCode?.code,
            paymentNoticeRecieved: paymentNoticeRecieved || undefined,

            //銀行
            bankMasterId: bankMasterId || undefined,
            bankBranchMasterId: bankBranchMasterId || undefined,

            //納付書受領、
            paymentNoticeRecievedAt: paymentNoticeRecieved ? toIsoDate(paymentNoticeRecieved) : undefined,
            isPayed: isPayed ? true : false,

            //金額
            petCount: petCount ? Number(petCount) : null,
            petPrice: petPrice ? Number(petPrice) : null,
            prefCount: prefCount ? Number(prefCount) : null,
            prefPrice: prefPrice ? Number(prefPrice) : null,

            taxCustomerName: taxCustomerName || undefined,
          }

          try {
            await prisma.ucar.update({
              where: {sateiID: String(sateiID)},
              data: {...updateData},
            })
          } catch (error) {
            const errorMessage = handlePrismaError(error)
            console.error(errorMessage, sateiID)
          }
        })
      )
    },
  })

  return NextResponse.json({})
}
const upsertBankData = async (rows: any[]) => {
  // BankMaster / BankBranchMaster を upsert
  const bankQuery: transactionQuery<'bankMaster' | 'bankBranchMaster', 'upsert'>[] = []

  // bankNameを「銀行コード_銀行名称」として分割し、ユニークな銀行データを取得
  const uniqueBankData = [
    ...new Map(
      rows
        .map(row => {
          const bankName = row.bankName
          if (!bankName) return null
          // 「0173_百十四銀行」のような形式を分割
          const [rawBankCode, ...nameParts] = bankName.split('_')
          const bankCode = String(rawBankCode).padStart(4, '0') // 銀行コードは4桁
          const bankNameOnly = nameParts.join('_') || rawBankCode // 「_」がない場合はそのまま使用

          return {bankCode, bankNameOnly}
        })
        .filter(Boolean)
        .map(d => [d!.bankCode, d])
    ).values(),
  ] as {bankCode: string; bankNameOnly: string}[]

  // BankMaster を upsert（codeでユニーク）
  uniqueBankData.forEach(({bankCode, bankNameOnly}) => {
    const data = {
      code: bankCode,
      name: bankNameOnly,
    }
    bankQuery.push({
      model: 'bankMaster',
      method: 'upsert',
      queryObject: {
        where: {code: bankCode},
        create: data,
        update: data,
      },
    })
  })

  const {result: upsertedBanks} = await doTransaction({transactionQueryList: bankQuery})

  // BankBranchMaster を upsert（bankCodeベースのリレーション）
  const branchQuery: transactionQuery<'bankMaster' | 'bankBranchMaster', 'upsert'>[] = []

  rows.forEach(row => {
    const {bankName, branchName, bankKana, bankBranchCode: rawBranchCode} = row

    if (!bankName || !rawBranchCode) {
      return
    }

    // bankNameから銀行コードを取得（4桁にパディング）
    const [rawBankCode] = bankName.split('_')
    const bankCode = String(rawBankCode).padStart(4, '0')
    // 支店コードは3桁にパディング
    const branchCode = String(rawBranchCode).padStart(3, '0')

    branchQuery.push({
      model: 'bankBranchMaster',
      method: 'upsert',
      queryObject: {
        where: {
          unique_code_bankCode: {code: branchCode, bankCode},
        },
        create: {
          bankCode,
          code: branchCode,
          name: branchName,
          branchKana: bankKana || undefined,
        },
        update: {
          name: branchName,
          branchKana: bankKana || undefined,
        },
      },
    })
  })

  const {result: upsertedBranches} = await doTransaction({transactionQueryList: branchQuery})

  console.log({
    upsertedBanks: upsertedBanks.length,
    upsertedBranches: upsertedBranches.length,
  })

  return {
    upsertedBanks,
    upsertedBranches,
  }
}
const toIsoDate = (date: string) => {
  const dateStr = formatDate(date)
  if (Days.validate.isDate(new Date(dateStr))) {
    const toStr = toUtc(dateStr).toISOString()

    return toStr
  }
}
