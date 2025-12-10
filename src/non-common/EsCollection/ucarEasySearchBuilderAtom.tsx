import {
  EasySearchObjectAtom,
  easySearchType,
  Ex_exclusive0,
  makeEasySearchGroups,
  makeEasySearchGroupsProp,
  makeExGroup,
  toRowGroup,
} from '@cm/class/builders/QueryBuilderVariables'

import {Prisma} from '@prisma/client'
import {addDays} from 'date-fns'

import {shorten} from '@cm/lib/methods/common'
import {sold, unsold} from '@app/(apps)/ucar/(constants)/ucar-constants'
import {IsActiveDisplay} from '@app/(apps)/ucar/(lib)/isActiveDisplays'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {UCAR_CONSTANTS} from '@app/(apps)/ucar/(constants)/ucar-constants'

export const ucarEasySearchBuilderAtom = (props: easySearchType) => {
  const processMasterRaw = UcarProcessCl.CODE.raw
  type CONDITION_TYPE = Prisma.UcarWhereInput

  const {query, easySearchExtraProps} = props
  const {enginerringProcesses, stores} = easySearchExtraProps ?? {}
  const notFinalizedWhere = {meihenBi: null, masshoBi: null}

  type EsObj = EasySearchObjectAtom<Prisma.UcarWhereInput>

  const paperErrorWhere: CONDITION_TYPE = {
    UcarPaperWorkNotes: {
      some: {
        type: UCAR_CODE.PAPER_WORK_NOTE_TYPES.raw.FUBI.code,
        resolvedAt: null,
      },
    },
  }

  const commonWhere: Prisma.UcarWhereInput = {
    qrIssuedAt: {gte: UCAR_CONSTANTS.easySearchFilterThresholdDate},
    daihatsuReserve: null,
  }

  const stuffQrChecked = {
    processCode: processMasterRaw.STORE_NYUKO.code,
  }
  const tenchoQrChecked = {
    processCode: processMasterRaw.STORE_TENCHO_KENSHU.code,
  }

  // ===========滞留========
  const pending__retendedOnStuff: EsObj = {
    label: 'スタッフ',
    notify: true,
    CONDITION: {
      AND: [
        //
        {UcarProcess: {none: tenchoQrChecked}}, //店長が未チェック、
        {UcarProcess: {none: stuffQrChecked}}, //かつスタッフが未チェック
      ],
    },
  }

  const pending__retendedOnStore: EsObj = {
    label: '店長',
    notify: true,
    CONDITION: {
      AND: [
        //
        {UcarProcess: {some: stuffQrChecked}}, //スタッフがチェック済み
        {UcarProcess: {none: tenchoQrChecked}}, //かつ店長が未チェック
      ],
    },
  }

  // ===========受付・不備========
  const pending__unReceived: EsObj = {
    label: '未受付',
    notify: true,
    description: '書類送付QRチェック後、受付なし',
    CONDITION: {
      UcarProcess: {
        some: {
          processCode: processMasterRaw.STORE_SHORUI_SOUHU.code,
        },
      },
      arrivedAt: null,
    },
  }

  const pending__paperErrorHq: EsObj = {
    label: '不備あり',
    notify: true,
    description: '未解消の不備があるものです。',
    CONDITION: {...paperErrorWhere},
  }

  const deadline__inkan: EsObj = {
    label: '印鑑(1M)',
    notify: true,
    description: '30日以内に印鑑証明書が切れる車両',
    CONDITION: {
      AND: [
        //
        notFinalizedWhere,
        {inkanCertificateExpiredAt: {lte: addDays(new Date(), 30)}},
      ],
    },
  }

  // =========98番号==========
  const number98__exist: EsObj = {
    label: '98完',
    CONDITION: {
      AND: [
        //
        {number98: {not: ''}},
        {OldCars_Base: {DD_SIIRE: {not: null}}},
        commonWhere,
      ],
    },
  }
  const number98__pending: EsObj = {
    label: '98途中',
    CONDITION: {
      AND: [
        //
        {number98: {not: ''}},
        {NOT: {OldCars_Base: {DD_SIIRE: {not: null}}}},
        commonWhere,
      ],
    },
  }
  const number98__notExist: EsObj = {
    label: '98未付与',
    CONDITION: {
      AND: [
        //
        {number98: ''},
        commonWhere,
      ],
    },
  }

  // ===========処理結果========

  const destination__undecided: EsObj = {
    label: '行先未定',
    notify: true,
    CONDITION: {
      AND: [
        //z
        {processedAs: null},
        commonWhere,
      ],
    },
  }

  const destination__meihen_not_done: EsObj = {
    label: '名変[未]',
    notify: true,
    CONDITION: {
      AND: [
        //
        {processedAs: UCAR_CODE.PROCESSED_AS.raw.MEIGIHENKO.code},
        {meihenBi: null},

        commonWhere,
      ],
    },
  }

  const shiwake__undecided: EsObj = {
    label: '仕分け未定',
    notify: true,
    CONDITION: {
      AND: [
        //
        {destination: null},
        commonWhere,
      ],
    },
  }

  const shiwake__decided: EsObj = {
    label: '仕分け決定',
    CONDITION: {
      AND: [
        //
        {destination: {not: null}},
        commonWhere,
      ],
    },
  }

  const destination__meihen_done: EsObj = {
    label: '名変[完]',
    CONDITION: {
      AND: [
        //
        {processedAs: UCAR_CODE.PROCESSED_AS.raw.MEIGIHENKO.code},
        {meihenBi: {not: null}},

        commonWhere,
      ],
    },
  }

  const destination__massho_done: EsObj = {
    label: '抹消[完]',
    CONDITION: {
      AND: [
        //
        {processedAs: UCAR_CODE.PROCESSED_AS.raw.MASSESHO.code},
        {masshoBi: {not: null}},

        commonWhere,
      ],
    },
  }

  const destination__massho_not_done: EsObj = {
    label: '抹消[未]',
    notify: true,
    CONDITION: {
      AND: [
        //
        {processedAs: UCAR_CODE.PROCESSED_AS.raw.MASSESHO.code},
        {masshoBi: null},

        commonWhere,
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
    CONDITION: {daihatsuReserve: {not: null}},
  }

  // =========査定状況========
  const satei__linked = {
    label: '査定連携',
    description: '当日査定での仮付番など、査定データみ連携のもの',
    CONDITION: {
      Model_name: {not: null},
    },
  }
  const satei__nonlinked = {
    label: '査定未連携',
    description: '当日査定での仮付番など、査定データみ連携のもの',
    CONDITION: {
      Model_name: null,
    },
  }

  // ===========税========

  const tax__unScheduled = {
    label: `経理依頼中`,
    notify: true,
    CONDITION: {
      AND: [
        //
        {henkinRequired: {not: false}},
        {paybackScheduledAt: null},
      ],
    },
  }
  const tax__scheduled_pending = {
    label: `経理依頼中`,
    notify: true,
    CONDITION: {
      AND: [
        //
        {henkinRequired: {not: false}},
        {paybackScheduledAt: {not: null}},
        {accountingRecievedAt: null},
      ],
    },
  }
  const tax__scheduled_done = {
    label: `経理入金待`,
    notify: true,
    CONDITION: {
      AND: [
        //
        {henkinRequired: {not: false}},
        {paybackScheduledAt: {not: null}},
        {accountingRecievedAt: {not: null}},
      ],
    },
  }

  // ===========売上店舗別========
  const Ex_SoldStore = {
    ...Object.fromEntries(
      stores.map(store => {
        const key = `stored_${store.code}`
        const value = {
          label: shorten(store.name.replace(`CHU BASE`, `CB`), 4, '.'),
          description: '未販売に限ります',
          CONDITION: {
            CD_ZAIKOTEN: store.code.toString(),
            ...unsold,
          },
        }
        return [key, value]
      })
    ),

    sold: {
      label: '売上済み',
      description: '',
      CONDITION: {...sold},
    },
  }

  // ===========加修工程別========
  const Ex_ResaleProcessGroup = {
    ...Object.fromEntries(
      (enginerringProcesses ?? []).map(process => {
        const key = `${process.name}IsLast`
        const value = {
          label: `${process.name}`,

          CONDITION: {ucarLastProcessMasterId: process.id},
        }

        return [key, value]
      })
    ),
  }

  const atoms = {
    pending__retendedOnStuff,
    pending__retendedOnStore,
    pending__unReceived,
    // pending__NonpaperErrorHq,
    pending__paperErrorHq,

    deadline__inkan,
    destination__undecided,
    destination__meihen_not_done,
    // destination__meihen_done,
    destination__massho_not_done,
    // destination__massho_done,

    number98__exist,
    number98__pending,
    number98__notExist,

    shiwake__undecided,
    shiwake__decided,

    tax__unScheduled,
    tax__scheduled_pending,
    tax__scheduled_done,

    satei__linked,
    satei__nonlinked,

    shinko__reserve,
  }

  const ExGroup = makeExGroup(atoms)

  const dataArr: makeEasySearchGroupsProp[] = []

  const forEigyou = [
    //
    {
      exclusiveGroup: Ex_exclusive0,
      name: `全て`,
      additionalProps: {refresh: true},
    },

    // {exclusiveGroup: ExGroup[`satei`], name: `査定連携`},
    {exclusiveGroup: ExGroup[`pending`], name: `書類受入状況`},
  ]

  const paperGroups = [
    {exclusiveGroup: ExGroup[`deadline`], name: `書類期限間近`},
    {exclusiveGroup: ExGroup[`shiwake`], name: `仕分け結果`},
    {exclusiveGroup: ExGroup[`number98`], name: `98番号`},

    {exclusiveGroup: ExGroup[`destination`], name: `処理結果`},

    {exclusiveGroup: ExGroup[`shinko`], name: `98枠区分`},
  ]

  const taxGroups = [{exclusiveGroup: ExGroup[`tax`], name: `自動車税`}]
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
