import {bigQuery__select} from '@app/api/google/big-query/bigQueryApi'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import prisma from 'src/lib/prisma'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {useRawSql} from '@cm/class/SqlBuilder/useRawSql'
import {BQ_parser} from '@app/api/google/big-query/bigQueryParser'
import {Days} from '@cm/class/Days/Days'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

/**
 * 古物台帳 Rawデータ取り込みバッチ
 * BigQueryから古物台帳データを同期する
 */
export const executeOldCarsDeleteAndCreate = async () => {
  let body = await bigQuery__select({
    datasetId: 'OrdersDB',
    tableId: 'OldCars_Base',
    sqlString: sql`SELECT * FROM okayamatoyopet.OrdersDB.OldCars_Base`,
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

  return {success: true, message: '古物台帳データ取り込み完了', result: {count: body.length}}
}
