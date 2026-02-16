'use server'
import {bigQuery__select} from '@app/api/google/big-query/bigQueryApi'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import prisma from 'src/lib/prisma'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {useRawSql} from '@cm/class/SqlBuilder/useRawSql'
import {BQ_parser} from '@app/api/google/big-query/bigQueryParser'
import {Days} from '@cm/class/Days/Days'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {UCAR_CONSTANTS} from '@app/(apps)/ucar/(constants)/ucar-constants'
import {anyObject} from '@cm/types/utility-types'

/**
 * 古物台帳 Rawデータ取り込みバッチ
 * BigQueryから古物台帳データを同期する
 */
export const executeOldCarsDeleteAndCreate = async () => {
  const shiireGroupUser = await prisma.user.findFirst({
    where: {code: UCAR_CONSTANTS.shiireGroupUserCode},
  })
  let body: anyObject[] = []
  body = await bigQuery__select({
    datasetId: 'OrdersDB',
    tableId: 'OldCars_Base',
    sqlString: sql`SELECT * FROM okayamatoyopet.OrdersDB.OldCars_Base `,
  })

  body = body.map(item => {
    Object.keys(item).forEach(key => {
      const toDate = BQ_parser.parseDate(item[key])
      const toDateTarget = key.includes('DD_') && key !== 'DD_SIREBD'
      if (toDateTarget) {
        if (Days.validate.isDate(toDate)) {
          item[key] = toUtc(toDate)
        } else {
          item[key] = null
        }
      }
    })

    return item
  })

  await useRawSql({sql: sql`delete from "OldCars_Base" `})

  await processBatchWithRetry({
    soruceList: body,
    mainProcess: async batch => {
      await prisma.oldCars_Base.createMany({data: batch})
    },
  })

  const allUcars = await prisma.ucar.findMany({
    include: {
      UcarProcess: {
        where: {processCode: 'CR10'},
      },
      OldCars_Base: {select: {DD_URIAGE: true}},
    },
  })

  let count = 0
  allUcars.forEach(async ucar => {
    if (ucar && shiireGroupUser && ucar.UcarProcess.length === 0 && ucar.OldCars_Base?.DD_URIAGE) {
      await prisma.ucarProcess.create({
        data: {
          sateiID: ucar.sateiID,
          userId: shiireGroupUser.id,
          processCode: 'CR10',
          date: ucar.OldCars_Base?.DD_URIAGE,
          dataSource: 'BIG_QUERY_OLD_CARS_BASE',
        },
      })

      count++
    }
  })

  return {
    success: true,
    message: '古物台帳データ取り込み完了',
    result: {count: body.length},
  }
}
