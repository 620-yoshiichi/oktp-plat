import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'
import {isCron} from 'src/non-common/serverSideFunction'
import {BatchConfig} from './batchMaster'

/**
 * 実行ログのステータス
 */
type ExecutionStatus = 'running' | 'success' | 'failure'

/**
 * 実行ログを作成
 */
const createExecutionLog = async (batchConfig: BatchConfig) => {
  return await prisma.cronExecutionLog.create({
    data: {
      batchId: batchConfig.id,
      batchName: batchConfig.name,
      status: 'running' as ExecutionStatus,
    },
  })
}

/**
 * 実行ログを更新（成功）
 */
const updateExecutionLogForSuccess = async (logId: number, startTime: number, result: any) => {
  const duration = Date.now() - startTime
  const resultString = result ? JSON.stringify(result).slice(0, 5000) : null // 5000文字まで

  await prisma.cronExecutionLog.update({
    where: {id: logId},
    data: {
      status: 'success' as ExecutionStatus,
      completedAt: new Date(),
      duration,
      result: resultString,
    },
  })
}

/**
 * 実行ログを更新（失敗）
 */
const updateExecutionLogForFailure = async (logId: number, startTime: number, error: Error) => {
  const duration = Date.now() - startTime

  await prisma.cronExecutionLog.update({
    where: {id: logId},
    data: {
      status: 'failure' as ExecutionStatus,
      completedAt: new Date(),
      duration,
      errorMessage: error.message?.slice(0, 2000), // 2000文字まで
    },
  })
}

/**
 * Cronバッチを実行する共通ラッパー
 * - 認証チェック
 * - 実行ログの記録（開始/完了/エラー）
 * - エラーハンドリング
 */
export const executeCronBatch = async (req: NextRequest, batchConfig: BatchConfig): Promise<NextResponse> => {


  // 認証チェック
  if ((await isCron({req})) === false) {
    return NextResponse.json({success: false, message: `Unauthorized`, result: null}, {status: 401, statusText: `Unauthorized`})
  }

  const startTime = Date.now()
  let log: {id: number} | null = null



  try {
    // 実行開始ログを記録
    log = await createExecutionLog(batchConfig)

    console.log(`[CRON] Starting batch: ${batchConfig.name} (${batchConfig.id})`)

    // handlerの存在チェック
    if (!batchConfig.handler) {
      throw new Error(`Handler not found for batch: ${batchConfig.id}`)
    }

    // バッチ処理を実行
    const result = await batchConfig.handler()

    // 実行成功ログを記録
    await updateExecutionLogForSuccess(log.id, startTime, result)

    console.log(`[CRON] Completed batch: ${batchConfig.name} (${batchConfig.id}) in ${Date.now() - startTime}ms`)

    return NextResponse.json({
      success: true,
      message: `${batchConfig.name} completed`,
      batchId: batchConfig.id,
      duration: Date.now() - startTime,
      result,
    })
  } catch (error: any) {
    console.error(`[CRON] Error in batch: ${batchConfig.name} (${batchConfig.id})`, error.stack)

    // 実行失敗ログを記録
    if (log) {
      await updateExecutionLogForFailure(log.id, startTime, error)
    }

    return NextResponse.json(
      {
        success: false,
        message: `${batchConfig.name} failed: ${error.message}`,
        batchId: batchConfig.id,
        duration: Date.now() - startTime,
        result: null,
      },
      {status: 500}
    )
  }
}
