import { newCarAppUserWhere, StoreManagerForselectConfig } from '@app/(apps)/newCar/(constants)/forSelectConfig'
import { newCarSql } from '@app/(apps)/newCar/(models)/newCarSql'

import { BQ } from '@app/api/google/big-query/BigQuery'
import { BQ_parser } from '@app/api/google/big-query/bigQueryParser'
import { getMidnight } from '@cm/class/Days/date-utils/calculations'

import { funcOrVar, ObjectMap } from '@cm/lib/methods/common'
import prisma from 'src/lib/prisma'
import { processBatchWithRetry } from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import { addDays } from 'date-fns'

import { doTransaction } from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

export const maxUpdateGte = addDays(getMidnight(), -30)

// 改善されたメモリ監視関数
const logMemoryUsage = (label: string) => {
  const used = process.memoryUsage()
  const v8 = require('v8')
  const heapStats = v8.getHeapStatistics()

  const rss = Math.round(used.rss / 1024 / 1024)
  const heapTotal = Math.round(used.heapTotal / 1024 / 1024)
  const heapUsed = Math.round(used.heapUsed / 1024 / 1024)
  const external = Math.round(used.external / 1024 / 1024)
  const heapLimit = Math.round(heapStats.heap_size_limit / 1024 / 1024)

  // ヒープ使用率の計算
  const heapUsagePercent = ((heapUsed / heapLimit) * 100).toFixed(1)
  const heapTotalPercent = ((heapTotal / heapLimit) * 100).toFixed(1)

  console.log(`[${label}] Memory usage:`, {
    rss: `${rss}MB (プロセス全体)`,
    heapTotal: `${heapTotal}MB (V8確保済み, ${heapTotalPercent}%)`,
    heapUsed: `${heapUsed}MB (実使用中, ${heapUsagePercent}%)`,
    external: `${external}MB (V8外部)`,
    heapLimit: `${heapLimit}MB (設定上限)`,
    available: `${heapLimit - heapUsed}MB (利用可能)`,
  })

  // 警告レベルの表示
  if (parseFloat(heapUsagePercent) > 80) {
    console.warn(`⚠️ ヒープ使用率が高くなっています: ${heapUsagePercent}%`)
  }
  if (parseFloat(heapUsagePercent) > 90) {
    console.error(`🚨 ヒープ使用率が危険レベルです: ${heapUsagePercent}%`)
  }
}

// ガベージコレクションを強制実行
const forceGC = () => {
  if (global.gc) global.gc()
}

// バッチサイズの設定（環境に応じて調整）
const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 500 // デフォルト100件に削減
const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 10000 // BigQueryのページサイズ

// 開発用メモリ監視
// if (isDev) {
//   // メモリ制限チェック関数
//   const checkMemoryLimit = (limitMB: number = 2048) => {
//     const used = process.memoryUsage()
//     const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024)
//     const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024)

//     const isOverLimit = heapUsedMB > limitMB * 0.8 // 80%を超えたら警告
//     const isCritical = heapUsedMB > limitMB * 0.9 // 90%を超えたら危険

//     if (isCritical) {
//       console.error(`🚨 メモリ使用量が危険レベル: ${heapUsedMB}MB / ${limitMB}MB`)
//       // throw new Error(`メモリ制限を超過しました: ${heapUsedMB}MB`)
//     }

//     if (isOverLimit) {
//       console.warn(`⚠️ メモリ使用量が制限に近づいています: ${heapUsedMB}MB / ${limitMB}MB`)
//     }

//     return {
//       heapUsedMB,
//       heapTotalMB,
//       limitMB,
//       usagePercent: (heapUsedMB / limitMB) * 100,
//       isOverLimit,
//       isCritical,
//     }
//   }
//   setInterval(() => {
//     const memInfo = checkMemoryLimit()
//     console.log(`📊 メモリ使用状況: ${memInfo.heapUsedMB}MB (${memInfo.usagePercent.toFixed(1)}%)`)
//   }, 10000) // 10秒ごとに監視
// }

