'use server'
import {batchTenpoTsuikoData} from '@app/(apps)/newCar/api/cron/orderUpsert/batchTenpoTsuikoData/batchTenpoTsuikoData'

/**
 * 追工データ更新バッチ
 * BigQueryを用いてデータを更新
 */
export const executeTenpoTsuikoUpsert = async () => {
  console.time(`tenpoTsuikoUpsertBatch`)
  await batchTenpoTsuikoData()
  console.timeEnd(`tenpoTsuikoUpsertBatch`)

  return {success: true, message: '追工データ更新完了'}
}
