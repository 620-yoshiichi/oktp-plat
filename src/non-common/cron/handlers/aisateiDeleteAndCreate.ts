'use server'
import {sateiTableCompartionCols} from '@app/(apps)/ucar/class/ColBuilder/AI_SATEI_COLS'
import {upassCols} from '@app/(apps)/ucar/files/upass/upass-columns'
import {bigQuery__select} from '@app/api/google/big-query/bigQueryApi'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import prisma from 'src/lib/prisma'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {useRawSql} from '@cm/class/SqlBuilder/useRawSql'

/**
 * AI査定 Rawデータ取り込みバッチ
 * BigQueryからAI査定データを同期する
 */
export const executeAisateiDeleteAndCreate = async () => {
  const selectString = sateiTableCompartionCols.map(d => `${d.bqKeys.proto}`).join(`, `)

  const body = await bigQuery__select({
    datasetId: 'Ucar_QR',
    tableId: 'AI_satei',
    sqlString: sql`SELECT ${selectString} FROM okayamatoyopet.Ucar_QR.AI_satei`,
  })

  const upassListToCreate: any[] = []

  body.forEach(row => {
    const upassObj = {
      dataSource: 'aisatei',
    }

    sateiTableCompartionCols.map((col, idx) => {
      const aisateiColKey = col.bqKeys.proto
      const upassCol = upassCols.find(d => d.en === col.bqKeys.upass)

      let value = row[aisateiColKey]

      if (col.type === 'date') {
        value = value ? toUtc(formatDate(new Date(value), 'YYYY-MM-DD HH:mm:ss')) : null
      }

      if (upassCol) {
        upassObj[upassCol.en] = value
      }
    })

    upassListToCreate.push(upassObj)
  })

  // データの削除
  await useRawSql({sql: sql`delete from "UPASS" where "dataSource" = 'aisatei' `})

  // UPASSデータの作成
  await processBatchWithRetry({
    soruceList: upassListToCreate,
    mainProcess: async batch => {
      await prisma.uPASS.createMany({
        data: batch.map(d => ({
          ...d,
          shitadoriRelationAssessmentNumber: d.sateiID,
        })),
      })
    },
  })

  return {success: true, message: 'AI査定データ取り込み完了', result: {count: upassListToCreate.length}}
}
