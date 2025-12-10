import {NextRequest, NextResponse} from 'next/server'

import prisma from 'src/lib/prisma'

import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'

export const POST = async (req: NextRequest) => {
  const result: any = {}

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

  await Promise.all(
    rows.map(async row => {
      // タイムスタンプ	査定ID	仕分け結果
      const timestamp = row['タイムスタンプ']
      const sateiID = row['査定ID']
      const shiwakeResult = row['仕分け結果']

      if (!sateiID || !shiwakeResult) {
        return
      }

      const shiwakeCode = UCAR_CODE.SHIWAKE.byLabel(shiwakeResult)?.code

      await prisma.ucar.update({
        where: {sateiID},
        data: {
          destination: shiwakeCode,
        },
      })
    })
  )

  return NextResponse.json({
    success: true,
    message: '仕分け結果を更新しました。',
  })
}
