// import {fetchAlt} from '@cm/lib/http/fetch-client'
// import {basePath} from '@cm/lib/methods/common'
// import type {BatchConfig} from 'src/non-common/cron/batchMaster'

// // BATCH_MASTERから型定義のみをインポート（Prismaバンドル問題を回避）
// // 実際のBATCH_MASTERは動的にインポートしない（サーバーサイドのみ）
// let BATCH_MASTER: Record<string, BatchConfig> | null = null

// // サーバーサイドでのみBATCH_MASTERを読み込む（クライアントサイドでは使用しない）
// if (typeof window === 'undefined') {
//   // サーバーサイドでのみ動的インポート
//   import('src/non-common/cron/batchMaster').then(module => {
//     BATCH_MASTER = module.BATCH_MASTER
//   })
// }

// const cronPath = `${basePath}/api/cron/execute`

// /**
//  * BatchAction型（UI用）
//  * BatchConfigにonClick関数とlabelプロパティを追加した型
//  */
// export type BatchAction = {
//   id: string
//   label: string // UI表示用のラベル
//   name: string
//   description?: string
//   purpose?: string
//   app: 'common' | 'ucar' | 'newCar' | 'qrbp'
//   effectOn: 'batch' | 'click'
//   schedule?: string
//   tableName?: string
//   prismaArgs?: any
//   onClick: {name: string; main: () => Promise<any>}
// }

// /**
//  * バッチアクション用のonClick関数を作成（batchアクション用）
//  */
// const createBatchOnClick = (batchId: string) => ({
//   name: batchId,
//   main: async () => {
//     const res = await fetchAlt(`${cronPath}/${batchId}`, {}, {method: 'GET'})
//     console.debug(res)
//     return res
//   },
// })

// /**
//  * clickアクション用のonClick関数を作成
//  */
// const createClickOnClick = (path: string) => ({
//   name: path.split('/').pop() || '',
//   main: async () => {
//     const res = await fetchAlt(`${basePath}${path}`, {}, {method: 'GET'})
//     console.debug(res)
//     return res
//   },
// })

// /**
//  * BatchConfigからBatchActionに変換（onClick関数を追加）
//  */
// const convertToBatchAction = (config: BatchConfig): BatchAction => {
//   let onClick: {name: string; main: () => Promise<any>}

//   if (config.effectOn === 'batch' && config.handler) {
//     // batchアクションの場合、APIエンドポイントを呼び出す
//     onClick = createBatchOnClick(config.id)
//   } else if (config.onClick) {
//     // 既存のonClickがある場合はそれを使用
//     onClick = config.onClick
//   } else if (config.description && config.description.startsWith('/api/')) {
//     // descriptionからパスを抽出してonClickを作成
//     onClick = createClickOnClick(config.description)
//   } else {
//     // フォールバック
//     onClick = {
//       name: config.id,
//       main: async () => {
//         console.warn(`onClick not defined for batch: ${config.id}`)
//         return {success: false, message: 'onClick not defined'}
//       },
//     }
//   }

//   return {
//     ...config,
//     label: config.name,
//     onClick,
//   }
// }

// /**
//  * アプリごとのバッチアクションを取得（BATCH_MASTERから）
//  */
// export const getUcarActions = (): BatchAction[] => {
//   // クライアントサイドではBATCH_MASTERを使用できないため、静的に定義
//   // サーバーサイドではBATCH_MASTERから取得可能だが、クライアントサイド互換性のため静的に定義
//   const ucarBatchIds = [
//     'oldCarsDeleteAndCreate',
//     'zaikoDeleteAndCreate',
//     'aisateiDeleteAndCreate',
//     'upassDeleteAndCreate',
//     'juchuShitadoriDbDeleteAndCreate',
//     'num98',
//     'ucarProcessDeleteAndCreate',
//     'qrPaper',
//     'tenchoShoruiSakusei',
//     'shiwake',
//     'tax',
//     'garage',
//     'linkOldCars',
//   ]

