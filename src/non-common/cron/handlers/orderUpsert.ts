'use server'
import {batchAlignCars} from '@app/(apps)/newCar/api/cron/orderUpsert/batchAlignCars'
import {batchCloneBigQuery} from '@app/(apps)/newCar/api/cron/orderUpsert/batchCloneBigQuery/batchCloneBigQuery'

/**
 * 注残データ作成バッチ
 * sheet API とBigQueryを用いてデータを更新
 */
export const executeOrderUpsert = async () => {
  console.time(`orderRouteBatch`)
  await batchCloneBigQuery()
  await batchAlignCars()
  console.timeEnd(`orderRouteBatch`)

  return {success: true, message: '注残データ作成完了'}
}