// 設定確認とログ出力を追加
const logInfo = () => {
  console.log('\n=== システム設定情報 ===')

  // Node.jsのメモリ設定確認
  const v8 = require('v8')
  const heapStats = v8.getHeapStatistics()

  console.log('📋 Node.js設定:')
  console.log(`  - Node.js Version: ${process.version}`)
  console.log(`  - Platform: ${process.platform}`)
  console.log(`  - Architecture: ${process.arch}`)

  console.log('🔧 メモリ設定:')
  console.log(`  - Max Old Space Size: ${Math.round(heapStats.heap_size_limit / 1024 / 1024)}MB`)
  console.log(`  - Total Available Size: ${Math.round(heapStats.total_available_size / 1024 / 1024)}MB`)

  console.log('⚙️ 環境変数:')
  console.log(`  - NODE_OPTIONS: ${process.env.NODE_OPTIONS || '未設定'}`)
  console.log(`  - BATCH_SIZE: ${process.env.BATCH_SIZE || 'デフォルト(500)'}`)
  console.log(`  - PAGE_SIZE: ${process.env.PAGE_SIZE || 'デフォルト(10000)'}`)
  console.log(`  - MAX_HEAP_MB: ${process.env.MAX_HEAP_MB || 'デフォルト(2048)'}`)

  console.log('🎯 実際の設定値:')
  console.log(`  - BATCH_SIZE: ${BATCH_SIZE}`)
  console.log(`  - PAGE_SIZE: ${PAGE_SIZE}`)

  // 現在のメモリ使用量
  const used = process.memoryUsage()
  console.log('💾 現在のメモリ使用量:')
  console.log(`  - RSS: ${Math.round(used.rss / 1024 / 1024)}MB (プロセス全体)`)
  console.log(`  - Heap Total: ${Math.round(used.heapTotal / 1024 / 1024)}MB (V8確保済み)`)
  console.log(`  - Heap Used: ${Math.round(used.heapUsed / 1024 / 1024)}MB (実使用中)`)
  console.log(`  - External: ${Math.round(used.external / 1024 / 1024)}MB (V8外部)`)

  console.log('========================\n')
}

