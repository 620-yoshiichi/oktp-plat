import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'
import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {handlePrismaError} from '@cm/lib/prisma-helper'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'
import {UCAR_CONSTANTS} from '@app/(apps)/ucar/(constants)/ucar-constants'

export const POST = async (req: NextRequest) => {
  // 1. スプレッドシートからデータ取得
  const spread_res = await GoogleSheet_Read({
    spreadsheetId: `https://docs.google.com/spreadsheets/d/1W9UO04kueStte4-AQ1MExbjhwGl_RMEO7aMsM2LMJLo/edit?pli=1&gid=423178238#gid=423178238`,
    range: '車庫証明利用申請フォーム!A3:AK',
  })

  const header = [
    'timestamp',
    'garageId',
    'sateiId',
    'carName',
    'model',
    'vin',
    'length',
    'width',
    'height',
    'isCompanyCar',
    'garageUsageLocationEn',
  ]
  const data = spread_res.values ?? []
  const rows = data.map(d => Object.fromEntries(header.map((key, idx) => [key, d[idx]])))

  // 2. マスターデータ取得
  const garageLocationMasters = await prisma.ucarGarageLocationMaster.findMany()
  const garageSlotMasters = await prisma.ucarGarageSlotMaster.findMany()

  // デフォルトユーザー取得
  const shiireGroupUser = await prisma.user.findFirst({
    where: {code: UCAR_CONSTANTS.shiireGroupUserId},
  })
  if (!shiireGroupUser) {
    return NextResponse.json({success: false, message: 'デフォルトユーザーが見つかりません'})
  }

  // 3. garageUsageLocationEn → DB name マッピング
  const locationNameMap: Record<string, string> = {
    岡山南: '岡山',
    倉敷: '倉敷',
  }

  // 4. AppliedUcarGarageSlot を upsert
  let ucarCreatedCount = 0
  const results = await Promise.all(
    rows.map(async row => {
      const {timestamp, garageId, sateiId, garageUsageLocationEn} = row

      if (!sateiId || !garageId || !timestamp) return null

      // location マッピング
      const locationName = locationNameMap[garageUsageLocationEn] || garageUsageLocationEn
      const locationMaster = garageLocationMasters.find(l => l.name === locationName)
      if (!locationMaster) return null

      // garageSlotMaster 検索
      const slotMaster = garageSlotMasters.find(
        s => s.garageNumber === Number(garageId) && s.ucarGarageLocationMasterId === locationMaster.id
      )
      if (!slotMaster) return null

      try {
        // 該当のUcarが存在するかチェック
        const existingUcar = await prisma.ucar.findUnique({
          where: {sateiID: String(sateiId)},
        })

        // 存在しなければ作成
        if (!existingUcar) {
          const appliedAt = toUtc(new Date(timestamp))
          await prisma.ucar.create({
            data: {
              sateiID: String(sateiId),
              qrIssuedAt: appliedAt,
              createdAt: appliedAt,
              userId: shiireGroupUser.id,
              dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.GARAGE.code,
            },
          })
          ucarCreatedCount++
        }

        return await prisma.appliedUcarGarageSlot.upsert({
          where: {
            unique_sateiID_ucarGarageSlotMasterId: {
              sateiID: String(sateiId),
              ucarGarageSlotMasterId: slotMaster.id,
            },
          },
          create: {
            sateiID: String(sateiId),
            appliedAt: toUtc(new Date(timestamp)),
            ucarGarageSlotMasterId: slotMaster.id,
          },
          update: {
            appliedAt: toUtc(new Date(timestamp)),
            ucarGarageSlotMasterId: slotMaster.id,
          },
        })
      } catch (error) {
        const errorMessage = handlePrismaError(error)
        console.error(`Failed to upsert: sateiId=${sateiId}`, errorMessage)
        return null
      }
    })
  )

  const successCount = results.filter(Boolean).length
  return NextResponse.json({
    success: true,
    result: {total: rows.length, garageSlotCreated: successCount, ucarCreated: ucarCreatedCount},
    message: `${successCount}件の車庫履歴を登録しました（Ucar新規作成: ${ucarCreatedCount}件）`,
  })
}
