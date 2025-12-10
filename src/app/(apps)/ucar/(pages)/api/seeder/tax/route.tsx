import {NextRequest, NextResponse} from 'next/server'

import {fetchAlt} from '@cm/lib/http/fetch-client'

import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import prisma from 'src/lib/prisma'
import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'
import {formatDate, toIsoDateIfExist} from '@cm/class/Days/date-utils/formatters'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {handlePrismaError} from '@cm/lib/prisma-helper'
import {Days} from '@cm/class/Days/Days'

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
    'storeCode',
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

  await Promise.all(
    rows.map(async (item: any) => {
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

      const earlyRecievedAt = earlyYear && earlyMonth ? toUtc(new Date(earlyYear, earlyMonth - 1, 1)) : null

      // bankMasterId を取得
      const bankMasterId = bankMasters.find(b => String(b.name) === String(bankName))?.id

      // bankBranchMasterId を取得
      const bankBranchMasterId = bankBranchMasters.find(
        b => String(b.name) === String(branchName) && b.bankMasterId === bankMasterId
      )?.id

      const exceptionIsDate = Days.validate.isDate(new Date(exception))

      const exceptionStr = exceptionIsDate ? '' : exception
      const souhsinJikokuDate = exceptionIsDate ? toUtc(new Date(exception)) : souhsinJikoku

      const updateData = {
        souhsinJikoku: souhsinJikokuDate ? toIsoDateIfExist(new Date(souhsinJikokuDate)) : undefined,
        henkinRequired: !henkinRequired ? true : false,

        accountingRecievedAt: [`true`, `TRUE`, true].includes(accountingRecievedAt) ? true : false,
        paybackScheduledAt: paybackScheduledAt ? toIsoDateIfExist(new Date(paybackScheduledAt)) : undefined,

        customerName: taxCustomerName || undefined,
        upperCarregisteredAt: upperCarregisteredAt ? toIsoDateIfExist(new Date(upperCarregisteredAt)) : undefined,
        annualTax: annualTax ? Number(annualTax) : undefined,
        earlyRecievedAt: earlyRecievedAt ? toIsoDateIfExist(new Date(earlyRecievedAt)) : undefined,
        accountType: accountType || undefined,
        accountNumber: accountNumber ? String(accountNumber) : undefined,
        accountNameKana: accountNameKana || undefined,

        exception: exceptionStr,
        paymentNoticeRecieved: paymentNoticeRecieved || undefined,

        //銀行
        bankMasterId: bankMasterId || undefined,
        bankBranchMasterId: bankBranchMasterId || undefined,

        //納付書受領、
        paymentNoticeRecievedAt: paymentNoticeRecieved ? toIsoDateIfExist(new Date(paymentNoticeRecieved)) : undefined,
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
          data: updateData,
        })
      } catch (error) {
        const errorMessage = handlePrismaError(error)
        if (errorMessage === 'データの形式が正しくありません') {
          console.log(updateData, sateiID) //logs
        } else {
          console.error(errorMessage, sateiID)
        }
      }
    })
  )

  return NextResponse.json({})
}
const upsertBankData = async (rows: any[]) => {
  // BankMaster / BankBranchMaster を upsert
  const bankQuery: transactionQuery<'bankMaster' | 'bankBranchMaster', 'upsert'>[] = []

  // ユニークな銀行名のリストを取得
  const uniqueBankNames = [...new Set(rows.map(row => row.bankName).filter(Boolean))]

  // BankMaster を upsert
  uniqueBankNames.forEach(bankName => {
    bankQuery.push({
      model: 'bankMaster',
      method: 'upsert',
      queryObject: {
        where: {
          name: bankName,
        },
        create: {
          code: bankName,
          name: bankName,
        },
        update: {
          code: bankName,
          name: bankName,
        },
      },
    })
  })

  const {result: upsertedBanks} = await doTransaction({transactionQueryList: bankQuery})

  // BankBranchMaster を upsert
  const branchQuery: transactionQuery<'bankMaster' | 'bankBranchMaster', 'upsert'>[] = []

  rows.forEach(row => {
    const {bankName, branchName, bankKana} = row

    if (!bankName || !branchName) {
      return
    }

    const bankMasterId = upsertedBanks?.find(b => {
      return String(b.code) === String(bankName) || String(b.name) === String(bankName)
    })?.id

    if (bankMasterId) {
      branchQuery.push({
        model: 'bankBranchMaster',
        method: 'upsert',
        queryObject: {
          where: {
            unique_code_bankMasterId: {code: branchName, bankMasterId},
          },
          create: {
            code: branchName,
            name: branchName,
            branchKana: bankKana || undefined,
            bankMasterId,
          },
          update: {
            name: branchName,
            branchKana: bankKana || undefined,
          },
        },
      })
    }
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
