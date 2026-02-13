import {
  EasySearchObjectAtom,
  easySearchType,
  makeEasySearchGroups,
  makeEasySearchGroupsProp,
  makeExGroup,
  toRowGroup,
} from '@cm/class/builders/QueryBuilderVariables'

import { Prisma } from '@prisma/generated/prisma/client'
import { addDays } from 'date-fns'

import { shorten } from '@cm/lib/methods/common'
import { sold, unsold } from '@app/(apps)/ucar/(constants)/ucar-constants'
import { IsActiveDisplay } from '@app/(apps)/ucar/(lib)/isActiveDisplays'
import { UcarProcessCl } from '@app/(apps)/ucar/class/UcarProcessCl'
import { UCAR_CODE } from '@app/(apps)/ucar/class/UCAR_CODE'
import { UCAR_CONSTANTS } from '@app/(apps)/ucar/(constants)/ucar-constants'
import { initServerComopnent } from 'src/non-common/serverSideFunction'
import { obj__cleanObject } from '@cm/class/ObjHandler/transformers'

export const ucarEasySearchBuilderAtom = async (props: easySearchType) => {
  const { session, scopes } = await initServerComopnent({ query: props.query })
  const { isHQ, isSales, isInSalesDepartment, } = scopes.getUcarProps()


  const processMasterRaw = UcarProcessCl.CODE.raw


  const { query, easySearchExtraProps } = props
  const { enginerringProcesses, stores } = easySearchExtraProps ?? {}
  const notFinalizedWhere = { meihenBi: null, masshoBi: null }



  type EsObj = EasySearchObjectAtom<Prisma.UcarWhereInput>

  const isNotYoyakuwaku = {
    OR: [{ daihatsuReserve: null }, { daihatsuReserve: '' }],
  }
  const commonWhere: Prisma.UcarWhereInput = {
    AND: [
      //
      isNotYoyakuwaku,
      UCAR_CONSTANTS.getCommonQuery({ active: undefined }),
    ],
  }

  const stuffQrChecked = {
    processCode: processMasterRaw.STORE_NYUKO.code,
  }
  const tenchoQrChecked = {
    processCode: processMasterRaw.STORE_TENCHO_KENSHU.code,
  }
  const CRprocessChecned = {
    processCode: { in: UcarProcessCl.CODE.array.filter(p => p.list.includes('CR')).map(p => p.code) }
  }




  // ===========滞留========
  const pending__retendedOnStuff: EsObj = {
    label: 'スタッフ',
    notify: true,
    description: 'スタッフと店長の両方が未チェックの状態',
    CONDITION: {
      AND: [
        //
        commonWhere,
        { UcarProcess: { none: tenchoQrChecked } }, //店長が未チェック、
        { UcarProcess: { none: stuffQrChecked } }, //かつスタッフが未チェック
        { UcarProcess: { none: CRprocessChecned } }, //かつ店長が未チェック
      ],
    },
  }

  const pending__retendedOnStore: EsObj = {
    label: '店長',
    notify: true,
    description: 'スタッフはチェック済みだが、店長が未チェックの状態',
    CONDITION: {
      AND: [
        //
        commonWhere,
        { UcarProcess: { some: stuffQrChecked } }, //スタッフがチェック済み
        { UcarProcess: { none: tenchoQrChecked } }, //かつ店長が未チェック
        { UcarProcess: { none: CRprocessChecned } }, //かつ店長が未チェック
      ],
    },
  }

  // 書類管理状況
  // ===========受付・不備========
  const paperStatus__unReceived: EsObj = {
    label: '未受付',
    notify: true,
    description: '書類送付QRチェック後、受付なし',
    CONDITION: {
      AND: [
        //
        commonWhere,
        { UcarProcess: { some: { processCode: processMasterRaw.STORE_SHORUI_SOUHU.code } } },
        { arrivedAt: null },
      ],
    },
  }

  const paperStatus__paperErrorHq: EsObj = {
    label: '不備あり',
    notify: true,
    description: '未解消の不備があるものです。',
    CONDITION: {
      AND: [
        //
        commonWhere,
        {
          UcarPaperWorkNotes: {
            some: {
              type: UCAR_CODE.PAPER_WORK_NOTE_TYPES.raw.FUBI.code,
              resolvedAt: null,
            },
          },
        },
      ],
    },
  }

  const paperStatus__inkanDeadline: EsObj = {
    label: '印鑑(1M)',
    notify: true,
    description: '30日以内に印鑑証明書が切れる車両',
    CONDITION: {
      AND: [
        //
        commonWhere,
        { AND: [notFinalizedWhere, { secondMeihenbi: null }] },

        { inkanCertificateExpiredAt: { lte: addDays(new Date(), 30) } },
      ],
    },
  }
  const paperStatus__isKeiYon: EsObj = {
    label: '軽四',
    notify: true,
    description: '軽四の車両',
    CONDITION: {
      AND: [
        //
        commonWhere,
        notFinalizedWhere,
        { inkanAlternate: UCAR_CODE.INKAN_ALTERNATES.raw.KEI.code },
      ],
    },
  }

  // =========98番号==========
  const number98__exist: EsObj = {
    label: '98完',
    description: '98番号が付与され、仕入処理が完了している',
    CONDITION: {
      AND: [
        //

        { number98: { not: '' } },
        { OldCars_Base: { DD_SIIRE: { not: null } } },
      ],
    },
  }
  const number98__pending: EsObj = {
    label: '98途中',
    description: '98番号は付与されているが、仕入処理が未完了',
    notify: true,
    CONDITION: {
      AND: [
        //

        { number98: { not: '' } },
        { NOT: { OldCars_Base: { DD_SIIRE: { not: null } } } },
      ],
    },
  }
  const number98__notExist: EsObj = {
    label: '98未付与',
    description: '98番号がまだ付与されていない',
    CONDITION: {
      AND: [
        //
        { number98: '' },
      ],
    },
  }

  // ===========処理結果========

  const destination__undecided: EsObj = {
    label: '行先未定',
    notify: true,
    description: '処理方法が未決定の状態',
    CONDITION: {
      AND: [
        //
        commonWhere,
        { arrivedAt: { not: null } },
        { processedAs: null },
      ],
    },
  }

  const destination__meihen_not_done: EsObj = {
    label: '名変[未]',
    notify: true,
    description: '名義変更が決定しているが、まだ完了していない',
    CONDITION: {
      AND: [
        //
        commonWhere,
        { arrivedAt: { not: null } },
        { processedAs: UCAR_CODE.PROCESSED_AS.raw.MEIGIHENKO.code },
        { meihenBi: null },
      ],
    },
  }



  const destination__massho_not_done: EsObj = {
    label: '抹消[未]',
    notify: true,
    description: '抹消が決定しているが、まだ完了していない',
    CONDITION: {
      AND: [
        //
        commonWhere,
        { arrivedAt: { not: null } },
        { processedAs: UCAR_CODE.PROCESSED_AS.raw.MASSESHO.code },
        { masshoBi: null },
        {
          OR: [
            { inspectionAlternate: null },
            { inspectionAlternate: { notIn: [UCAR_CODE.INSPECTION_ALTERNATE.raw.MASSHOZUMI.code] } }
          ]

        }

      ],
    },
  }


  const shiwake__undecided: EsObj = {
    label: '仕分け未定',
    notify: true,
    description: '仕分け先が未決定の状態',
    CONDITION: {
      AND: [
        //

        commonWhere,
        { arrivedAt: { not: null } },
        { destination: null },
      ],
    },
  }

  const shiwake__decided: EsObj = {
    label: '仕分け決定',
    description: '仕分け先が決定している',
    CONDITION: {
      AND: [
        //
        commonWhere,
        { arrivedAt: { not: null } },
        { destination: { not: null } },
      ],
    },
  }

  const destinationCompleted__meihen_done: EsObj = {
    label: '名変[完]',
    description: '名義変更が完了している',
    CONDITION: {
      AND: [
        //
        commonWhere,
        { arrivedAt: { not: null } },
        { processedAs: UCAR_CODE.PROCESSED_AS.raw.MEIGIHENKO.code },
        { meihenBi: { not: null } },
      ],
    },
  }

  const destinationCompleted__massho_done: EsObj = {
    label: '抹消[完]',
    description: '抹消が完了している',
    CONDITION: {
      AND: [
        //
        commonWhere,
        { arrivedAt: { not: null } },
        { processedAs: UCAR_CODE.PROCESSED_AS.raw.MASSESHO.code },
        { masshoBi: { not: null } },
      ],
    },
  }

  const destinationCompleted__shakoShomeiDone: EsObj = {
    label: '車庫証明[完]',
    description: '車庫証明が完了している',
    CONDITION: {
      AND: [
        //
        commonWhere,
        { arrivedAt: { not: null } },
        { AppliedUcarGarageSlot: { isNot: null } },
      ],
    },
  }

  // const processedResult__notFinalized = {
  //   label: '名抹未',
  //   notify: true,
  //   description: '書類受付後、名変or抹消が完了していない',
  //   CONDITION: {
  //     ...arrived,
  //     ...notFinalizedWhere,
  //   },
  // }

  // const processedResult__Finalized = {
  //   label: '名抹済',
  //   description: '書類受付後、名変or抹消が完了していない',
  //   CONDITION: {...arrived, ...FinalizedWhere},
  // }

  // =========新古車========

  const shinko__reserve = {
    label: `新古車`,
    description: '予約枠の車両',
    CONDITION: {
      AND: [
        //
        { NOT: isNotYoyakuwaku },
      ],
    },
  }

  // =========査定状況========
  const satei__linked = {
    label: '査定連携',
    description: '当日査定での仮付番など、査定データみ連携のもの',
    CONDITION: {
      AND: [
        //
        commonWhere,
        { Model_name: { not: null } },
      ],
    },
  }
  const satei__nonlinked = {
    label: '査定未連携',
    description: '査定データが連携されていないもの',
    CONDITION: {
      AND: [
        //
        commonWhere,
        { Model_name: null },
      ],
    },
  }

  // ===========税========

  const hasException = {
    AND: [{ exception: { not: null } }, { exception: { not: '' } }],
  }
  const taxTargetCommonCondition: Prisma.UcarWhereInput = {
    AND: [
      //
      { henkinRequired: { not: false } },
      { NOT: hasException },
    ],
  }

  const tax__unScheduled = {
    label: `入金未定`,
    notify: true,
    description: '返金予定日が未設定の状態',
    CONDITION: {
      AND: [
        //
        commonWhere,
        taxTargetCommonCondition,
        { paybackScheduledAt: null },
      ],
    },
  }
  const tax__scheduled_pending = {
    label: `入金待ち`,
    notify: true,
    description: '返金予定日は設定されているが、入金が未確認',
    CONDITION: {
      AND: [
        //
        commonWhere,
        taxTargetCommonCondition,
        { paybackScheduledAt: { not: null } },
        { accountingRecievedAt: null },
      ],
    },
  }

  const tax__scheduled_done = {
    label: `入金済み`,
    description: '返金の入金が確認済み',
    CONDITION: {
      AND: [
        //
        commonWhere,
        taxTargetCommonCondition,
        { accountingRecievedAt: { not: null } },
      ],
    },
  }
  const tax__has_exception = {
    label: `例外`,
    description: '例外処理が設定されているもの',
    CONDITION: {
      AND: [
        //
        commonWhere,
        hasException,
      ],
    },
  }

  // // ===========売上店舗別========
  // const Ex_SoldStore = {
  //   ...Object.fromEntries(
  //     stores.map(store => {
  //       const key = `stored_${store.code}`
  //       const value = {
  //         label: shorten(store.name.replace(`CHU BASE`, `CB`), 4, '.'),
  //         description: '未販売に限ります',
  //         CONDITION: {
  //           CD_ZAIKOTEN: store.code.toString(),
  //           ...unsold,
  //         },
  //       }
  //       return [key, value]
  //     })
  //   ),

  //   sold: {
  //     label: '売上済み',
  //     description: '売上が確定している車両',
  //     CONDITION: { ...sold },
  //   },
  // }


  const atoms = obj__cleanObject({
    pending__retendedOnStuff,
    pending__retendedOnStore,

    paperStatus__unReceived,
    paperStatus__paperErrorHq,
    paperStatus__inkanDeadline: isInSalesDepartment ? null : paperStatus__inkanDeadline,
    paperStatus__isKeiYon: isInSalesDepartment ? null : paperStatus__isKeiYon,

    destination__undecided: isInSalesDepartment ? null : destination__undecided,
    destination__meihen_not_done: isInSalesDepartment ? null : destination__meihen_not_done,

    destination__massho_not_done: isInSalesDepartment ? null : destination__massho_not_done,

    number98__exist: isInSalesDepartment ? null : number98__exist,
    number98__pending: isInSalesDepartment ? null : number98__pending,
    number98__notExist: isInSalesDepartment ? null : number98__notExist,

    shiwake__undecided: isInSalesDepartment ? null : shiwake__undecided,
    shiwake__decided: isInSalesDepartment ? null : shiwake__decided,

    destinationCompleted__meihen_done: isInSalesDepartment ? null : destinationCompleted__meihen_done,
    destinationCompleted__massho_done: isInSalesDepartment ? null : destinationCompleted__massho_done,
    destinationCompleted__shakoShomeiDone: isInSalesDepartment ? null : destinationCompleted__shakoShomeiDone,

    tax__unScheduled: isInSalesDepartment ? null : tax__unScheduled,
    tax__scheduled_pending: isInSalesDepartment ? null : tax__scheduled_pending,
    tax__scheduled_done: isInSalesDepartment ? null : tax__scheduled_done,
    tax__has_exception: isInSalesDepartment ? null : tax__has_exception,

    satei__linked: isInSalesDepartment ? null : satei__linked,
    satei__nonlinked: isInSalesDepartment ? null : satei__nonlinked,

    shinko__reserve: isInSalesDepartment ? null : shinko__reserve,
  })





  const ExGroup = makeExGroup(atoms)

  const dataArr: makeEasySearchGroupsProp[] = []

  const forEigyou = [
    { exclusiveGroup: ExGroup[`pending`], name: `店舗ステータス` },
    { exclusiveGroup: ExGroup[`paperStatus`], name: `書類受付ステータス` },
  ]

  const paperGroups = [
    {
      exclusiveGroup: ExGroup[`shinko`],
      name: `新古車予約枠`,
      additionalProps: { defaultOpen: false },
    },

    {
      exclusiveGroup: ExGroup[`destination`],
      name: `名変抹消未処理`,
    },
    {
      exclusiveGroup: ExGroup[`number98`],
      name: `98番号付与状況`,
      additionalProps: { defaultOpen: true },
    },
    {
      exclusiveGroup: ExGroup[`shiwake`],
      name: `仕分結果`,
      additionalProps: { defaultOpen: false },
    },

    {
      exclusiveGroup: ExGroup[`destinationCompleted`],
      name: `名変抹消完了`,
      additionalProps: { defaultOpen: false },
    },
  ]

  const taxGroups = [
    {
      exclusiveGroup: ExGroup[`tax`],
      name: `自動車税`,
    },
  ]

  toRowGroup(0, dataArr, [
    //
    ...forEigyou,
    ...(IsActiveDisplay(query, `下取書類`) ? paperGroups : []),
    ...(IsActiveDisplay(query, `自動車税`) ? taxGroups : []),
  ])

  const groups = makeEasySearchGroups(dataArr)

  return {
    atoms,
    groups,

    // Ex_SoldStore,
    // Ex_ResaleProcessGroup,
  }
}
