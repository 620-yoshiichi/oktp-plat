import { OKTP_CONSTANTS } from '@app/oktpCommon/constants'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { knockEmailApi } from '@cm/lib/methods/knockEmailApi'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { Code, codeItemCore } from '@cm/class/Code'
import { Prisma } from '@prisma/generated/prisma/client'
import { requestDeliberySS } from '@app/(apps)/ucar/class/lib/postHandler/ requestDeliberySS'
import { UcarCL } from '@app/(apps)/ucar/class/UcarCL'
import { UCAR_CODE } from '@app/(apps)/ucar/class/UCAR_CODE'
export type shortcutNameStr =
  | 'STORE_QR_ISSUE'
  | 'STORE_NYUKO'
  | 'STORE_TENCHO_KENSHU'
  | 'CR_CHAKU'
  | 'CR_UKEIRE'
  | 'CR_KENSHU'
  | 'CR_KASHU_KAISHI'
  | 'CR_KASHU_SHURYO'
  | 'CR_MARUKURI'
  | 'CR_KENSA'
  | 'CR_SHASHIN'
  | 'CR_GAZOO'
  | 'CR_HAISO'
  | 'SALES_DATE'
  | 'STORE_SHORUI_SOUHU'
  | 'STORE_DELIVERY_STOP'
  | 'CR_GENCHI_SHORI_YOSEI'
export type processNameStr =
  | 'QR発行'
  | '入庫'
  | '店長検収'
  | 'CR着'
  | '受入'
  | '検収'
  | '加修開始'
  | '加修終了'
  | 'まるくり'
  | '検査'
  | '写真'
  | 'GAZOO'
  | '商品車受取'
  | '販売日'
  | '書類送付'
  | '配送停止'
  | '現地処理'

type bigQueryFieldName =
  | 'datetime_0'
  | 'datetime_1'
  | 'datetime_2'
  | 'datetime_3'
  | 'datetime_4'
  | 'datetime_6'
  | 'datetime_7'
  | 'datetime_8'
  | 'datetime_9'
  | 'datetime_11'
  | 'datetime_12'
  | 'datetime_13'
  | 'datetime_14'

export type postHandlerProps = {
  buildConfirmMsg?: () => string
  main: (props: { tx: Prisma.TransactionClient; sateiID: string; session; processCode: string }) => Promise<void>
  buildCompleteMessage?: () => string
}

/** ダッシュボード集計用の車両データ型 */
export type UcarWithProcess = {
  sateiID: string
  processes: { processCode: string; date: Date | null }[]
  /** 仕分け区分コード（UCAR_CODE.SHIWAKE のコード値） */
  destination?: string
  /** 98番号 */
  number98?: string
  /** QRシート発行日時 */
  qrIssuedAt?: Date
  /** Ucarレコード作成日時 */
  createdAt?: Date
  /** レンタル除外フラグ（trueならQRシート総数から除外） */
  isRental?: boolean
  /** OldCars_Base売上日（拠点配送の滞留判定用） */
  DD_URIAGE?: Date
}

// ============================================================
// ダッシュボード集計ヘルパー
// ============================================================

/** 車両の工程日時をprocessCodeで引ける Map に変換 */
export function buildProcessDateMap(car: UcarWithProcess): Map<string, Date> {
  const map = new Map<string, Date>()
  for (const p of car.processes) {
    if (p.date) {
      map.set(p.processCode, p.date)
    }
  }
  // if (car.DD_URIAGE) {
  //   map.set('SALES', car.DD_URIAGE)
  // }
  return map
}

/** メインフローの工程コード順序（MAIN_FLOW_ORDER に対応） */
const MAIN_FLOW_CODES = [
  //
  'CS01',
  'CS02',
  'CS03',
  'CR02',
  'CR03',
  'CR04',
  'CR05',
  'CR06',
  'CR07',
  'CR09', //GAZOOとHAISOは逆転させた
  'CR08',
  'CR10'
]


/**
 * デフォルト滞留判定のファクトリ関数
 * 自工程が完了済 & 後続工程がすべて未完了 → 滞留
 */