//   return ucarBatchIds.map(id => {
//     // BATCH_MASTERから取得するか、フォールバックで静的に定義
//     const configs: Record<string, BatchConfig> = {
//       oldCarsDeleteAndCreate: {
//         id: 'oldCarsDeleteAndCreate',
//         name: '古物 Rawデータ取り込み',
//         schedule: '0 22 * * *',
//         description: '/api/cron/execute/oldCarsDeleteAndCreate',
//         purpose: '',
//         app: 'ucar',
//         effectOn: 'batch',
//         tableName: 'oldCars_Base',
//       },
//       zaikoDeleteAndCreate: {
//         id: 'zaikoDeleteAndCreate',
//         name: '在庫 Rawデータ取り込み',
//         schedule: '0 22 * * *',
//         description: '/api/cron/execute/zaikoDeleteAndCreate',
//         purpose: '',
//         app: 'ucar',
//         effectOn: 'batch',
//         tableName: 'zAIKO_Base',
//       },
//       aisateiDeleteAndCreate: {
//         id: 'aisateiDeleteAndCreate',
//         name: 'AI査定 Rawデータ取り込み',
//         schedule: '0 22 * * *',
//         description: '/api/cron/execute/aisateiDeleteAndCreate',
//         purpose: '',
//         app: 'ucar',
//         effectOn: 'batch',
//         tableName: 'uPASS',
//         prismaArgs: {
//           where: {
//             dataSource: 'aisatei',
//           },
//         },
//       },
//       upassDeleteAndCreate: {
//         id: 'upassDeleteAndCreate',
//         name: 'U-PASS Rawデータ取り込み',
//         schedule: '0 22 * * *',
//         description: '/api/cron/execute/upassDeleteAndCreate',
//         purpose: '',
//         app: 'ucar',
//         effectOn: 'batch',
//         tableName: 'uPASS',
//         prismaArgs: {
//           where: {
//             dataSource: 'upass',
//           },
//         },
//       },
//       juchuShitadoriDbDeleteAndCreate: {
//         id: 'juchuShitadoriDbDeleteAndCreate',
//         name: '受注下取りDB Rawデータ取り込み',
//         schedule: '0 22 * * *',
//         description: '/api/cron/execute/juchuShitadoriDbDeleteAndCreate',
//         purpose: '',
//         app: 'ucar',
//         effectOn: 'batch',
//         tableName: 'juchuShitadoriDb',
//       },
//       num98: {
//         id: 'num98',
//         name: '98データ作成',
//         description: '/api/seeder/num98',
//         purpose: 'ai21の98番号一覧データを作成する',
//         app: 'ucar',
//         effectOn: 'click',
//         tableName: 'number98',
//       },
//       ucarProcessDeleteAndCreate: {
//         id: 'ucarProcessDeleteAndCreate',
//         name: 'UcarProcess 初期シーディング',
//         description: '/api/seeder/ucarProcess/deleteAndCreate',
//         purpose: 'BigQuery Ucar_QR.AI_satei テーブルからデータを取り込む。',
//         app: 'ucar',
//         effectOn: 'click',
//         tableName: 'ucar',
//         prismaArgs: {
//           where: {
//             dataSource: 'BIG_QUERY_QR_PROCESS',
//           },
//         },
//       },
//       qrPaper: {
//         id: 'qrPaper',
//         name: 'UcarPaperデータ作成',
//         description: '/api/seeder/qrPaper',
//         purpose: 'QR PAPER(「新システム反映用」シート)よりデータを作成し、ucarテーブルに反映する。',
//         app: 'ucar',
//         effectOn: 'click',
//         tableName: 'ucar',
//       },
//       tenchoShoruiSakusei: {
//         id: 'tenchoShoruiSakusei',
//         name: '店長書類送信データ作成',
//         description: '/api/seeder/tenchoShoruiSakusei',
//         purpose: '',
//         app: 'ucar',
//         effectOn: 'click',
//         tableName: 'ucar',
//       },
//       shiwake: {
//         id: 'shiwake',
//         name: '仕分け結果',
//         description: '/api/seeder/shiwake',
//         purpose: '',
//         app: 'ucar',
//         effectOn: 'click',
//         tableName: 'ucar',
//       },
//       tax: {
//         id: 'tax',
//         name: '自動車税データ作成',
//         description: '/api/seeder/tax',
//         purpose: '',
//         app: 'ucar',
//         effectOn: 'click',
//         tableName: 'ucar',
//       },
//       garage: {
//         id: 'garage',
//         name: '車庫データ作成',
//         description: '/api/seeder/garage',
//         purpose: 'QR PAPER「車庫空き状況」シートよりデータを作成し、反映する',
//         app: 'ucar',
//         effectOn: 'click',
//         tableName: 'AppliedUcarGarageSlot',
//       },
//       linkOldCars: {
//         id: 'linkOldCars',
//         name: '古物データ自動紐付け',
//         description: '/api/seeder/linkOldCars',
//         purpose: '98番号が入力されているUcarのうち、OldCars_Baseが紐づいていない車両に対して、該当の98番号のうちもっとも新しい仕入日のOldCars_Baseに対してリレーションを貼る',
//         app: 'ucar',
//         effectOn: 'click',
//         tableName: 'ucar',
//       },
//     }

