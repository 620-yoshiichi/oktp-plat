import {fetchAlt} from '@cm/lib/http/fetch-client'
import {basePath} from '@cm/lib/methods/common'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'

export type BatchAction = {
  label: string
  description: string
  purpose?: string
  effectOn?: 'batch' | 'click'
  schedule?: string // Cron schedule (required when effectOn is 'batch')
  tableName?: string
  prismaArgs?: any
  onClick: (() => Promise<any>) | {name: string; main: () => Promise<any>}
}

// Ucarアプリのバッチ処理定義
export const getUcarActions = (offset: number, limit: number): BatchAction[] => [
  {
    label: `古物 Rawデータ取り込み`,
    description: ` /api/cron/execute/oldCarsDeleteAndCreate`,
    effectOn: 'batch',
    schedule: '0 22 * * *',
    purpose: ``,
    tableName: 'oldCars_Base',
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/api/cron/execute/oldCarsDeleteAndCreate`, {}, {method: `GET`})
      console.debug(res)
      return res
    },
  },
  {
    label: `在庫 Rawデータ取り込み`,
    description: ` /api/cron/execute/zaikoDeleteAndCreate`,
    effectOn: 'batch',
    schedule: '0 22 * * *',
    purpose: ``,
    tableName: 'zAIKO_Base',
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/api/cron/execute/zaikoDeleteAndCreate`, {}, {method: `GET`})
      console.debug(res)
      return res
    },
  },
  {
    label: `AI査定 Rawデータ取り込み`,
    description: `/api/cron/execute/aisateiDeleteAndCreate`,
    effectOn: 'batch',
    schedule: '0 22 * * *',
    tableName: 'uPASS',
    prismaArgs: {
      where: {
        dataSource: 'aisatei',
      },
    },
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/api/cron/execute/aisateiDeleteAndCreate`, {}, {method: `GET`})
      console.debug(res)
      return res
    },
  },
  {
    label: `U-PASS Rawデータ取り込み`,
    description: ` /api/cron/execute/upassDeleteAndCreate`,
    effectOn: 'batch',
    schedule: '0 22 * * *',
    purpose: ``,
    tableName: 'uPASS',
    prismaArgs: {
      where: {
        dataSource: 'upass',
      },
    },
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/api/cron/execute/upassDeleteAndCreate`, {}, {method: `GET`})
      console.debug(res)
      return res
    },
  },
  {
    label: `受注下取りDB Rawデータ取り込み`,
    description: `/api/cron/execute/juchuShitadoriDbDeleteAndCreate`,
    effectOn: 'batch',
    schedule: '0 22 * * *',
    purpose: ``,
    tableName: 'juchuShitadoriDb',
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/api/cron/execute/juchuShitadoriDbDeleteAndCreate`, {}, {method: `GET`})
      console.debug(res)
      return res
    },
  },
  {
    label: `98データ作成`,
    description: `/api/seeder/num98`,
    effectOn: 'click',
    purpose: `ai21の98番号一覧データを作成する`,
    tableName: 'number98',
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/seeder/num98`, {})
      console.debug(res)
      return res
    },
  },
  {
    label: `UcarProcess 初期シーディング`,
    description: `/api/seeder/ucarProcess/deleteAndCreate`,
    effectOn: 'click',
    purpose: `BigQuery Ucar_QR.AI_satei テーブルからデータを取り込む。`,
    tableName: 'ucar',
    prismaArgs: {
      where: {
        dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.BIG_QUERY_QR_PROCESS.code,
      },
    },
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/seeder/ucarProcess/deleteAndCreate`, {}, {method: `GET`})
      console.debug(res)
      return res
    },
  },
  {
    label: `UcarPaperデータ作成`,
    description: `/api/seeder/qrPaper`,
    effectOn: 'click',
    purpose: `QR PAPER(「新システム反映用」シート)よりデータを作成し、ucarテーブルに反映する。`,
    tableName: 'ucar',
    prismaArgs: {
      where: {
        OR: [
          {dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.QRPAPER_CREATE.code},
          {dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.QRPAPER_DAIHATSU.code},
        ],
      },
    },
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/seeder/qrPaper`, {})
      console.debug(res)
      return res
    },
  },
  {
    label: `店長書類送信データ作成`,
    description: `/api/seeder/tenchoShoruiSakusei`,
    effectOn: 'click',
    purpose: ``,
    tableName: 'ucar',
    prismaArgs: {
      where: {
        dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.TENCHO_SHORUI_KENSHU_HISTORY.code,
      },
    },
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/seeder/tenchoShoruiSakusei`, {})
      console.debug(res)
      return res
    },
  },
  {
    label: `仕分け結果`,
    description: `/api/seeder/shiwake`,
    effectOn: 'click',
    purpose: ``,
    tableName: 'ucar',
    prismaArgs: {
      where: {
        dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.SHIWAKE.code,
      },
    },
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/seeder/shiwake`, {})
      console.debug(res)
      return res
    },
  },
  {
    label: `自動車税データ作成`,
    description: `/api/seeder/tax`,
    effectOn: 'click',
    purpose: ``,
    tableName: 'ucar',
    prismaArgs: {
      where: {
        dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.TAX.code,
      },
    },
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/seeder/tax`, {})
      console.debug(res)
      return res
    },
  },
  {
    label: `車庫データ作成`,
    description: `/api/seeder/garage`,
    effectOn: 'click',
    purpose: `QR PAPER「車庫空き状況」シートよりデータを作成し、反映する`,
    tableName: 'AppliedUcarGarageSlot',
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/seeder/garage`, {})
      console.debug(res)
      return res
    },
  },
  {
    label: `古物データ自動紐付け`,
    description: `/api/seeder/linkOldCars`,
    effectOn: 'click',
    purpose: `98番号が入力されているUcarのうち、OldCars_Baseが紐づいていない車両に対して、該当の98番号のうちもっとも新しい仕入日のOldCars_Baseに対してリレーションを貼る`,
    tableName: 'ucar',
    prismaArgs: {
      where: {
        OldCars_Base: {NO_SYARYOU: {not: null}},
      },
    },
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/seeder/linkOldCars`, {})
      console.debug(res)
      return res
    },
  },
]

// 共通バッチ処理定義
export const getCommonActions = (): BatchAction[] => [
  {
    label: `顔ナビユーザー連携`,
    description: `顔ナビAPIを用いてユーザー情報を取得し、DBに保存する`,
    purpose: ``,
    onClick: {
      name: `kaonaviBatch`,
      main: async () => {
        const res = await fetchAlt(`/oktpCommon/api/seeder/kaonavi`, {})
        return res
      },
    },
  },
]

// NewCarアプリのバッチ処理定義
export const getNewCarActions = (): BatchAction[] => [
  {
    label: `注残データ作成`,
    description: `/api/cron/execute/orderUpsert`,
    effectOn: 'batch',
    schedule: '0 21,3 * * *',
    purpose: `sheet API とBigQueryを用いてデータを更新`,
    onClick: {
      name: `upsertNewCarOrders`,
      main: async () => {
        const res = await fetchAlt(`${basePath}/api/cron/execute/orderUpsert`, {}, {method: 'GET'})
        return res
      },
    },
  },
  {
    label: `追工データ更新`,
    description: `/api/cron/execute/tenpoTsuikoUpsert`,
    effectOn: 'batch',
    schedule: '0 22-23,0-10 * * *',
    purpose: `BigQueryを用いてデータを更新`,
    onClick: {
      name: `tenpoTsuikoUpsert`,
      main: async () => {
        const res = await fetchAlt(`${basePath}/api/cron/execute/tenpoTsuikoUpsert`, {}, {method: 'GET'})
        return res
      },
    },
  },
  {
    label: `生産予定フェッチ`,
    description: `/api/cron/execute/fetchSeisanYoteiDiff`,
    effectOn: 'batch',
    schedule: '15 1 * * *',
    purpose: ``,
    onClick: {
      name: `fetchSeisanYoteiDiff`,
      main: async () => {
        const res = await fetchAlt(`${basePath}/api/cron/execute/fetchSeisanYoteiDiff`, {}, {method: 'GET'})
        return res
      },
    },
  },
  {
    label: `生産予定通知`,
    description: `/api/cron/execute/notifySeisanYoteiDiff`,
    effectOn: 'batch',
    schedule: '0,30 * * * *',
    purpose: ``,
    onClick: {
      name: `notifySeisanYoteiDiff`,
      main: async () => {
        const res = await fetchAlt(`${basePath}/api/cron/execute/notifySeisanYoteiDiff`, {}, {method: 'GET'})
        return res
      },
    },
  },
  {
    label: `日次集計`,
    description: `/api/cron/execute/aggregateProgress`,
    effectOn: 'batch',
    schedule: '0 11 28-31 * *',
    purpose: ``,
    onClick: {
      name: `aggregateProgress`,
      main: async () => {
        const res = await fetchAlt(`${basePath}/api/cron/execute/aggregateProgress`, {}, {method: 'GET'})
        return res
      },
    },
  },
  // {
  //   label: `稼働日カレンダー更新`,
  //   description: ``,
  //   purpose: ``,
  //   onClick: {
  //     name: `updateCalendar`,
  //     main: async () => {
  //       const res = await fetchAlt(`${basePath}/newCar/api/seed/calendar`, {})
  //       return res
  //     },
  //   },
  // },
]

// QRBPアプリのバッチ処理定義
export const getQRBPActions = (): BatchAction[] => [

  {
    label: `BP車両データ取り込み`,
    description: `スプレッドシートからBP車両データを取得し、carテーブルにupsertする`,
    purpose: `webapp_dataシートの車両データをDBに同期する（過去365日分）`,
    effectOn: 'click',
    onClick: {
      name: `activateBpSpread`,
      main: async () => {
        const res = await fetchAlt(`${basePath}/QRBP/seeder/activate-bp-spread`, {}, {method: 'GET'})
        return res
      },
    },
  },
]
