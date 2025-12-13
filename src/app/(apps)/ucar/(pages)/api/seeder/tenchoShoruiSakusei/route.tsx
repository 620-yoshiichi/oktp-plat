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
import {processBatchSimple} from '@cm/hooks/useFileUpload/csv-utils'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'

export const POST = async (req: NextRequest) => {
  const spread_res = await GoogleSheet_Read({
    spreadsheetId: `https://docs.google.com/spreadsheets/d/1qMV0fpr_FPsFBiRionHO7em6ZEKXUWs4E7zK1fMFgZY/edit?resourcekey=&gid=388575454#gid=388575454`,
    range: '2. 書類店長チェック!A:V',
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

  const [users, bankMasters, bankBranchMasters, shiireGroupUser] = await Promise.all([
    prisma.user.findMany({}),
    prisma.bankMaster.findMany({}),
    prisma.bankBranchMaster.findMany({}),
    prisma.user.findFirst({
      where: {
        code: UCAR_CONSTANTS.shiireGroupUserId,
      },
    }),
  ])

  const targetList = rows.filter(row => row['タイムスタンプ'])

  await processBatchWithRetry({
    soruceList: targetList,
    options: {
      batchSize: 1000,
      retries: 1,
    },
    mainProcess: async batch => {
      await Promise.all(
        batch.map(async row => {
          // タイムスタンプ	メールアドレス	査定番号	店長検収	返金情報入力	お客様名	登録日（購入する車）	年間支払税額	銀行名	支店名	支店名（カナ）	店番号	口座種類	口座番号	名義（カタカナ）
          const timestamp = row['タイムスタンプ']
          const email = row['メールアドレス']
          const sateiID = row['査定番号']

          const userId = users.find(user => user.email === email)?.id ?? shiireGroupUser?.id
          // if (email === 'yuka_okazaki@okayama-toyopet.jp') {
          //   userId = shiireGroupUser?.id
          // }

          if (!userId) {
            console.log(`userId is not found`, {email, sateiID})
            return
          }
          if (!sateiID) {
            console.log(`sateiID is not found`, {email, sateiID})
            return
          }

          //お客様情報更新
          const henkinRequired = row['返金情報入力']
          const customerName = row['お客様名']
          const registerDate = row['登録日（購入する車）']
          const annualTax = row['年間支払税額']
          const branchNameKana = row['支店名（カナ）']
          const storeNumber = row['店番号']
          const accountType = row['口座種類']
          const accountNumber = row['口座番号']
          const accountNameKana = row['名義（カタカナ）']

          const bankCode = row['bankCode']

          const branchCode = row['branchCode']

          const theDate = new Date(timestamp)

          try {
            await prisma.ucar.update({
              where: {sateiID},
              data: {
                henkinRequired: !henkinRequired ? true : false,
                customerName,
                registerDate: registerDate ? toUtc(new Date(registerDate)) : null,
                annualTax: Number(annualTax),
                storeNumber,
                accountType,
                accountNumber,
                accountNameKana,
                bankMasterId: bankCode ? bankMasters.find(b => String(b.code) === bankCode)?.id : undefined,
                bankBranchMasterId: branchCode ? bankBranchMasters.find(b => String(b.code) === branchCode)?.id : undefined,
              },
            })
          } catch (error) {
            //書類提出プロセス

            const data = {
              sateiID,
              userId,
              createdAt: theDate,
              qrIssuedAt: theDate,
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
              console.error(errorMessage, sateiID)
            }
          }

          //書類提出プロセス
          const payload: Prisma.UcarProcessUncheckedCreateInput = {
            processCode: STORE_SHORUI_SOUHU_Code,
            dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.TENCHO_SHORUI_KENSHU_HISTORY.code,
            date: theDate,
            sateiID,
            userId,
          }

          try {
            await prisma.ucarProcess.upsert({
              where: {
                unique_sateiID_date_processCode: {
                  sateiID,
                  date: theDate,
                  processCode: STORE_SHORUI_SOUHU_Code,
                },
              },
              create: payload,
              update: payload,
            })
          } catch (error) {
            const data = {
              ...payload,
              createdAt: theDate,
              qrIssuedAt: theDate,
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
    },
  })

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
          let bankCode = row['bankCode']
          bankCode = String(bankCode).padStart(4, '0')
          const bankName = row['bankName']
          if (!bankCode || !bankName) {
            return null
          }

          return {bankCode, bankName}
        })
        .filter(Boolean)
        .map(d => [d!.bankCode, d])
    ).values(),
  ] as {bankCode: string; bankName: string}[]

  // BankMaster を upsert（codeでユニーク）

  await Promise.all(
    uniqueBankData.map(async ({bankCode, bankName}) => {
      await prisma.bankMaster.upsert({
        where: {code: bankCode},
        create: {code: bankCode, name: bankName},
        update: {name: bankName},
      })
    })
  )

  await Promise.all(
    rows.map(async row => {
      let bankCode = row['bankCode']
      let branchCode = row['branchCode']
      const branchName = row['branchName']
      const branchNameKana = row['branchKana']

      if (!bankCode || !branchCode) {
        return
      }

      bankCode = String(bankCode).padStart(4, '0')
      branchCode = String(branchCode).padStart(3, '0')

      await prisma.bankBranchMaster.upsert({
        where: {
          unique_code_bankCode: {
            bankCode,
            code: branchCode,
          },
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
      })
    })
  )
}
