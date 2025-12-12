import {NextRequest, NextResponse} from 'next/server'

import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import prisma from 'src/lib/prisma'
import {transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {Prisma} from '@prisma/generated/prisma/client'

import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {handlePrismaError} from '@cm/lib/prisma-helper'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'
import {UCAR_CONSTANTS} from '@app/(apps)/ucar/(constants)/ucar-constants'

export const POST = async (req: NextRequest) => {
  const result: any = {}

  const spread_res = await GoogleSheet_Read({
    spreadsheetId: `https://docs.google.com/spreadsheets/d/1qMV0fpr_FPsFBiRionHO7em6ZEKXUWs4E7zK1fMFgZY/edit?resourcekey=&gid=388575454#gid=388575454`,
    range: '2. 書類店長チェック!A:O',
  })
  const data = spread_res.values ?? []
  const header = data?.[0]

  data.splice(0, 1)

  const body = data

  const rows = body.map(d => {
    const obj = Object.fromEntries(header.map((key, idx) => [key, d[idx]]))
    return obj
  })

  const STORE_SHORUI_SOUHU_Code = UcarProcessCl.CODE.raw.STORE_SHORUI_SOUHU?.code

  await upsertBankData(rows)

  const users = await prisma.user.findMany({})
  const shiireGroupUser = await prisma.user.findFirst({
    where: {
      code: UCAR_CONSTANTS.shiireGroupUserId,
    },
  })

  await Promise.all(
    rows.map(async row => {
      // タイムスタンプ	メールアドレス	査定番号	店長検収	返金情報入力	お客様名	登録日（購入する車）	年間支払税額	銀行名	支店名	支店名（カナ）	店番号	口座種類	口座番号	名義（カタカナ）
      const timestamp = row['タイムスタンプ']
      const email = row['メールアドレス']
      const sateiID = row['査定番号']

      let userId = users.find(user => user.email === email)?.id
      if (email === 'yuka_okazaki@okayama-toyopet.jp') {
        userId = shiireGroupUser?.id
      }

      if (!userId) {
        console.log(`userId is not found: ${email}`)
        return
      }

      //お客様情報更新
      const henkinRequired = row['返金情報入力']
      const customerName = row['お客様名']
      const registerDate = row['登録日（購入する車）']
      const annualTax = row['年間支払税額']
      const bankName = row['銀行名']
      const branchName = row['支店名']
      const branchNameKana = row['支店名（カナ）']
      const storeNumber = row['店番号']
      const accountType = row['口座種類']
      const accountNumber = row['口座番号']
      const accountNameKana = row['名義（カタカナ）']

      try {
        await prisma.ucar.update({
          where: {sateiID},
          data: {
            henkinRequired: !henkinRequired ? true : false,
            customerName,
            registerDate: registerDate ? toUtc(new Date(registerDate)) : null,
            annualTax: Number(annualTax),
            bankName,
            branchName,
            branchNameKana,
            storeNumber,
            accountType,
            accountNumber,
            accountNameKana,
          },
        })
      } catch (error) {
        //書類提出プロセス

        const data = {
          sateiID,
          userId,
          createdAt: new Date(timestamp),
          qrIssuedAt: new Date(timestamp),
          dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.TENCHO_SHORUI_KENSHU_HISTORY.code,
        }
        try {
          await prisma.ucar.upsert({
            where: {sateiID},
            create: data,
            update: data,
          })
        } catch (error) {
          const errorMessage = handlePrismaError(error)
          console.error(errorMessage, sateiID, 'erro')
        }
      }

      //書類提出プロセス
      const payload: Prisma.UcarProcessUncheckedCreateInput = {
        processCode: STORE_SHORUI_SOUHU_Code,
        dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.TENCHO_SHORUI_KENSHU_HISTORY.code,
        date: new Date(timestamp),
        sateiID,
        userId,
      }

      try {
        await prisma.ucarProcess.upsert({
          where: {
            unique_sateiID_date_processCode: {
              sateiID,
              date: new Date(timestamp),
              processCode: STORE_SHORUI_SOUHU_Code,
            },
          },
          create: payload,
          update: payload,
        })
      } catch (error) {
        const data = {
          ...payload,
          createdAt: new Date(timestamp),
          qrIssuedAt: new Date(timestamp),
          dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.TENCHO_SHORUI_KENSHU_HISTORY.code,
        }
        await prisma.ucar.upsert({
          where: {sateiID},
          create: data,
          update: data,
        })
      }
    })
  )

  return NextResponse.json({
    success: true,
    message: '書類店長チェックを更新しました。',
  })
}

const upsertBankData = async (rows: any[]) => {
  // BankMaster / BankBranchMaster を upsert
  const bankQuery: transactionQuery<'bankMaster' | 'bankBranchMaster', 'upsert'>[] = []

  // bankNameを「銀行コード_銀行名称」として分割し、ユニークな銀行データを取得
  const uniqueBankData = [
    ...new Map(
      rows
        .map(row => {
          const bankName = row['銀行名']
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
    bankQuery.push({
      model: 'bankMaster',
      method: 'upsert',
      queryObject: {
        where: {
          code: bankCode,
        },
        create: {
          code: bankCode,
          name: bankNameOnly,
        },
        update: {
          name: bankNameOnly,
        },
      },
    })
  })

  const {result: upsertedBanks} = await doTransaction({transactionQueryList: bankQuery})

  // BankBranchMaster を upsert（bankCodeベースのリレーション）
  const branchQuery: transactionQuery<'bankMaster' | 'bankBranchMaster', 'upsert'>[] = []

  rows.forEach(row => {
    const bankName = row['銀行名']
    const branchName = row['支店名']
    const branchNameKana = row['支店名（カナ）']
    const rawBranchCode = row['店番号'] // 店番号を支店コードとして使用

    if (!bankName || !branchName || !rawBranchCode) {
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
          code: branchCode,
          name: branchName,
          branchKana: branchNameKana || undefined,
          bankCode,
        },
        update: {
          name: branchName,
          branchKana: branchNameKana || undefined,
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
    upsertedBanks: upsertedBanks.length,
    upsertedBranches: upsertedBranches.length,
  }
}