const makeDefaultRetention = (selfCode: string): (car: UcarWithProcess) => boolean => {




  /** 指定コードより後の工程コード一覧を返す */
  const makeSubsequentCodes = (selfCode: string): string[] => {
    const idx = MAIN_FLOW_CODES.indexOf(selfCode)
    if (idx === -1) return []
    return MAIN_FLOW_CODES.slice(idx + 1)
  }





  const subsequentCodes = makeSubsequentCodes(selfCode)



  return (car) => {
    const dateMap = buildProcessDateMap(car)



    if (!dateMap.has(selfCode)) return false

    const hit = subsequentCodes.every(code => !dateMap.has(code))


    return hit
  }
}

// ============================================================
// ダッシュボード専用プロパティ型
// ============================================================

/** ダッシュボード集計・表示用プロパティ */
export type DashboardProp = {
  /** ダッシュボード上の表示名（未設定時は label を使用） */
  label?: string
  /** 滞留判定基準の説明文（carに依存しない静的な文字列） */
  retentionDescription?: string
  /** 滞留判定関数 */
  calcRetention?: (car: UcarWithProcess) => boolean
  /** LT計算関数（日数を返す。未定義時はデフォルト計算を使用） */
  calcLT?: (car: UcarWithProcess) => number | null
}

type UcarProcessCodeItem = codeItemCore & {
  bqFieldName?: string
  postHandler?: postHandlerProps
  list: string[]
  /** ダッシュボード集計・表示用プロパティ */
  dashboardProp?: DashboardProp
}
type UcarProcessCodeObjectArgs = { [key: string]: UcarProcessCodeItem }

export class UcarProcessCode extends Code<UcarProcessCodeObjectArgs> {
  constructor(master: UcarProcessCodeObjectArgs) {
    super(master)
  }
}

export class UcarProcessCl {
  /** メインフローの工程順序（ダッシュボード集計用。販売日は含まない） */
  static MAIN_FLOW_ORDER: string[] = [
    'STORE_QR_ISSUE',
    'STORE_NYUKO',
    'STORE_TENCHO_KENSHU',
    'CR_CHAKU',
    'CR_KENSHU',
    'CR_KASHU_KAISHI',
    'CR_MARUKURI',
    'CR_KENSA',
    'CR_SHASHIN',
    'CR_HAISO', //GAZOOとHAISOは逆転させた
    'CR_GAZOO',
    'AI_URIAGE',
  ]

  /**
   * ダッシュボード表示用の工程一覧を取得（dashboardProp が定義済みの工程のみ）
   */
  static getDashboardProcesses() {
    return UcarProcessCl.MAIN_FLOW_ORDER
      .filter(key => UcarProcessCl.CODE.raw[key]?.dashboardProp != null)
      .map(key => {
        const item = UcarProcessCl.CODE.raw[key]
        const dp = item.dashboardProp!


        return {
          key,
          code: item.code,
          label: item.label,
          dashboardLabel: dp.label ?? item.label,
          color: item.color,
          retentionDescription: dp.retentionDescription ?? '',
          calcRetention: dp.calcRetention,
          calcLT: dp.calcLT,
        }
      })
  }

  /**
   * 指定キーより後の工程キー一覧を返す
   */
  static getSubsequentKeys(processKey: string): string[] {
    const idx = UcarProcessCl.MAIN_FLOW_ORDER.indexOf(processKey)
    if (idx === -1) return []
    return UcarProcessCl.MAIN_FLOW_ORDER.slice(idx + 1)
  }

