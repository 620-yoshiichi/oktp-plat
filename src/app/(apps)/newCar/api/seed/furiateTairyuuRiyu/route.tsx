import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import prisma from 'src/lib/prisma'
import {NextResponse} from 'next/server'

const SPREADSHEET_ID = '1vGH5ik7ypFs1hNM_GskHzWLi6xdqW6uJu7I0UTRTpq8'
const SHEET_NAME = '理由'

export const POST = async () => {
  const data = await GoogleSheet_Read({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}`,
  })

  const rows = data.values
  if (!rows || rows.length <= 1) {
    return NextResponse.json({success: true, message: 'データなし', result: {updated: 0, skipped: 0, notFound: 0}})
  }

  const [header, ...dataRows] = rows
  const idxId = header.indexOf('ID')
  const idxTorokuYotei = header.indexOf('登録予定日')
  const idxChienRiyu = header.indexOf('滞留理由')
  const idxNoukiRiyu = header.indexOf('納期未指定理由')

  let updated = 0
  let skipped = 0
  let notFound = 0
  const errors: string[] = []

  for (const row of dataRows) {
    const appindex = row[idxId]?.trim()
    if (!appindex) {
      skipped++
      continue
    }

    const torokuYoteiRaw = row[idxTorokuYotei]?.trim() || null
    const chienRiyu = row[idxChienRiyu]?.trim() || null
    const noukiRiyu = row[idxNoukiRiyu]?.trim() || null

    if (!chienRiyu && !noukiRiyu && !torokuYoteiRaw) {
      skipped++
      continue
    }

    try {
      const car = await prisma.newCar.findUnique({where: {APPINDEX: appindex}})
      if (!car) {
        notFound++
        errors.push(`APPINDEX=${appindex}: not found`)
        continue
      }

      const updateData: Record<string, any> = {}
      if (chienRiyu) updateData.furiate_chien_riyu = chienRiyu
      if (noukiRiyu) updateData.nouki_mishitei_riyu = noukiRiyu
      if (torokuYoteiRaw) {
        updateData.m1_toroku_prediction = toUtc(torokuYoteiRaw)
      }

      await prisma.newCar.update({
        where: {APPINDEX: appindex},
        data: updateData,
      })
      updated++
    } catch (e: any) {
      errors.push(`APPINDEX=${appindex}: ${e.message}`)
    }
  }

  return NextResponse.json({
    success: true,
    message: `更新: ${updated}件, スキップ: ${skipped}件, 未発見: ${notFound}件`,
    result: {updated, skipped, notFound, errors: errors.slice(0, 20)},
  })
}
