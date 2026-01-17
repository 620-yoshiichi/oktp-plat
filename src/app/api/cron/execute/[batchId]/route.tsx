import {NextRequest, NextResponse} from 'next/server'
import {executeCronBatch} from 'src/non-common/cron/cronExecutor'
import {BATCH_MASTER} from 'src/non-common/cron/batchMaster'
import {isCron} from 'src/non-common/serverSideFunction'

/**
 * Cronバッチ実行エンドポイント
 * 全てのバッチをこの単一エンドポイントで処理
 *
 * 使用例:
 * - GET /api/cron/execute/orderUpsert
 * - GET /api/cron/execute/tenpoTsuikoUpsert
 * - ...
 */
export const GET = async (req: NextRequest, {params}: {params: Promise<{batchId: string}>}) => {
  if ((await isCron({req})) === false) {
    const res = {success: false, message: `Unauthorized`, result: null}
    const status = {status: 401, statusText: `Unauthorized`}
    return NextResponse.json(res, status)
  }

  const {batchId} = await params
  const batchConfig = BATCH_MASTER[batchId]

  // バッチが見つからない場合
  if (!batchConfig) {
    console.error(`[CRON] Unknown batch: ${batchId}`)
    return NextResponse.json(
      {
        success: false,
        message: `Unknown batch: ${batchId}`,
        availableBatches: Object.keys(BATCH_MASTER),
      },
      {status: 404}
    )
  }

  // バッチ実行（認証チェック・ログ記録込み）
  return executeCronBatch(req, batchConfig)
}
