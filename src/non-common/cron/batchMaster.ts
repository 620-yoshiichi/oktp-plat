import {executeOrderUpsert} from './handlers/orderUpsert'
import {executeTenpoTsuikoUpsert} from './handlers/tenpoTsuikoUpsert'
import {executeFetchSeisanYoteiDiff} from './handlers/fetchSeisanYoteiDiff'
import {executeNotifySeisanYoteiDiff} from './handlers/notifySeisanYoteiDiff'
import {executeAggregateProgress} from './handlers/aggregateProgress'
import {executeOldCarsDeleteAndCreate} from './handlers/oldCarsDeleteAndCreate'
import {executeZaikoDeleteAndCreate} from './handlers/zaikoDeleteAndCreate'
import {executeAisateiDeleteAndCreate} from './handlers/aisateiDeleteAndCreate'
import {executeUpassDeleteAndCreate} from './handlers/upassDeleteAndCreate'
import {executeJuchuShitadoriDbDeleteAndCreate} from './handlers/juchuShitadoriDbDeleteAndCreate'

/**
 * バッチ設定の型定義
 */
export type BatchConfig = {
  id: string // バッチ識別子（vercel.jsonのpathと対応）
  name: string // バッチ名称
  schedule: string // Cronスケジュール（vercel.jsonと同期）
  description?: string // 説明
  handler: () => Promise<any> // 実行関数
}

/**
 * 全バッチ設定のマスター
 * vercel.jsonのcrons設定と同期
 */
export const BATCH_MASTER: Record<string, BatchConfig> = {
  // ============ newCar アプリ ============
  orderUpsert: {
    id: 'orderUpsert',
    name: '注残データ作成',
    schedule: '0 21,3 * * *',
    description: 'sheet API とBigQueryを用いてデータを更新',
    handler: executeOrderUpsert,
  },
  tenpoTsuikoUpsert: {
    id: 'tenpoTsuikoUpsert',
    name: '追工データ更新',
    schedule: '0 22-23,0-10 * * *',
    description: 'BigQueryを用いてデータを更新',
    handler: executeTenpoTsuikoUpsert,
  },
  fetchSeisanYoteiDiff: {
    id: 'fetchSeisanYoteiDiff',
    name: '生産予定フェッチ',
    schedule: '15 1 * * *',
    description: '生産予定履歴テーブルを作成する',
    handler: executeFetchSeisanYoteiDiff,
  },
  notifySeisanYoteiDiff: {
    id: 'notifySeisanYoteiDiff',
    name: '生産予定通知',
    schedule: '0,30 * * * *',
    description: '生産予定変更をメールで通知する',
    handler: executeNotifySeisanYoteiDiff,
  },
  aggregateProgress: {
    id: 'aggregateProgress',
    name: '日次集計',
    schedule: '0 11 28-31 * *',
    description: '月末に進捗データを集計する',
    handler: executeAggregateProgress,
  },

  // ============ ucar アプリ ============
  oldCarsDeleteAndCreate: {
    id: 'oldCarsDeleteAndCreate',
    name: '古物台帳 Rawデータ取り込み',
    schedule: '0 22 * * *',
    description: 'BigQueryから古物台帳データを同期する',
    handler: executeOldCarsDeleteAndCreate,
  },
  zaikoDeleteAndCreate: {
    id: 'zaikoDeleteAndCreate',
    name: '在庫 Rawデータ取り込み',
    schedule: '0 22 * * *',
    description: 'BigQueryから在庫データを同期する',
    handler: executeZaikoDeleteAndCreate,
  },
  aisateiDeleteAndCreate: {
    id: 'aisateiDeleteAndCreate',
    name: 'AI査定 Rawデータ取り込み',
    schedule: '0 22 * * *',
    description: 'BigQueryからAI査定データを同期する',
    handler: executeAisateiDeleteAndCreate,
  },
  upassDeleteAndCreate: {
    id: 'upassDeleteAndCreate',
    name: 'U-PASS Rawデータ取り込み',
    schedule: '0 22 * * *',
    description: 'BigQueryからU-PASSデータを同期する',
    handler: executeUpassDeleteAndCreate,
  },
  juchuShitadoriDbDeleteAndCreate: {
    id: 'juchuShitadoriDbDeleteAndCreate',
    name: '受注下取りDB Rawデータ取り込み',
    schedule: '0 22 * * *',
    description: 'BigQueryから受注下取りデータを同期する',
    handler: executeJuchuShitadoriDbDeleteAndCreate,
  },
}

/**
 * vercel.json生成用のヘルパー関数
 * BATCH_MASTERからvercel.jsonのcrons設定を生成する
 */
export const getVercelCronsConfig = () => {
  return Object.values(BATCH_MASTER).map(batch => ({
    path: `/api/cron/execute/${batch.id}`,
    schedule: batch.schedule,
  }))
}

/**
 * バッチIDからバッチ設定を取得
 */
export const getBatchConfig = (batchId: string): BatchConfig | undefined => {
  return BATCH_MASTER[batchId]
}

/**
 * 全バッチIDのリストを取得
 */
export const getAllBatchIds = (): string[] => {
  return Object.keys(BATCH_MASTER)
}

/**
 * vercel.json生成用のJSON形式でエクスポート
 * スクリプトから直接読み込めるようにする
 */
export const BATCH_MASTER_JSON = Object.values(BATCH_MASTER).map(batch => ({
  path: `/api/cron/execute/${batch.id}`,
  schedule: batch.schedule,
}))
