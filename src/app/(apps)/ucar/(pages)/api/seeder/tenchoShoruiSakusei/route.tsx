import {NextRequest, NextResponse} from 'next/server'

import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import prisma from 'src/lib/prisma'
import {transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {Prisma} from '@prisma/client'

import createUcarDataByAssessmentId from '@app/(apps)/ucar/(pages)/api/seeder/createUcarDataByAssessmentId'
import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'

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

  const users = await prisma.user.findMany({})

  await Promise.all(
    rows.map(async row => {
      const [
        timestamp,
        email,
        sateiID,
        processName,
        henkinJouhoUmu,
        customerName,
        registerDate,
        annualTax,
        bankName,
        branchName,
        branchNameKana,
        storeNumber,
        accountType,
        accountNumber,
        accountNameKana,
      ] = row

      const userId = users.find(user => user.email === email)?.id

      if (!userId) {
        console.log(`userId is not found: ${email}`) //logs
        return
      }

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
    })
  )
}
