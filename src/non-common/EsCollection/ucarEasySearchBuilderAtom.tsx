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

export const ucarEasySearchBuilderAtom = (props: easySearchType) => {
  const processMasterRaw = UcarProcessCl.CODE.raw
  type CONDITION_TYPE = Prisma.UcarWhereInput

  const {query, easySearchExtraProps} = props
  const {enginerringProcesses, stores} = easySearchExtraProps ?? {}
  const notFinalizedWhere = {meihenMasshoShoribi: null}

  type EsObj = EasySearchObjectAtom<Prisma.UcarWhereInput>

  const paperErrorWhere: CONDITION_TYPE = {
    UcarPaperWorkNotes: {
      some: {
        type: '不備',
        resolvedAt: null,
      },
    },
  }

  // ===========滞留========
  const pending__retendedOnStuff: EsObj = {
    label: 'スタッフ',
    notify: true,
    CONDITION: {
      AND: [{UcarProcess: {none: {processCode: processMasterRaw.STORE_NYUKO.code}}}],
    },
  }

  const pending__retendedOnStore: EsObj = {
    label: '店長',
    notify: true,
    CONDITION: {
      AND: [
        //
        {UcarProcess: {some: {processCode: processMasterRaw.STORE_NYUKO.code}}},
        {UcarProcess: {none: {processCode: processMasterRaw.STORE_TENCHO_KENSHU.code}}},
      ],
    },
  }

  // ===========配送滞留========
  const pending__undelivered: EsObj = {
    label: '配送滞留',
    notify: true,
    description: '店長検収から10日以上、「CR到着」がない車両',
    CONDITION: {
      AND: [
        {...unsold},
        {destination: {not: null}},
        {destination: {not: ''}},
        {
          UcarProcess: {
            some: {
              date: {lte: addDays(new Date(), -9)},
              processCode: processMasterRaw.STORE_TENCHO_KENSHU.code,
            },
          },
        },

        {
          UcarProcess: {
            none: {
              OR: [
                {processCode: processMasterRaw.CR_CHAKU.code},
                {processCode: processMasterRaw.CR_KENSHU.code},
                {processCode: processMasterRaw.CR_MARUKURI.code},
                {processCode: processMasterRaw.CR_KENSA.code},
                {processCode: processMasterRaw.CR_SHASHIN.code},
                {processCode: processMasterRaw.CR_GAZOO.code},
              ],
            },
          },
        },
      ],
    },
  }

  // ===========受付・不備========
  const pending__unReceived: EsObj = {
    label: '未受付',
    notify: true,
    description: '店長検収後、受付なし',
    CONDITION: {
      NOT: pending__retendedOnStore.CONDITION,
      arrivedAt: null,
    },
  }

  // const pending__NonpaperErrorHq: EsObj = {
  //   label: '書類未完',
  //   notify: true,
  //   CONDITION: {passedAt: null},
  // }
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
      ...notFinalizedWhere,
      inkanCertificateExpiredAt: {lte: addDays(new Date(), 30)},
    },
  }

  // ===========処理結果========

  const processedResult__undecided: EsObj = {
    label: '行先未定',
    notify: true,
    CONDITION: {processedAs: null},
  }
  const processedResult__meihen_not_done: EsObj = {
    label: '名変[未]',
    notify: true,
    CONDITION: {
      processedAs: `名義変更`,
      meihenMasshoShoribi: null,
    },
  }

  const processedResult__meihen_done: EsObj = {
    label: '名変[完]',
    CONDITION: {
      processedAs: `名義変更`,
      meihenMasshoShoribi: {not: null},
    },
  }

  const processedResult__massyo_done: EsObj = {
    label: '抹消[完]',
    CONDITION: {processedAs: `抹消`, meihenMasshoShoribi: {not: null}},
  }

  const processedResult__massyo_not_done: EsObj = {
    label: '抹消[未]',
    notify: true,
    CONDITION: {processedAs: `抹消`, meihenMasshoShoribi: null},
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
  const shinko__nonreserve = {
    label: `一般`,
    CONDITION: {daihatsuReserve: null},
  }
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

  const tax__unTouch = {label: `未処理`, notify: true, CONDITION: {}}
  const tax__onPayment = {label: `経理入金待`, notify: true, CONDITION: {}}

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
    pending__undelivered,
    pending__unReceived,
    // pending__NonpaperErrorHq,
    pending__paperErrorHq,

    deadline__inkan,
    processedResult__undecided,
    processedResult__meihen_not_done,
    // processedResult__meihen_done,
    processedResult__massyo_not_done,
    // processedResult__massyo_done,

    tax__unTouch,
    tax__onPayment,
    satei__linked,
    satei__nonlinked,
    shinko__nonreserve,
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
    {exclusiveGroup: ExGroup[`processedResult`], name: `処理結果`},
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