//     const config = configs[id]
//     if (!config) {
//       throw new Error(`Batch config not found: ${id}`)
//     }
//     return convertToBatchAction(config)
//   })
// }

// /**
//  * 共通バッチ処理定義
//  */
// export const getCommonActions = (): BatchAction[] => {
//   const config: BatchConfig = {
//     id: 'kaonaviBatch',
//     name: '顔ナビユーザー連携',
//     description: '顔ナビAPIを用いてユーザー情報を取得し、DBに保存する',
//     purpose: '',
//     app: 'common',
//     effectOn: 'click',
//   }
//   return [convertToBatchAction(config)]
// }

// /**
//  * NewCarアプリのバッチ処理定義
//  */
// export const getNewCarActions = (): BatchAction[] => {
//   const newCarBatchIds = [
//     'orderUpsert',
//     'tenpoTsuikoUpsert',
//     'fetchSeisanYoteiDiff',
//     'notifySeisanYoteiDiff',
//     'aggregateProgress',
//   ]

//   const configs: Record<string, BatchConfig> = {
//     orderUpsert: {
//       id: 'orderUpsert',
//       name: '注残データ作成',
//       schedule: '0 21,3 * * *',
//       description: '/api/cron/execute/orderUpsert',
//       purpose: 'sheet API とBigQueryを用いてデータを更新',
//       app: 'newCar',
//       effectOn: 'batch',
//     },
//     tenpoTsuikoUpsert: {
//       id: 'tenpoTsuikoUpsert',
//       name: '追工データ更新',
//       schedule: '0 22-23,0-10 * * *',
//       description: '/api/cron/execute/tenpoTsuikoUpsert',
//       purpose: 'BigQueryを用いてデータを更新',
//       app: 'newCar',
//       effectOn: 'batch',
//     },
//     fetchSeisanYoteiDiff: {
//       id: 'fetchSeisanYoteiDiff',
//       name: '生産予定フェッチ',
//       schedule: '15 1 * * *',
//       description: '/api/cron/execute/fetchSeisanYoteiDiff',
//       purpose: '',
//       app: 'newCar',
//       effectOn: 'batch',
//     },
//     notifySeisanYoteiDiff: {
//       id: 'notifySeisanYoteiDiff',
//       name: '生産予定通知',
//       schedule: '0,30 * * * *',
//       description: '/api/cron/execute/notifySeisanYoteiDiff',
//       purpose: '',
//       app: 'newCar',
//       effectOn: 'batch',
//     },
//     aggregateProgress: {
//       id: 'aggregateProgress',
//       name: '日次集計',
//       schedule: '0 11 28-31 * *',
//       description: '/api/cron/execute/aggregateProgress',
//       purpose: '',
//       app: 'newCar',
//       effectOn: 'batch',
//     },
//   }

//   return newCarBatchIds.map(id => {
//     const config = configs[id]
//     if (!config) {
//       throw new Error(`Batch config not found: ${id}`)
//     }
//     return convertToBatchAction(config)
//   })
// }

// /**
//  * QRBPアプリのバッチ処理定義
//  */
// export const getQRBPActions = (): BatchAction[] => {
//   const config: BatchConfig = {
//     id: 'activateBpSpread',
//     name: 'BP車両データ取り込み',
//     description: 'スプレッドシートからBP車両データを取得し、carテーブルにupsertする',
//     purpose: 'webapp_dataシートの車両データをDBに同期する（過去365日分）',
//     app: 'qrbp',
//     effectOn: 'click',
//   }
//   return [convertToBatchAction(config)]
// }
