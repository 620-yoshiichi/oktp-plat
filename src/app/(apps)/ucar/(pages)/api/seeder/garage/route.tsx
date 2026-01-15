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

  // デフォルトユーザー取得
  const shiireGroupUser = await prisma.user.findFirst({
    where: {code: UCAR_CONSTANTS.shiireGroupUserCode},
  })

  if (!shiireGroupUser) {
    return NextResponse.json({success: false, message: 'デフォルトユーザーが見つかりません'})
  }

  // 2. garageUsageLocationEn → DB name マッピング
  const locationNameMap: Record<string, string> = {
    岡山南: '岡山',
    倉敷: '倉敷',
  }

  // 3. 必要な車庫とSlotのリストを作成
  const requiredGarageSlots = new Set<string>()
  rows.forEach(row => {
    const {garageId, garageUsageLocationEn} = row
    if (!garageId || !garageUsageLocationEn) return

    const locationName = locationNameMap[garageUsageLocationEn] || garageUsageLocationEn
    const garageNumber = Number(garageId)
    if (isNaN(garageNumber)) return

    // locationNameとgarageNumberの組み合わせをキーとして保存
    requiredGarageSlots.add(`${locationName}:${garageNumber}`)
  })

  // 4. 必要なLocationMasterとSlotMasterを確認・作成
  const garageLocationMasters = await prisma.ucarGarageLocationMaster.findMany()
  const garageSlotMasters = await prisma.ucarGarageSlotMaster.findMany()

  const locationMasterMap = new Map<string, number>()
  const slotMasterMap = new Map<string, number>()

  // LocationMasterの確認・作成
  for (const slotKey of requiredGarageSlots) {
    const [locationName] = slotKey.split(':')

    if (!locationMasterMap.has(locationName)) {
      let locationMaster = garageLocationMasters.find(l => l.name === locationName)

      if (!locationMaster) {
        // LocationMasterが存在しない場合は作成
        locationMaster = await prisma.ucarGarageLocationMaster.create({
          data: {
            name: locationName,
            active: true,
            sortOrder: 0,
          },
        })
      }

      locationMasterMap.set(locationName, locationMaster.id)
    }
  }

  // SlotMasterの確認・作成
  for (const slotKey of requiredGarageSlots) {
    const [locationName, garageNumberStr] = slotKey.split(':')
    const garageNumber = Number(garageNumberStr)
    const locationMasterId = locationMasterMap.get(locationName)!

    if (!slotMasterMap.has(slotKey)) {
      let slotMaster = garageSlotMasters.find(
        s => s.garageNumber === garageNumber && s.ucarGarageLocationMasterId === locationMasterId
      )

      if (!slotMaster) {
        // SlotMasterが存在しない場合は作成
        slotMaster = await prisma.ucarGarageSlotMaster.create({
          data: {
            garageNumber,
            ucarGarageLocationMasterId: locationMasterId,
            active: true,
            sortOrder: 0,
          },
        })
      }

      slotMasterMap.set(slotKey, slotMaster.id)
    }
  }

  // 5. AppliedUcarGarageSlot を upsert
  let ucarCreatedCount = 0
  const results = await Promise.all(
    rows.map(async row => {
      const {timestamp, garageId, sateiId, garageUsageLocationEn} = row

      if (!sateiId || !garageId || !timestamp) return null

      // location マッピング
      const locationName = locationNameMap[garageUsageLocationEn] || garageUsageLocationEn
      const garageNumber = Number(garageId)
      if (isNaN(garageNumber)) return null

      // 作成済みのSlotMasterを取得
      const slotKey = `${locationName}:${garageNumber}`
      const slotMasterId = slotMasterMap.get(slotKey)
      if (!slotMasterId) return null

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
              ucarGarageSlotMasterId: slotMasterId,
            },
          },
          create: {
            sateiID: String(sateiId),
            appliedAt: toUtc(new Date(timestamp)),
            ucarGarageSlotMasterId: slotMasterId,
          },
          update: {
            appliedAt: toUtc(new Date(timestamp)),
            ucarGarageSlotMasterId: slotMasterId,
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
  const result = {
    success: true,
    result: {total: rows.length, garageSlotCreated: successCount, ucarCreated: ucarCreatedCount},
    message: `${successCount}件の車庫履歴を登録しました（Ucar新規作成: ${ucarCreatedCount}件）`,
  }

  return NextResponse.json(result)
}
