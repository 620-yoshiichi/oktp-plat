import {OKTP_CONSTANTS} from '@app/oktpCommon/constants'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {knockEmailApi} from '@cm/lib/methods/knockEmailApi'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Code} from '@cm/class/Code'
import {Prisma} from '@prisma/client'
import {requestDeliberySS} from '@app/(apps)/ucar/class/lib/postHandler/ requestDeliberySS'
import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'
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
  | '拠点受取'
  | '書類送付'
  | '配送停止'
  | '現地処理'
export type postHandlerProps = {
  buildConfirmMsg?: () => string
  main: (props: {tx: Prisma.TransactionClient; sateiID: string; session; processCode: string}) => Promise<void>
  buildCompleteMessage?: () => string
}

export class UcarProcessCl {
  static CODE = new Code({
    STORE_QR_ISSUE: {
      code: 'CS01',
      label: 'QR発行',
      color: '#ececec',
      type: '営業',
      list: [`main`],
    },
    STORE_NYUKO: {
      code: 'CS02',
      label: '入庫',
      color: '#00802f',
      type: '営業',
      list: [`main`],
      postHandler: {
        buildConfirmMsg: () => 'スタッフ入庫検収を行い、店長へメールを送付します。',
        buildCompleteMessage: () => 'スタッフ入庫検収を行い、店長へメールを送付しました。',
        main: async props => {
          const {tx, sateiID, session, processCode} = props

          const {result: storeLeaders} = await doStandardPrisma(`user`, `findMany`, {
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

          const emailObject = {to, subject, text: subject}
          await knockEmailApi({...emailObject})
        },
      },
    },
    STORE_TENCHO_KENSHU: {
      code: 'CS03',
      label: '店長検収',
      color: '#54b222',
      type: '店長',
      list: [`main`],
      postHandler: {
        buildConfirmMsg: () => 'CRへ配送手配が実施されます。',
        main: async props => {
          const res = await requestDeliberySS({type: `配送手配`, sateiID: props.sateiID})
        },
        buildCompleteMessage: () => 'CRへ配送手配が実施されました。',
      },
    },
    CR_HAISO_JURYO: {
      code: 'CR01',
      label: '配送票受領',
      color: '#62f7ff',
      type: '加修',
      list: [`main`],
    },
    CR_CHAKU: {
      code: 'CR02',
      label: 'CR着',
      color: '#62f7ff',
      type: '加修',
      list: [`main`],
    },
    CR_KENSHU: {
      code: 'CR03',
      label: '検収',
      color: '#007a80',
      type: '加修',
      list: [`main`],
    },
    CR_KASHU_KAISHI: {
      code: 'CR04',
      label: '加修開始',
      color: '#805e00',
      type: '加修',
      list: [`main`],
    },
    CR_MARUKURI: {
      code: 'CR05',
      label: 'まるくり',
      color: '#005380',
      type: '加修',
      list: [`main`],
    },
    CR_KENSA: {
      code: 'CR06',
      label: '検査',
      color: '#110080',
      type: '加修',
      list: [`main`],
    },
    CR_SHASHIN: {
      code: 'CR07',
      label: '写真',
      color: '#c7c41e',
      type: '加修',
      list: [`main`],
    },
    CR_GAZOO: {
      code: 'CR08',
      label: 'GAZOO',
      color: '#c5bc09',
      type: '加修',
      list: [`main`],
    },
    CR_HAISO: {
      code: 'CR09',
      label: '拠点受取',
      color: '#c54509',
      type: '店長',
      list: [`main`],
    },

    STORE_SHORUI_SOUHU: {
      code: 'PS01',
      label: '書類送付',
      color: '#54b222',
      type: '店長',
      list: [`sub`],
    },
    STORE_DELIVERY_STOP: {
      code: 'OP01',
      label: '配送停止',
      color: '#686868',
      type: '店長',
      list: [`sub`],
      postHandler: {
        buildConfirmMsg: () => 'CRへ配送キャンセルが実施されます。',
        main: async props => {
          const res = await requestDeliberySS({type: `配送停止`, sateiID: props.sateiID})
        },
        buildCompleteMessage: () => 'CRへ配送キャンセルが実施されました。',
      },
    },
    CR_GENCHI_SHORI_YOSEI: {
      code: 'OP02',
      label: '現地処理',
      color: '#686868',
      type: '店長',
      list: [`sub`],
      postHandler: {
        buildConfirmMsg: () => '拠点長へ現地処理を申請しますか？',
        main: async props => {
          const {tenchoList} = await UcarCL.fetcher.getTenchoListBySateiId(props.sateiID)
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
          await knockEmailApi({...emailObject})
        },
        buildCompleteMessage: () => '拠点長へ現地処理の旨をメール通知しました。',
      },
    },
  })
}