export const batchCloneBigQuery = async () => {
  logInfo()

  const where = funcOrVar(StoreManagerForselectConfig.where)
  try {
    logMemoryUsage('処理開始')

    // 事前データの取得（最小限の情報のみ）
    const [stores, storeManagers, users] = await Promise.all([
      await prisma.store.findMany({ select: { id: true, code: true } }),
      await prisma.user.findMany({ include: { Store: true }, where }),
      await prisma.user.findMany({ select: { id: true, code: true }, where: newCarAppUserWhere }),
    ])

    // オブジェクトマップの作成
    const storeObj = Object.fromEntries(stores.map(d => [d.code, d]))
    const userObj = Object.fromEntries(users.map(d => [d.code, d]))

    // 切り替え履歴の取得
    const switchingHistory = await prisma.orderSwitchingHisotory.findMany({
      select: {
        userId: true,
        NewCar: { select: { APPINDEX: true, storeId: true, userId: true } },
      },
    })
    const switchingHistoryObj = Object.fromEntries(switchingHistory.map(d => [d.NewCar?.APPINDEX, d]))

    const nonTargetusers: any[] = []
    const { GET } = new BQ({ datasetId: `OrdersDB`, tableId: `Orders_Base` })

    // ページング処理による段階的なデータ取得
    let totalProcessedCount = 0
    let offset = 0
    let hasMoreData = true

    while (hasMoreData) {
      console.log(`\n=== ページ処理開始: offset=${offset}, pageSize=${PAGE_SIZE} ===`)

      // ページ単位でBigQueryからデータを取得
      const records = await GET({
        sqlString: newCarSql.main.getOrderCloneSql({
          maxUpdateGte,
          LIMIT: PAGE_SIZE,
          offset: offset,
        }),
      })

      // データがない場合は終了
      if (records.length === 0) {
        hasMoreData = false
        break
      }

      // レコードの変換処理
      const recordsParsedDate = records
        .map(obj => {
          try {
            // 日付パース処理
            const parsed = ObjectMap(obj, (key, value) => {
              return BQ_parser.parseDate(value)
            }) as any

            const { APPINDEX, NO_CYUMON, CD_HANSTAFF, CD_TENPO, KB_ZAIKOJYO, storeId: restStoreId, userId: restUserId, ...rest } = parsed

            let userId: number | undefined = userObj[CD_HANSTAFF]?.id
            let storeId: number | undefined = storeObj[CD_TENPO]?.id

            // 店長・スタッフ特定処理
            if (!userId || !storeId) {
              const theManager = storeManagers.find(user => {
                return Number(user.Store?.code) === Number(CD_TENPO)
              })

              if (theManager === undefined) {
                const data = { reason: `スタッフ・店長特定不可`, NO_CYUMON, CD_HANSTAFF }
                nonTargetusers.push(data)
                return null
              }
              userId = theManager.id
              storeId = theManager.Store?.id
            }

            // 切り替え履歴の適用
            if (switchingHistoryObj?.[APPINDEX]) {
              const history = switchingHistoryObj[APPINDEX]
              userId = history.userId
              storeId = history.NewCar.storeId
            }

            const data = {
              APPINDEX,
              NO_CYUMON,
              CD_HANSTAFF,
              CD_TENPO,
              Store: { connect: { id: storeId } },
              User: { connect: { id: userId } },
              ...rest,
            }

            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/2f19b60b-6ff5-4ce2-bb73-d9ffe580d2a6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'batchCloneBigQuery.tsx:222',message:'data object created',data:{APPINDEX,storeId,userId,storeIdType:typeof storeId,userIdType:typeof userId,hasStoreId:storeId!==undefined,hasUserId:userId!==undefined,hasStoreIdInData:'storeId' in data,hasUserIdInData:'userId' in data,dataKeys:Object.keys(data).slice(0,20)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion

            const queryObject = {
              where: { APPINDEX: data?.APPINDEX ?? '' },
              create: data,
              update: data
            }

            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/2f19b60b-6ff5-4ce2-bb73-d9ffe580d2a6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'batchCloneBigQuery.tsx:236',message:'queryObject created detailed',data:{whereAPPINDEX:queryObject.where.APPINDEX,whereAPPINDEXType:typeof queryObject.where.APPINDEX,createStore:queryObject.create.Store,createUser:queryObject.create.User,createStoreType:typeof queryObject.create.Store,createUserType:typeof queryObject.create.User,createStoreId:queryObject.create.Store?.connect?.id,createUserId:queryObject.create.User?.connect?.id,createStoreIdType:typeof queryObject.create.Store?.connect?.id,createUserIdType:typeof queryObject.create.User?.connect?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion

            return {
              model: `newCar`,
              method: `upsert`,
              queryObject,
            }

          } catch (error) {
            console.error(`レコード変換エラー:`, error, obj?.APPINDEX)
            return null
          }
        })
        .filter(Boolean)

      // バッチ処理の実行
      if (recordsParsedDate.length > 0) {
        const batchResult = await processBatchWithRetry({
          soruceList: recordsParsedDate,
          mainProcess: async batch => {

            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/2f19b60b-6ff5-4ce2-bb73-d9ffe580d2a6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'batchCloneBigQuery.tsx:253',message:'batch before doTransaction',data:{batchLength:batch.length,firstItem:batch[0]?{model:batch[0].model,method:batch[0].method,queryObjectKeys:Object.keys(batch[0]?.queryObject||{})}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion

            try {
              await doTransaction({
                transactionQueryList: batch,
                mode: 'parallel',
              })
            } catch (error) {
              // #region agent log
              fetch('http://127.0.0.1:7243/ingest/2f19b60b-6ff5-4ce2-bb73-d9ffe580d2a6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'batchCloneBigQuery.tsx:262',message:'error caught in batch',data:{errorMessage:error?.message,errorType:typeof error,errorIsNumber:typeof error==='number',errorString:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
              // #endregion

              console.error(`バッチ処理エラー:`, error)
              throw error
            }
          },
          options: {
            batchSize: BATCH_SIZE,
            retries: 1, // リトライ回数を増加
          },
        })
        if (batchResult.success === false) {
          throw new Error(batchResult.message)
        }
      }

      totalProcessedCount += recordsParsedDate.length

      // メモリクリーンアップ
      if (totalProcessedCount % 5 === 0) {
        forceGC()
      }
      logMemoryUsage(`ページ処理完了`)

      // 次のページへ
      offset += PAGE_SIZE

      // ページサイズより少ない場合は最後のページ
      if (records.length < PAGE_SIZE) {
        hasMoreData = false
      }
    }

    logMemoryUsage('全処理完了')

    // 処理できなかったユーザーの報告
    if (nonTargetusers.length > 0) {
      console.warn(`処理できなかったレコード数: ${nonTargetusers.length}`, nonTargetusers.slice(0, 10))
    }

    return {
      success: true,
      processedCount: totalProcessedCount,
      nonTargetCount: nonTargetusers.length,
      message: `${totalProcessedCount}件のレコードを処理しました`,
    }
  } catch (error) {
    logMemoryUsage('エラー発生時')
    console.error('batchCloneBigQuery エラー:', error)
    throw error
  }
}
