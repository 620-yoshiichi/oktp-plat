import {NextRequest, NextResponse} from 'next/server'

import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import prisma from 'src/lib/prisma'
import {transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {Prisma} from '@prisma/client'

import createUcarDataByAssessmentId from '@app/(apps)/ucar/(pages)/api/seeder/createUcarDataByAssessmentId'
import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'

export const POST = async (req: NextRequest) => {
  const result: any = {}

  result[`kurasikiGarageMaster`] = await seedGarageNameMaster({
    UcarGarageLocationMasterName: `倉敷`,
    ss_range: `車庫空き状況_倉敷!A:H`,
  })
  result[`okayamaGarageMaster`] = await seedGarageNameMaster({
    UcarGarageLocationMasterName: `岡山`,
    ss_range: `車庫空き状況_岡山!A:H`,
  })

  return NextResponse.json({success: true, result, message: `データを取得しました`})
}

const seedGarageNameMaster = async ({
  ss_range,
  UcarGarageLocationMasterName = `倉敷`,
  // seedingTsvFilePath = ``,
}) => {
  const shako_csv_res = await GoogleSheet_Read({
    spreadsheetId: `1W9UO04kueStte4-AQ1MExbjhwGl_RMEO7aMsM2LMJLo`,
    range: ss_range,
  })

  const shako_csv = shako_csv_res?.values ?? []

  //査定番号がない場合は、査定番号のみでデータを作成
  await createUcarDataByAssessmentId({sateiIdList: shako_csv.map(row => row?.[`査定ID`]).filter(Boolean)})

  //locationの作成
  const newGarageLocationMaster = await prisma.ucarGarageLocationMaster.upsert({
    where: {name: UcarGarageLocationMasterName},
    create: {name: UcarGarageLocationMasterName},
    update: {name: UcarGarageLocationMasterName},
  })

  //データの読み取り
  const ucarGarageLocationMasterId = newGarageLocationMaster.id

  const headers = [`garageNumber`, `使用中の数`, `販売数`, `使用中`, `査定ID`, `車名`, `型式`, `車体番号`]
  const body = shako_csv.slice(1).map(d => {
    return Object.fromEntries(d.map((value, idx) => [headers[idx], value]))
  })

  //①ループ車庫スロットの作成
  const ucarGarageSlotMasterQuery: transactionQuery<'ucarGarageSlotMaster', 'upsert'>[] = []
  body.forEach(d => {
    const garageNumber = Number(d.garageNumber)
    if (isNaN(garageNumber)) return

    const data = {ucarGarageLocationMasterId, garageNumber}

    if (!garageNumber || !ucarGarageLocationMasterId) {
      console.error(`garageNumber: ${garageNumber}, ucarGarageLocationMasterId: ${ucarGarageLocationMasterId}`)
      return
    }
    const payload: Prisma.UcarGarageSlotMasterUpsertArgs = {
      where: {
        unique_garageNumber_ucarGarageLocationMasterId: {
          garageNumber,
          ucarGarageLocationMasterId,
        },
      },
      create: {...data},
      update: {...data},
    }

    ucarGarageSlotMasterQuery.push({
      model: 'ucarGarageSlotMaster',
      method: 'upsert',
      queryObject: payload,
    })
  })
  const {result: upsertedGarageMaster} = await doTransaction({transactionQueryList: ucarGarageSlotMasterQuery})

  const whereIn = body.map(d => String(d.査定ID))

  const relatedUcars = await prisma.ucar.findMany({
    where: {sateiID: {in: whereIn}},
  })

  const upsertedAppliedUcarGarageSlot = await Promise.all(
    body.map(async row => {
      const ucarGarageSlotMaster = upsertedGarageMaster.find(garage => String(garage?.garageNumber) === String(row?.garageNumber))
      const theUcar = relatedUcars.find(ucar => ucar?.sateiID?.toString() === row?.[`査定ID`]?.toString())
      if (ucarGarageSlotMaster && theUcar) {
        const ucarId = theUcar.id
        const ucarGarageSlotMasterId = ucarGarageSlotMaster.id
        const data = {
          appliedAt: new Date().toISOString(),
          ucarId,
          ucarGarageSlotMasterId,
        }

        const unique_sateiID_ucarGarageSlotMasterId = {ucarId, ucarGarageSlotMasterId: ucarGarageSlotMaster.id}

        const payload: Prisma.AppliedUcarGarageSlotUpsertArgs = {
          where: {unique_sateiID_ucarGarageSlotMasterId},
          create: data,
          update: data,
        }
        try {
          return await prisma.appliedUcarGarageSlot.upsert(payload)
        } catch (error) {
          // console.error(error.stack) //////////
        }
      }
      return
    })
  )

  return {upsertedGarageMaster, upsertedAppliedUcarGarageSlot}
}
