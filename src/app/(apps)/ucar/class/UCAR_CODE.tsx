import {Code} from '@cm/class/Code'
import {ucarData} from './UcarCL'

import {Number98CandidateSelectorSwitch} from '@app/(apps)/ucar/(parts)/templateHooks/useNumber98CandidateSelectorGMF'
import {JSX} from 'react'

type codeAtom = {
  [key: string]: {
    code: string
    label: any
    color?: string
    requireChumonNo?: boolean
    checkAlert?: (ucar: ucarData) => boolean
    Trigger?: (props: {row: ucarData}) => JSX.Element
  }
}

export class UcarAlertCode extends Code<codeAtom> {
  constructor(master: codeAtom) {
    super(master)
  }
}

export class UCAR_CODE {
  static UCAR_DATA_SOURCE = new Code({
    BIG_QUERY_QR_PROCESS: {code: '01', label: 'BigQuery QR処理'},
    QRPAPER_UPDATE: {code: '02', label: 'QRPAPERから更新'},
    QRPAPER_DAIHATSU: {code: '03', label: 'QRPAPER_新古予約枠'},
    QRPAPER_CREATE: {code: '04', label: 'QRPAPER_から新規作成'},
    TENCHO_SHORUI_KENSHU_HISTORY: {
      code: '05',
      label: '店長書類研修履歴かｓら新規作成',
    },
    SHIWAKE: {code: '06', label: '仕分け結果から新規作成'},
    TAX: {code: '07', label: '税金から新規作成'},
    GARAGE: {code: '08', label: '車庫証明申請から新規作成'},
  })

  static DISPLAY_COLUMNS = new Code({
    JIDOSHA_TEKIYOU: {
      code: '01',
      label: '自動車税',
      color: 'blue',
      userType: [`業務G`],
    },
    SHITADORI: {
      code: '02',
      label: '下取書類',
      color: 'yellow',
      userType: [`業務G`],
    },
    SHOHINKA: {
      code: '03',
      label: '商品化',
      color: `red`,
      userType: [`仕入G`],
    },
  })
  static SHIWAKE = new Code({
    OROSI: {
      code: '01',
      label: '卸',
      color: '#005c80',
    },
    KOURI: {
      code: '02',
      label: '小売り',
      color: '#00802f',
    },
    SCRAP: {
      code: '03',
      label: 'スクラップ',
      color: '#dcdcdc',
    },
    CPO: {
      code: '04',
      label: 'CPO',
      color: '#60b330',
    },
    ONLINE: {
      code: '05',
      label: 'オンライン',
      color: '#ff1d1d',
    },
    UNCONFIRMED: {
      code: '06',
      label: '？',
      color: '#dcdcdc',
    },
  })

  static RUNNABLE = new Code({
    YES: {
      code: '01',
      label: '可',
      color: 'green',
    },
    NO: {
      code: '02',
      label: '不可',
      color: 'red',
    },
  })

  static PURCHASE_TYPES = new Code({
    SHITADORI: {
      code: '01',
      label: '下取り',
      color: 'green',
      qrPaperSpreadSheetNotationList: ['下'],
    },
    KAITORI_IPPAN: {
      code: '02',
      label: '買取（一般）',
      color: 'red',
      qrPaperSpreadSheetNotationList: ['買', '買(一般)', '買（一般）', '買（業者）', '買(一般）'],
    },
    KAITORI_GYOSHA: {
      code: '03',
      label: '買取（業者）',
      color: 'red',
      qrPaperSpreadSheetNotationList: ['買(業者)', '買（業者）'],
    },
    LEASE_UP: {
      code: '04',
      label: 'リースアップ',
      color: 'blue',
      qrPaperSpreadSheetNotationList: ['リースアップ'],
    },
    SHAYOUSHA: {
      code: '05',
      label: '社用車',
      color: 'gray',
      qrPaperSpreadSheetNotationList: ['社用車'],
    },
    KANSUSEI_CHE: {
      code: '06',
      label: 'キャンセル車',
      color: 'red',
      qrPaperSpreadSheetNotationList: ['キャンセル車'],
    },
  })

