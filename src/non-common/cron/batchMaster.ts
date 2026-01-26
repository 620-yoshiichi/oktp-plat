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
import {
  executeNum98,
  executeUcarProcessDeleteAndCreate,
  executeQrPaper,
  executeTenchoShoruiSakusei,
  executeShiwake,
  executeTax,
  executeGarage,
  executeLinkOldCars,
  executeKaonaviBatch,
  executeActivateBpSpread,
  executeBankMaster,
} from './handlers/clickActionHandlers'
import {executeDisactivateUnnecessaryUcar} from 'src/non-common/cron/handlers/executeDisactivateUnnecessaryUcar'

/**
 * Prisma件数取得用の引数型定義
 */
export type BatchCountArgs = {
  model: string // Prismaモデル名
  where?: Record<string, any> // where条件（オプション）
}

/**
 * バッチ設定の型定義
 */
export type BatchConfig = {
  id: string // バッチ識別子（vercel.jsonのpathと対応）
  name: string // バッチ名称
  schedule?: string // Cronスケジュール（vercel.jsonと同期、effectOnが'batch'の場合必須）
  description?: string // 説明
  purpose?: string // 用途
  app: 'common' | 'ucar' | 'newCar' | 'qrbp' // アプリ識別
  effectOn: 'batch' | 'click' // 実行種別
  handler?: () => Promise<any> // 実行関数（effectOnが'batch'の場合必須）
  onClick?: {name: string; main: () => Promise<any>} // クリック実行関数（UI用）
  tableName?: string // テーブル名（カウント表示用） - 後方互換性のため残す
  prismaArgs?: BatchCountArgs // 件数取得用のPrisma引数（model必須、whereはオプション）
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
    description: '/api/cron/execute/orderUpsert',
    purpose: 'sheet API とBigQueryを用いてデータを更新',
    app: 'newCar',
    effectOn: 'batch',
    handler: executeOrderUpsert,
  },
  tenpoTsuikoUpsert: {
    id: 'tenpoTsuikoUpsert',
    name: '追工データ更新',
    schedule: '0 22-23,0-10 * * *',
    description: '/api/cron/execute/tenpoTsuikoUpsert',
    purpose: 'BigQueryを用いてデータを更新',
    app: 'newCar',
    effectOn: 'batch',
    handler: executeTenpoTsuikoUpsert,
  },
  fetchSeisanYoteiDiff: {
    id: 'fetchSeisanYoteiDiff',
    name: '生産予定フェッチ',
    schedule: '15 1 * * *',
    description: '/api/cron/execute/fetchSeisanYoteiDiff',
    purpose: '生産予定履歴テーブルを作成する',
    app: 'newCar',
    effectOn: 'batch',
    handler: executeFetchSeisanYoteiDiff,
  },
  notifySeisanYoteiDiff: {
    id: 'notifySeisanYoteiDiff',
    name: '生産予定通知',
    schedule: '0,30 * * * *',
    description: '/api/cron/execute/notifySeisanYoteiDiff',
    purpose: '生産予定変更をメールで通知する',
    app: 'newCar',
    effectOn: 'batch',
    handler: executeNotifySeisanYoteiDiff,
  },
  aggregateProgress: {
    id: 'aggregateProgress',
    name: '日次集計',
    schedule: '0 11 28-31 * *',
    description: '/api/cron/execute/aggregateProgress',
    purpose: '月末に進捗データを集計する',
    app: 'newCar',
    effectOn: 'batch',
    handler: executeAggregateProgress,
  },

  // ============ ucar アプリ ============
  oldCarsDeleteAndCreate: {
    id: 'oldCarsDeleteAndCreate',
    name: '古物 Rawデータ取り込み',
    schedule: '0 23 * * *',
    description: '/api/cron/execute/oldCarsDeleteAndCreate',
    purpose: '',
    app: 'ucar',
    effectOn: 'batch',
    handler: executeOldCarsDeleteAndCreate,
    tableName: 'oldCars_Base',
    prismaArgs: {
      model: 'oldCars_Base',
    },
  },
  zaikoDeleteAndCreate: {
    id: 'zaikoDeleteAndCreate',
    name: '在庫 Rawデータ取り込み',
    schedule: '10 23 * * *',
    description: '/api/cron/execute/zaikoDeleteAndCreate',
    purpose: '',
    app: 'ucar',
    effectOn: 'batch',
    handler: executeZaikoDeleteAndCreate,
    tableName: 'zAIKO_Base',
    prismaArgs: {
      model: 'zAIKO_Base',
    },
  },
  aisateiDeleteAndCreate: {
    id: 'aisateiDeleteAndCreate',
    name: 'AI査定 Rawデータ取り込み',
    schedule: '15 23 * * *',
    description: '/api/cron/execute/aisateiDeleteAndCreate',
    purpose: '',
    app: 'ucar',
    effectOn: 'batch',
    handler: executeAisateiDeleteAndCreate,
    tableName: 'uPASS',
    prismaArgs: {
      model: 'uPASS',
      where: {
        dataSource: 'aisatei',
      },
    },
  },
  upassDeleteAndCreate: {
    id: 'upassDeleteAndCreate',
    name: 'U-PASS Rawデータ取り込み',
    schedule: '20 23 * * *',
    description: '/api/cron/execute/upassDeleteAndCreate',
    purpose: '',
    app: 'ucar',
    effectOn: 'batch',
    handler: executeUpassDeleteAndCreate,
    tableName: 'uPASS',
    prismaArgs: {
      model: 'uPASS',
      where: {
        dataSource: 'upass',
      },
    },
  },
  juchuShitadoriDbDeleteAndCreate: {
    id: 'juchuShitadoriDbDeleteAndCreate',
    name: '受注下取りDB Rawデータ取り込み',
    schedule: '25 23 * * *',
    description: '/api/cron/execute/juchuShitadoriDbDeleteAndCreate',
    purpose: '',
    app: 'ucar',
    effectOn: 'batch',
    handler: executeJuchuShitadoriDbDeleteAndCreate,
    tableName: 'juchuShitadoriDb',
    prismaArgs: {
      model: 'juchuShitadoriDb',
    },
  },

  num98: {
    id: 'num98',
    name: '98データ作成',
    description: '/api/seeder/num98',
    purpose: 'ai21の98番号一覧データを作成する',
    app: 'ucar',
    effectOn: 'click',
    handler: executeNum98,
    tableName: 'number98',
    prismaArgs: {
      model: 'number98',
    },
  },
  ucarProcessDeleteAndCreate: {
    id: 'ucarProcessDeleteAndCreate',
    name: 'UcarProcess 初期シーディング',
    description: '/api/seeder/ucarProcess/deleteAndCreate',
    purpose: 'BigQuery Ucar_QR.AI_satei テーブルからデータを取り込む。',
    app: 'ucar',
    effectOn: 'click',
    handler: executeUcarProcessDeleteAndCreate,
    tableName: 'ucar',
    prismaArgs: {
      model: 'ucar',
      where: {
        dataSource: 'BIG_QUERY_QR_PROCESS', // UCAR_CODEは後で解決
      },
    },
  },
  qrPaper: {
    id: 'qrPaper',
    name: 'UcarPaperデータ作成',
    description: '/api/seeder/qrPaper',
    purpose: 'QR PAPER(「新システム反映用」シート)よりデータを作成し、ucarテーブルに反映する。',
    app: 'ucar',
    effectOn: 'click',
    handler: executeQrPaper,
    tableName: 'ucar',
    prismaArgs: {
      model: 'ucar',
    },
  },
  tenchoShoruiSakusei: {
    id: 'tenchoShoruiSakusei',
    name: '店長書類送信データ作成',
    description: '/api/seeder/tenchoShoruiSakusei',
    purpose: '',
    app: 'ucar',
    effectOn: 'click',
    handler: executeTenchoShoruiSakusei,
    tableName: 'ucar',
    prismaArgs: {
      model: 'ucar',
    },
  },
  shiwake: {
    id: 'shiwake',
    name: '仕分け結果',
    description: '/api/seeder/shiwake',
    purpose: '',
    app: 'ucar',
    effectOn: 'click',
    handler: executeShiwake,
    tableName: 'ucar',
    prismaArgs: {
      model: 'ucar',
    },
  },
  tax: {
    id: 'tax',
    name: '自動車税データ作成',
    description: '/api/seeder/tax',
    purpose: '',
    app: 'ucar',
    effectOn: 'click',
    handler: executeTax,
    tableName: 'ucar',
    prismaArgs: {
      model: 'ucar',
    },
  },
  garage: {
    id: 'garage',
    name: '車庫データ作成',
    description: '/api/seeder/garage',
    purpose: 'QR PAPER「車庫空き状況」シートよりデータを作成し、反映する',
    app: 'ucar',
    effectOn: 'click',
    handler: executeGarage,
    tableName: 'AppliedUcarGarageSlot',
    prismaArgs: {
      model: 'AppliedUcarGarageSlot',
    },
  },
  linkOldCars: {
    id: 'linkOldCars',
    name: '古物データ自動紐付け',
    description: '/api/seeder/linkOldCars',
    purpose:
      '98番号が入力されているUcarのうち、OldCars_Baseが紐づいていない車両に対して、該当の98番号のうちもっとも新しい仕入日のOldCars_Baseに対してリレーションを貼る',
    app: 'ucar',
    effectOn: 'click',
    handler: executeLinkOldCars,
    tableName: 'ucar',
    prismaArgs: {
      model: 'ucar',
    },
  },
  disactivateUnnecessaryUcar: {
    id: 'disactivateUnnecessaryUcar',
    name: '不要なUcarの無効化',
    description: '/api/cron/execute/disactivateUnnecessaryUcar',
    purpose: '不要なUcarを無効化する',
    app: 'ucar',
    effectOn: 'click',
    handler: executeDisactivateUnnecessaryUcar,
    tableName: 'ucar',
    prismaArgs: {
      model: 'ucar',
    },
  },

  // ============ common アプリ ============
  kaonaviBatch: {
    id: 'kaonaviBatch',
    name: '顔ナビユーザー連携',
    description: '顔ナビAPIを用いてユーザー情報を取得し、DBに保存する',
    purpose: '',
    app: 'common',
    effectOn: 'click',
    handler: executeKaonaviBatch,
  },
  bankMaster: {
    id: 'bankMaster',
    name: '銀行マスタ更新',
    description: '/api/seeder/bank',
    purpose: '外部API（bank.teraren.com）から銀行・支店データを取得し、マスタを更新する',
    app: 'common',
    effectOn: 'click',
    handler: executeBankMaster,
    tableName: 'BankMaster',
    prismaArgs: {
      model: 'BankMaster',
    },
  },

  // ============ qrbp アプリ ============
  activateBpSpread: {
    id: 'activateBpSpread',
    name: 'BP車両データ取り込み',
    description: 'スプレッドシートからBP車両データを取得し、carテーブルにupsertする',
    purpose: 'webapp_dataシートの車両データをDBに同期する（過去365日分）',
    app: 'qrbp',
    effectOn: 'click',
    handler: executeActivateBpSpread,
  },
}

/**
 * vercel.json生成用のヘルパー関数
 * BATCH_MASTERからvercel.jsonのcrons設定を生成する
 */
export const getVercelCronsConfig = () => {
  return Object.values(BATCH_MASTER)
    .filter(batch => batch.effectOn === 'batch' && batch.handler)
    .map(batch => ({
      path: `/api/cron/execute/${batch.id}`,
      schedule: batch.schedule,
    }))
}

/**
 * vercel.json生成用のJSON形式でエクスポート
 * スクリプトから直接読み込めるようにする
 */
export const BATCH_MASTER_JSON = Object.values(BATCH_MASTER)
  .filter(batch => batch.effectOn === 'batch' && batch.handler)
  .map(batch => ({
    path: `/api/cron/execute/${batch.id}`,
    schedule: batch.schedule,
  }))
