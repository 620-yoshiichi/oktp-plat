import {Code, codeItemCore} from '@cm/class/Code'
import {ucarData} from './UcarCL'

type codeAtom = codeItemCore & {
  [key: string]: {
    code: string
    label: string
    color: string
    checkAlert?: (ucar: ucarData) => boolean
  }
}
export class UcarProcessCode extends Code<codeAtom> {
  constructor(master: codeAtom) {
    super(master)
  }
}

export class UCAR_CODE {
  static DISPLAY_COLUMNS = new Code({
    SHITADORI: {
      code: '01',
      label: '下取書類',
      color: 'yellow',
      userType: [`業務G`],
    },
    SHOHINKA: {
      code: '01',
      label: '商品化',
      color: `red`,
      userType: [`仕入G`],
    },
    JIDOSHA_TEKIYOU: {
      code: '01',
      label: '自動車税',
      color: 'blue',
      userType: [`業務G`],
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
      label: '小売',
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
      color: '#60w3',
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

  static PURCHASE_TYPES = new Code({
    SHITADORI: {
      code: '01',
      label: '下取り',
      color: 'red',
    },
    KAITORI_IPPAN: {
      code: '02',
      label: '買取（一般）',
      color: 'green',
    },
    KAITORI_GYOSHA: {
      code: '03',
      label: '買取（業者）',
      color: 'green',
    },
    LEASE_UP: {
      code: '04',
      label: 'リースアップ',
      color: 'blue',
    },
    SHAYOUSHA: {
      code: '05',
      label: '社用車',
      color: 'gray',
    },
  })
  static PROCESSED_AS = new Code({
    MEIGIHENKO: {
      code: '01',
      label: '名義変更',
      color: 'blue',
    },
    MASSESHO: {
      code: '02',
      label: '抹消',
      color: 'gray',
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
      color: '#46a73b',
      notifyByEmail: false,
    },
    KEI: {
      code: '02',
      label: '軽',
      color: '#c5c5c5',
      notifyByEmail: false,
    },
    INRYAKU: {
      code: '03',
      label: '印略',
      color: '#c5c5c5',
      notifyByEmail: false,
    },
  })

  static INSPECTION_ALTERNATE = new Code({
    MASSHOZUMI: {
      code: '01',
      label: '抹消済',
      color: '#585858',
      notifyByEmail: false,
    },
  })

  static Alert = new Code({
    UP_ASS_NOT_FOUND: {
      code: '01',
      label: 'UPASSデータとの連携ができていません。',
      color: '#ffe5e5',
      checkAlert: (ucar: ucarData) => {
        return !ucar.UPASS
      },
    },
    APPINDEX_NOT_FOUND: {
      code: '02',
      label: '古物台帳との連携ができていません。',
      color: '#fff8dc',
      checkAlert: (ucar: ucarData) => {
        return ucar.number98 && !ucar.OldCars_Base
      },
    },
  })
}