  static PROCESSED_AS = new Code({
    MEIGIHENKO: {
      code: '01',
      label: '名義変更',
      color: 'blue',
      qrPaperSpreadSheetNotationList: ['名義変更'],
    },
    MASSESHO: {
      code: '02',
      label: '抹消',
      color: 'gray',
      qrPaperSpreadSheetNotationList: ['抹消'],
    },
  })
  static PAPER_WORK_NOTE_TYPES = new Code({
    FUBI: {
      code: '01',
      label: '不備',
      color: 'red',
      notifyByEmail: true,
    },
  })
  static INKAN_ALTERNATES = new Code({
    TOYOPET: {
      code: '01',
      label: 'トヨペット',
      color: 'green',
      notifyByEmail: false,

      qrPaperSpreadSheetNotationList: ['p', 'p', 'ｐ', 'P', 'Ｐ'],
    },
    KEI: {
      code: '02',
      label: '軽四',
      color: 'red',
      notifyByEmail: false,
      qrPaperSpreadSheetNotationList: ['k', 'ｋ', 'K', 'Ｋ'],
    },
    INRYAKU: {
      code: '03',
      label: '印略',
      color: 'gray',
      notifyByEmail: false,
      qrPaperSpreadSheetNotationList: ['i印略', '印略', '院略'],
    },
    MASESHO: {
      code: '04',
      label: '抹消済',
      color: 'gray',
      notifyByEmail: false,
      qrPaperSpreadSheetNotationList: ['抹消済'],
    },
    MICHAKU: {
      code: '05',
      label: '未着',
      color: 'gray',
      notifyByEmail: false,
      qrPaperSpreadSheetNotationList: ['未着'],
    },
  })

  static INSPECTION_ALTERNATE = new Code({
    KENSA_GIRE: {
      code: '01',
      label: '検査切れ',
      color: '#ff9800',
      notifyByEmail: false,
      qrPaperSpreadSheetNotationList: ['検査切れ', '車検切れ', '車検日'],
    },
    MASSHOZUMI: {
      code: '02',
      label: '抹消済',
      color: '#585858',
      notifyByEmail: false,
      qrPaperSpreadSheetNotationList: ['抹消済', '抹消済み', '末梢済'],
    },
  })

  static TAX_EXCEPTION = new Code({
    RETURN_NO_MONEY: {
      code: '01',
      label: '返金なし（軽）',
      color: '#F4CCCC',
    },
    RETURN_NO_MONEY_TOYOPET: {
      code: '02',
      label: '返金なし（トヨペットが税金負担）',
      color: '#DAE3F3',
    },
    PREF_ONLY_REFUND: {
      code: '03',
      label: '県税からの返金のみ',
      color: '#D9EAD3',
    },
    BUYBACK_SAME_USER: {
      code: '04',
      label: '買戻し（同一人再使用）',
      color: '#EAD1DC',
    },
    NO_TAXATION: {
      code: '05',
      label: '課税なし',
      color: '#FFF2CC',
    },
  })

  static SHITADORI_KBN = new UcarAlertCode({
    SHITADORI: {
      code: '01',
      label: '下取り',
    },
    SHITADORI_ATSUKAI_KAITORI: {
      code: '02',
      label: '買取（下取扱い）',
      requireChumonNo: true,
    },
    KAITORI: {
      code: '03',
      label: '買取',
    },
    SHAYOSHA: {
      code: '04',
      label: '社用車',
    },
    DAISHA: {
      code: '05',
      label: '代車',
    },
    SHIJOSHA: {
      code: '06',
      label: '試乗車',
    },
  })

  static Alert = new UcarAlertCode({
    UP_ASS_NOT_FOUND: {
      code: '01',
      label: 'UPASSデータとの連携ができていません。査定番号が間違っているか、当日査定である可能性があります。',
      color: '#ffe5e5',
      checkAlert: (ucar: ucarData) => {
        return !ucar.daihatsuReserve && !ucar.UPASS
      },
    },
    APPINDEX_NOT_FOUND: {
      code: '02',
      label: (
        <div>
          古物台帳との連携ができていません。「98番号」「仕入日」「仕入れ時注文No（ない場合は空欄）を正確に入力してください。」
        </div>
      ),
      color: '#fff8dc',
      checkAlert: (ucar: ucarData) => {
        return !!(ucar?.number98 && !ucar.OldCars_Base)
      },
      Trigger: (props: {row: ucarData}) => (
        <Number98CandidateSelectorSwitch
          {...{
            number98: props.row.number98,
            sateiID: props.row.sateiID,
          }}
        />
      ),
    },
  })
}
