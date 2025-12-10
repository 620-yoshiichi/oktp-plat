import {NextRequest} from 'next/server'

import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import prisma from 'src/lib/prisma'
import {transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {Prisma} from '@prisma/client'

import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

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

  await Promise.all(
    rows.map(async row => {
      // タイムスタンプ	メールアドレス	査定番号	店長検収	返金情報入力	お客様名	登録日（購入する車）	年間支払税額	銀行名	支店名	支店名（カナ）	店番号	口座種類	口座番号	名義（カタカナ）
      const timestamp = row['タイムスタンプ']
      const email = row['メールアドレス']
      const sateiID = row['査定番号']

      let userId = users.find(user => user.email === email)?.id
      if (email === 'yuka_okazaki@okayama-toyopet.jp') {
        userId = users.find(user => user.code === 99999931)?.id
      }

      if (!userId) {
        console.log(`userId is not found: ${email}`)
        return
      }

      //書類提出プロセス
      const payload: Prisma.UcarProcessUncheckedCreateInput = {
        processCode: STORE_SHORUI_SOUHU_Code,
        dataSource: `tenchoShoruiSokusei`,
        date: new Date(timestamp),
        sateiID,
        userId,
      }

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

      //お客様情報更新
      const henkinJouhoUmu = row['返金情報入力']
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

      await prisma.ucar.update({
        where: {
          sateiID,
        },
        data: {
          henkinJouhoUmu,
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
    })
  )
}

const upsertBankData = async (rows: any[]) => {
  // BankMaster / BankBranchMaster を upsert
  const bankQuery: transactionQuery<'bankMaster' | 'bankBranchMaster', 'upsert'>[] = []

  // ユニークな銀行名のリストを取得
  const uniqueBankNames = [...new Set(rows.map(row => row['銀行名']).filter(Boolean))]

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
    const {銀行名: bankName, 支店名: branchName} = row
    const branchNameKana = row['支店名（カナ）']

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
            branchKana: branchNameKana || undefined,
            bankMasterId,
          },
          update: {
            name: branchName,
            branchKana: branchNameKana || undefined,
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
    upsertedBanks: upsertedBanks.length,
    upsertedBranches: upsertedBranches.length,
  }
}
