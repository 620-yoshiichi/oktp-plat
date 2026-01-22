'use server'
import {batchAlignCars} from '@app/(apps)/newCar/api/cron/orderUpsert/batchAlignCars'
import {batchCloneBigQuery} from '@app/(apps)/newCar/api/cron/orderUpsert/batchCloneBigQuery/batchCloneBigQuery'

/**
 * 注残データ作成バッチ
 * sheet API とBigQueryを用いてデータを更新
 */
export const executeOrderUpsert = async () => {
  try {
    console.time(`orderRouteBatch`)

    const cloneBigQueryResult = await batchCloneBigQuery()
    if (cloneBigQueryResult.success === false) {
      const errorDetails = cloneBigQueryResult.error
        ? ` (エラー詳細: ${cloneBigQueryResult.error.name} - ${cloneBigQueryResult.error.message} )`
        : ''
      console.error('[executeOrderUpsert] BigQueryクローン処理失敗:', cloneBigQueryResult.message + errorDetails)
      if (cloneBigQueryResult.error?.stack) {
        console.error('[executeOrderUpsert] エラースタック:', cloneBigQueryResult.error.stack)
      }
      return {
        success: false,
        message: `BigQueryクローン処理失敗: ${cloneBigQueryResult.message}`,
        error: cloneBigQueryResult.error,
      }
    }

    const alignCarsResult = await batchAlignCars()
    if (alignCarsResult.success === false) {
      console.error('[executeOrderUpsert] 車両整合処理失敗:', alignCarsResult.message)
      return {
        success: false,
        message: alignCarsResult.message,
      }
    }

    console.timeEnd(`orderRouteBatch`)
    console.log('[executeOrderUpsert] 注残データ作成完了')
    return {success: true, message: '注残データ作成完了'}
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました'
    console.error('[executeOrderUpsert] 予期しないエラー:', error)
    console.timeEnd(`orderRouteBatch`)
    return {
      success: false,
      message: `予期しないエラー: ${errorMessage}`,
    }
  }
}
