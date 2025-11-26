'use server'

import {BQ} from '@app/api/google/big-query/BigQuery'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'

export const batchTenpoTsuikoData = async () => {
  console.log('🔄 バッチ: 店舗追工データ処理開始')

  await doStandardPrisma('tenpoTsuikoData', 'deleteMany', {
    where: {APPINDEX: {not: ''}},
  })

  try {
    // 1. BigQueryから追工データを取得
    const {GET: getBigQueryData} = new BQ({
      datasetId: 'okayamatoyopet.OrdersDB',
      tableId: 'YohinMeisai',
    })

    const sqlString = sql`
      SELECT
        m.APPINDEX AS APPINDEX,
        m.APPINDEX_FKEY AS APPINDEX_FKEY,
        m.CD_TUIKO,
        m.MJ_TUIKOM,
        m.KI_TUIKOKIN,
        o.CD_TENPO,
        o.CD_HANSTAFF,
        o.KJ_KURUMAME,
        o.NO_CYUMON,
        o.KJ_KAINMEI1,
        o.APPINDEX AS JUCHU_APPINDEX
      FROM okayamatoyopet.OrdersDB.YohinMeisai as m
      LEFT JOIN okayamatoyopet.OrdersDB.Orders_Base o
      ON m.APPINDEX_FKEY = o.APPINDEX
      WHERE m.CD_TUIKO IN (
        '3999',
        '360Z',
        '721Z'
      )
        AND o.APPINDEX IS NOT NULL
      ORDER BY o.APPINDEX DESC
    `

    console.log('📊 BigQueryからデータ取得中...')
    const bigQueryData = await getBigQueryData({sqlString})
    console.log(`📦 BigQueryから${bigQueryData.length}件のデータを取得`)

    if (bigQueryData.length === 0) {
      console.log('ℹ️ 処理対象のデータがありません')
      return {success: true, message: '処理対象のデータがありません', count: 0}
    }

    // 2. NewCarとの関連付けのために、APPINDEXでNewCarを検索
    const appIndexes = bigQueryData.map(row => row.JUCHU_APPINDEX)

    const {result: newCars} = await doStandardPrisma('newCar', 'findMany', {
      where: {APPINDEX: {in: appIndexes}},
      select: {id: true, APPINDEX: true},
    })

    // const newCarMap = new Map(newCars.map(car => [car.APPINDEX, car.id]))

    // 3. データを1件ずつupsert
    let upsertedCount = 0
    const transactionQueryList: transactionQuery<'tenpoTsuikoData', 'upsert'>[] = []

    for (const row of bigQueryData) {
      // const newCarId = (newCarMap.get(row.JUCHU_APPINDEX) ?? 0) as number
      // if (!newCarId) continue

      try {
        const upsertData = {
          APPINDEX: row.APPINDEX,
          APPINDEX_FKEY: row.JUCHU_APPINDEX,
          CD_TUIKO: row.CD_TUIKO,
          MJ_TUIKOM: row.MJ_TUIKOM || null,
          KI_TUIKOKIN: Number(row.KI_TUIKOKIN) || null,
          CD_TENPO: row.CD_TENPO || null,
          CD_HANSTAFF: row.CD_HANSTAFF || null,
          KJ_KURUMAME: row.KJ_KURUMAME || null,
          NO_CYUMON: row.NO_CYUMON || null,
          KJ_KAINMEI1: row.KJ_KAINMEI1 || null,
          processed: false,
        }

        transactionQueryList.push({
          model: 'tenpoTsuikoData',
          method: 'upsert',
          queryObject: {
            where: {APPINDEX: row.APPINDEX},
            create: upsertData,
            update: {
              CD_TUIKO: upsertData.CD_TUIKO,
              MJ_TUIKOM: upsertData.MJ_TUIKOM,
              KI_TUIKOKIN: Number(upsertData.KI_TUIKOKIN),
              CD_TENPO: upsertData.CD_TENPO,
              CD_HANSTAFF: upsertData.CD_HANSTAFF,
              KJ_KURUMAME: upsertData.KJ_KURUMAME,
              NO_CYUMON: upsertData.NO_CYUMON,
              KJ_KAINMEI1: upsertData.KJ_KAINMEI1,

              // processedは更新時は変更しない（既存の状態を維持）
            },
          },
        })

        upsertedCount++
        continue
      } catch (error) {
        console.error(`❌ upsertエラー (APPINDEX: ${row.APPINDEX}):`, error)
      }
    }

    await processBatchWithRetry({
      soruceList: transactionQueryList,
      mainProcess: async batch => {
        await doTransaction({
          transactionQueryList: batch,
          mode: 'sequential',
        })
      },
    })

    console.log(`✅ 店舗追工データ処理完了: ${upsertedCount}件処理`)
    return {
      success: true,
      message: `${upsertedCount}件の追工データを処理しました`,
      count: upsertedCount,
    }
  } catch (error) {
    console.error('❌ 店舗追工データバッチ処理エラー:', error)
    return {
      success: false,
      message: `エラーが発生しました: ${error.message}`,
      count: 0,
    }
  }
}
