import {NextRequest, NextResponse} from 'next/server'

import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'
import {handlePrismaError} from '@cm/lib/prisma-helper'
import prisma from 'src/lib/prisma'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {UCAR_CONSTANTS} from '@app/(apps)/ucar/(constants)/ucar-constants'

export const POST = async (req: NextRequest) => {
  const result: any = {}
  const shiireGroupUser = await prisma.user.findFirst({
    where: {
      code: UCAR_CONSTANTS.shiireGroupUserId,
    },
  })

  const spread_res = await GoogleSheet_Read({
    spreadsheetId: `https://docs.google.com/spreadsheets/d/1byO2cbzi2H7-8YFztSzYngZNaSg_mtvPFktbebFpvZg/edit?gid=129381266#gid=129381266`,
    range: '※仕分結果!A:C',
  })
  const data = spread_res.values ?? []
  const header = data?.[0]

  data.splice(0, 1)

  const body = data

  const rows = body.map(d => {
    const obj = Object.fromEntries(header.map((key, idx) => [key, d[idx]]))
    return obj
  })

  await processBatchWithRetry({
    soruceList: rows,
    options: {
      batchSize: 2000,
      retries: 1,
    },
    mainProcess: async batch => {
      await Promise.all(
        batch.map(async (row, i) => {
          // タイムスタンプ	査定ID	仕分け結果
          const timestamp = row['タイムスタンプ']
          const sateiID = String(row['査定ID'] ?? '')
          const shiwakeResult = row['仕分け結果']

          if (!sateiID || !shiwakeResult) {
            return NextResponse.json({
              success: false,
              message: '査定IDまたは仕分け結果がありません。',
            })
          }

          const theDate = new Date(timestamp)

          const shiwakeCode = UCAR_CODE.SHIWAKE.byLabel(shiwakeResult)?.code

          try {
            await prisma.ucar.update({
              where: {sateiID},
              data: {destination: shiwakeCode},
            })
          } catch (error) {
            const data = {
              sateiID,
              destination: shiwakeCode,
              createdAt: theDate,
              qrIssuedAt: theDate,
              dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.SHIWAKE.code,
              userId: shiireGroupUser?.id as unknown as number,
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
        })
      )
    },
  })

  return NextResponse.json({
    success: true,
    message: '仕分け結果を更新しました。',
  })
}
