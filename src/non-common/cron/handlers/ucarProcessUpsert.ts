'use server'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import {bigQuery__select} from '@app/api/google/big-query/bigQueryApi'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import prisma from 'src/lib/prisma'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {BQ_parser} from '@app/api/google/big-query/bigQueryParser'
import {UCAR_CONSTANTS} from '@app/(apps)/ucar/(constants)/ucar-constants'

/**
 * UcarProcess アップサートバッチ
 * BigQueryからUcarProcessデータを取得し、DBに登録されていないものをアップサートする
 */
export const executeUcarProcessUpsert = async () => {
  // BigQueryのカラム名とプロセスコードのマッピングを取得
  const processCodeMapping = Object.entries(UcarProcessCl.CODE.raw)
    .filter(([_, item]) => item.bqFieldName) // bqFieldNameが設定されているもののみ
    .map(([key, item]) => ({
      processCode: item.code,
      bqFieldName: item.bqFieldName as string,
      sortOrder: item.code.includes('CS') ? 1 : item.code.includes('CR') ? 2 : 3, // ソート順を決定
    }))

  // BigQueryからデータを取得
  const bqData = await bigQuery__select({
    datasetId: 'Ucar_QR',
    tableId: 'QR_Prosess',
    sqlString: sql`SELECT *
    FROM okayamatoyopet.Ucar_QR.QR_Prosess
    WHERE max_update >= '2025-01-01 00:00:00'
    ORDER BY max_update DESC
    `,
  })

  // 現在のDBからUcarProcessデータを取得（既存データのチェック用）
  const existingProcesses = await prisma.ucarProcess.findMany({
    // where: {
    //   dataSource: 'BIG_QUERY_QR_PROCESS',
    // },
    select: {
      sateiID: true,
      processCode: true,
      date: true,
    },
  })

  // 既存データをセットで管理（高速な存在チェック用）
  const existingSet = new Set(existingProcesses.map(p => `${p.sateiID}|${p.processCode}|${p.date?.toISOString()}`))

  // システムユーザーIDを取得（または固定値を使用）
  const shiireGroupUser = await prisma.user.findFirst({
    where: {code: UCAR_CONSTANTS.shiireGroupUserCode},
  })

  if (!shiireGroupUser?.id) {
    return {
      success: false,
      message: 'システムユーザーが存在しません',
      result: null,
    }
  }

  // DBに対応するUcarが存在するsateiIDのセットを取得
  const existingUcars = await prisma.ucar.findMany({
    select: {sateiID: true},
  })
  const existingUcarSet = new Set(existingUcars.map(u => u.sateiID))

  // アップサート対象のデータを構築
  const processesToUpsert: {
    sateiID: string
    processCode: string
    date: Date
    dataSource: string
    sortOrder: number
    userId: number
  }[] = []

  bqData.forEach((row, i) => {
    const sateiID = row.sateiId as string

    // DBにUcarが存在しない場合はスキップ
    if (!existingUcarSet.has(sateiID)) {
      return
    }

    processCodeMapping.forEach(mapping => {
      const rawDate = row[mapping.bqFieldName]
      if (!rawDate) return // 日時がnullの場合はスキップ

      const date = BQ_parser.parseDate(rawDate)

      // const key = `${sateiID}|${mapping.processCode}|${date.toISOString()}`

      // // 既存データと完全一致する場合はスキップ
      // if (existingSet.has(key)) {
      //   return
      // }

      processesToUpsert.push({
        sateiID,
        processCode: mapping.processCode,
        date,
        dataSource: 'BIG_QUERY_QR_PROCESS',
        sortOrder: mapping.sortOrder,
        userId: shiireGroupUser?.id,
      })
    })
  })

  // バッチ処理でアップサート
  let upsertedCount = 0
  await processBatchWithRetry({
    soruceList: processesToUpsert,
    mainProcess: async batch => {
      for (const item of batch) {
        await prisma.ucarProcess.upsert({
          where: {
            unique_sateiID_date_processCode: {
              sateiID: item.sateiID,
              date: item.date,
              processCode: item.processCode,
            },
          },
          create: item,
          update: {
            userId: shiireGroupUser?.id,
            dataSource: item.dataSource,
            sortOrder: item.sortOrder,
            updatedAt: new Date(),
          },
        })
        upsertedCount++
      }
    },
  })

  return {
    success: true,
    message: 'UcarProcess アップサート完了',
    result: {
      totalBqRecords: bqData.length,
      existingProcesses: existingProcesses.length,
      upsertedCount,
    },
  }
}