  // 工程カラーパレット
  // 営業フェーズ（CS）: グレー → グリーン系（進捗に応じて濃く）
  // 加修フェーズ（CR）: シアン → ブルー → インディゴ系（段階的に進行）
  // 完了フェーズ: オレンジ系
  // サブ工程（PS/OP）: ニュートラル系
  static CODE = new UcarProcessCode({
    STORE_QR_ISSUE: {
      code: 'CS01',
      bqFieldName: 'datetime_0',
      label: 'QR発行',
      color: '#9E9E9E', // グレー（開始前）
      type: '営業',
      list: [`main`],
      dashboardProp: {
        retentionDescription: '【QR発行】を実施後、【入庫】が登録されていないものです。',
        calcRetention: makeDefaultRetention('CS01'),
      },
    },
    STORE_NYUKO: {
      code: 'CS02',
      bqFieldName: 'datetime_1',
      label: '入庫',
      color: '#66BB6A', // ライトグリーン
      type: '営業',
      list: [`main`],
      dashboardProp: {
        retentionDescription: '【入庫】を実施後、【店長検収】が登録されていないものです。',
        calcRetention: makeDefaultRetention('CS02'),
      },
      postHandler: {
        buildConfirmMsg: () => 'スタッフ入庫検収を行い、店長へメールを送付します。',
        buildCompleteMessage: () => 'スタッフ入庫検収を行い、店長へメールを送付しました。',
        main: async props => {
          const { tx, sateiID, session, processCode } = props

          const { result: storeLeaders } = await doStandardPrisma(`user`, `findMany`, {
            where: {
              storeId: session?.storeId,
              ...OKTP_CONSTANTS.where.storeManagerWhere,
            },
          })

          const processCodeItem = UcarProcessCl.CODE.byCode(props.processCode)
          const to = [...storeLeaders.map(l => l.email)] //拠点長
          const subject =
            `QRチェック通知` +
            [
              //
              formatDate(new Date()),
              processCodeItem?.label,
              sateiID,
              session.name,
            ]
              .map(v => `[${v}]`)
              .join(' ')

          const emailObject = { to, subject, text: subject }
          await knockEmailApi({ ...emailObject })
        },
      },
    },
    STORE_TENCHO_KENSHU: {
      code: 'CS03',
      bqFieldName: 'datetime_2',
      label: '店長検収',
      color: '#43A047', // グリーン
      type: '店長',
      list: [`main`],
      dashboardProp: {
        retentionDescription: '【店長検収】を実施後、【CR着】が登録されていないものです。',
        calcRetention: makeDefaultRetention('CS03'),
      },
      postHandler: {
        buildConfirmMsg: () => 'CRへ配送手配が実施されます。',
        main: async props => {
          const res = await requestDeliberySS({ type: `配送手配`, sateiID: props.sateiID })
        },
        buildCompleteMessage: () => 'CRへ配送手配が実施されました。',
      },
    },
    CR_HAISO_JURYO: {
      code: 'CR01',
      bqFieldName: '',
      label: '配送票受領',
      color: '#26C6DA', // シアン（加修開始）
      type: '加修',
      list: [`main`, 'CR'],
    },

    CR_CHAKU: {
      code: 'CR02',
      bqFieldName: 'datetime_4',
      label: 'CR着',
      color: '#00ACC1', // ダークシアン
      type: '加修',
      list: [`main`, 'CR'],
      dashboardProp: {
        retentionDescription: '【CR着】を実施後、【検収】が登録されていないものです。',
        calcRetention: makeDefaultRetention('CR02'),
      },
    },

    CR_KENSHU: {
      code: 'CR03',
      bqFieldName: 'datetime_6',
      label: '検収',
      color: '#0097A7', // ティール
      type: '加修',
      list: [`main`, 'CR'],
      dashboardProp: {
        retentionDescription: '【検収】を実施後、【加修開始】が登録されていないものです。',
        calcRetention: makeDefaultRetention('CR03'),
      },
    },
    CR_KASHU_KAISHI: {
      code: 'CR04',
      bqFieldName: 'datetime_7',
      label: '加修開始',
      color: '#42A5F5', // ライトブルー
      type: '加修',
      list: [`main`, 'CR'],
      dashboardProp: {
        retentionDescription: '【加修開始】を実施後、【まるくり】が登録されていないものです。',
        calcRetention: makeDefaultRetention('CR04'),
      },
    },
    CR_MARUKURI: {
      code: 'CR05',
      bqFieldName: 'datetime_9',
      label: 'まるくり',
      color: '#1E88E5', // ブルー
      type: '加修',
      list: [`main`, 'CR'],
      dashboardProp: {
        retentionDescription: '【まるくり】を実施後、【検査】が登録されていないものです。',
        calcRetention: makeDefaultRetention('CR05'),
      },
    },
    CR_KENSA: {
      code: 'CR06',
      bqFieldName: 'datetime_11',
      label: '検査',
      color: '#1976D2', // ダークブルー
      type: '加修',
      list: [`main`, 'CR'],
      dashboardProp: {
        retentionDescription: '【検査】を実施後、【写真】が登録されていないものです。',
        calcRetention: makeDefaultRetention('CR06'),
      },
    },
    CR_SHASHIN: {
      code: 'CR07',
      bqFieldName: 'datetime_12',
      label: '写真',
      color: '#5C6BC0', // インディゴ
      type: '加修',
      list: [`main`, 'CR'],
      dashboardProp: {
        retentionDescription: '【写真】を実施後、【GAZOO】が登録されていないものです。',
        calcRetention: makeDefaultRetention('CR07'),
      },
    },

    CR_HAISO: {
      code: 'CR09',
      bqFieldName: 'datetime_14',
      label: '商品車受取',
      color: '#FF7043', // ディープオレンジ（完了）
      type: '店長',
      list: [`main`, 'CR'],
      dashboardProp: {
        retentionDescription: '【商品車受取】を実施後、【GAZOO入力】が登録されていないものです。',
        calcRetention: makeDefaultRetention('CR09'),
      }
    },
    CR_GAZOO: {
      code: 'CR08',
      bqFieldName: 'datetime_13',
      label: 'GAZOO',
      color: '#7E57C2', // ディープパープル
      type: '加修',
      list: [`main`, 'CR'],
      // dashboardProp: {
      //   retentionDescription: '【GAZOO入力】を実施後、【ai21】が登録されていないものです。',
      //   calcRetention: makeDefaultRetention('CR08'),
      // },
    },




    AI_URIAGE: {
      code: 'CR10',
      // bqFieldName: 'datetime_14',
      label: 'ai21売上',
      color: '#FF7043', // ディープオレンジ（完了）
      list: [],
      // dashboardProp: {
      //   // label: '拠点配送',
      //   retentionDescription: '【商品車受取】を実施後、販売日が登録されていないものです。',
      //   calcRetention: (car: UcarWithProcess) => {

      //     const hasCR09 = car.processes.some(p => p.processCode === 'CR09' && p.date)
      //     if (!hasCR09) return false
      //     return !car.DD_URIAGE
      //   },
      // },
    },


    SALES_DATE: {
      code: 'SALES',
      bqFieldName: '',
      label: '販売日',
      color: '#4CAF50', // グリーン（最終完了）
      type: '営業',
      list: [], // 集計対象外、表示専用
      dashboardProp: {
        label: '販売完了',
      },
    },

    STORE_SHORUI_SOUHU: {
      code: 'PS01',
      bqFieldName: '',
      label: '書類送付',
      color: '#8D6E63', // ブラウン（サブ工程）
      type: '店長',
      list: [`sub`],
    },
    STORE_DELIVERY_STOP: {
      code: 'OP01',
      bqFieldName: '',
      label: '配送停止',
      color: '#78909C', // ブルーグレー（特殊操作）
      type: '店長',
      list: [`sub`],
      postHandler: {
        buildConfirmMsg: () => 'CRへ配送キャンセルが実施されます。',
        main: async props => {
          const res = await requestDeliberySS({ type: `配送停止`, sateiID: props.sateiID })
        },
        buildCompleteMessage: () => 'CRへ配送キャンセルが実施されました。',
      },
    },
    CR_GENCHI_SHORI_YOSEI: {
      code: 'OP02',
      bqFieldName: '',
      label: '現地処理',
      color: '#607D8B', // ダークブルーグレー（特殊操作）
      type: '店長',
      list: [`sub`],
      postHandler: {
        buildConfirmMsg: () => '拠点長へ現地処理を申請しますか？',
        main: async props => {
          const { tenchoList } = await UcarCL.fetcher.getTenchoListBySateiId(props.sateiID)
          const ucarInst = new UcarCL(await UcarCL.fetcher.getUcarDataBySateiId(props.sateiID))
          const emailObject = {
            to: tenchoList.map(t => t.email),
            subject: `現地処理申請が実施されました。`,
            text: [
              //
              `以下の車両にて現地処理申請が実施されました。`,
              `店舗で現地処理をしてください。`,
              ucarInst.builder.email.carInfoText,
            ].join('\n'),
          }
          await knockEmailApi({ ...emailObject })

          // スクラップでの仕分登録を自動実施
          await doStandardPrisma('ucar', 'update', {
            where: { sateiID: props.sateiID },
            data: {
              destination: UCAR_CODE.SHIWAKE.raw.SCRAP.code,
            },
          })
        },
        buildCompleteMessage: () => '拠点長へ現地処理の旨をメール通知し、スクラップでの仕分登録を実施しました。',
      },
    },
  })
}
