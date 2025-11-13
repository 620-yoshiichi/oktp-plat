// 'use server'
import {getScopes} from 'src/non-common/scope-lib/getScopes'

import {
  EasySearchObject,
  EasySearchObjectExclusiveGroup,
  easySearchType,
  Ex_exclusive0,
  makeEasySearchGroups,
  makeEasySearchGroupsProp,
  toRowGroup,
} from '@cm/class/builders/QueryBuilderVariables'

import {shorten} from '@cm/lib/methods/common'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

export const QrbpEasySearchBuilder = async () => {
  const car = async (props: easySearchType) => {
    // 'use server'
    type exclusiveKeyStrings =
      | 'notAccepted'
      | 'isInCr'
      | 'isMyCrCar'
      | 'isInMyStore'
      | 'isMyOrder'
      | 'onWaitingListCount'
      | 'accepted'
      | 'waitingForPermission'
      | 'waitingForRepairInstruction'
      | 'onProcess'
      | 'waitingForAccept'
      | 'acceptedByCr'
      | 'inProgress'
      | 'isRepairAllowed'
      | 'done'
      | 'acceptedByStore'
      | 'suspended'
      | 'canceled'
      | 'goodByes'

    type exclusiveGroups = EasySearchObjectExclusiveGroup<exclusiveKeyStrings>

    const {result: roles} = await doStandardPrisma(`userRole`, `findMany`, {
      where: {userId: props.session?.id},
      include: {
        RoleMaster: {},
      },
    })

    const {session, query, additionalWhere} = props

    const scopes = getScopes(session, {roles: roles.map(r => r.RoleMaster)})
    const QRBP = scopes.getQrbpProps()

    const forceDoneProcessObject = {
      none: {
        OR: [
          {ProcessNameMaster: {name: 'キャンセル'}},
          {ProcessNameMaster: {name: '洗車'}},
          {ProcessNameMaster: {name: '作業完了'}},
          {ProcessNameMaster: {name: '拠点受取'}},
        ],
      },
    }
    const commonNotCondition = {
      representativeCarBpNumber: null,
    }

    const Ex_exclusive1: exclusiveGroups = {
      notAccepted: {
        label: 'CR受入前',
        notify: false,
        description: 'CR受入前の車両です',
        keyValueList: [{key: 'notAccepted', value: true}],
        exclusiveTo: QRBP?.cr,
        CONDITION: {
          ...commonNotCondition,
          Process: {
            none: {
              OR: [{ProcessNameMaster: {name: 'CR受入'}}, {ProcessNameMaster: {name: 'キャンセル'}}],
            },
          },
        },
      },
    }

    const Ex_exclusive3: exclusiveGroups = {
      isInCr: {
        label: 'CR全',
        description: 'ログインしているCRアドバイザの受け入れ車両です',
        keyValueList: [{key: 'isInCr', value: true}],
        exclusiveTo: QRBP?.cr,
        CONDITION: {...commonNotCondition},
      },
      isMyCrCar: {
        label: 'マイカー[CR]',
        description: 'ログインしているCRアドバイザの受け入れ車両です',
        keyValueList: [{key: 'isMyCrCar', value: true}],
        exclusiveTo: QRBP?.cr,
        CONDITION: {CrUser: {User: {id: session?.id}}, ...commonNotCondition},
      },

      isInMyStore: {
        label: '拠点内全て',
        description: 'ログインしている拠点の担当車両です。',
        keyValueList: [{key: 'isInMyStore', value: true}],
        exclusiveTo: QRBP?.store,
        CONDITION: {storeId: session?.storeId, ...commonNotCondition},
      },
      isMyOrder: {
        label: 'マイカー',
        description: 'ログインしている拠点アドバイザの担当車両です。',
        keyValueList: [{key: 'isMyOrder', value: true}],
        exclusiveTo: QRBP?.store,
        CONDITION: {userId: session?.id, ...commonNotCondition},
      },
    }

    const Ex_exclusive4: exclusiveGroups = {
      onWaitingListCount: {
        label: 'onグラフ',
        description: 'CR状況グラフの明細です',
        keyValueList: [{key: 'onWaitingListCount', value: true}],
        exclusiveTo: QRBP.cr,
        CONDITION: {
          ...commonNotCondition,
          AND: [
            {
              carType: 'BP',
              damageNameMasterId: {not: null},
            },

            {Process: {...forceDoneProcessObject}},
          ],
        },
      },
      accepted: {
        label: '受入済',
        description: 'CR受入後、拠点受取がなされていない車両です。',
        keyValueList: [{key: 'accepted', value: true}],
        exclusiveTo: false,
        CONDITION: {
          ...commonNotCondition,
          CrUser: {not: null},
          AND: [{Process: {some: {AND: [{ProcessNameMaster: {name: 'CR受入'}}]}}}, {Process: {...forceDoneProcessObject}}],
        },
      },

      waitingForPermission: {
        label: '着工許可待ち',
        notify: true,
        description: 'CR受入済み、着工未許可の車両です。',
        keyValueList: [{key: 'waitingForPermission', value: true}],
        CONDITION: {
          ...commonNotCondition,
          CrUser: {},
          AND: [
            {Process: {some: {ProcessNameMaster: {name: 'CR受入'}}}},
            {Process: {none: {ProcessNameMaster: {name: '着工許可'}}}},
            {Process: {...forceDoneProcessObject}},
          ],
        },
      },
      waitingForRepairInstruction: {
        label: '着工指示待ち',
        notify: true,
        description: '拠点での着工許可後、CRで着工指示がなされていない車両です',
        keyValueList: [{key: 'waitingForRepairInstruction', value: true}],
        CONDITION: {
          ...commonNotCondition,
          CrUser: {isNot: null},
          AND: [
            {
              Process: {
                some: {ProcessNameMaster: {name: '着工許可'}},
                none: {ProcessNameMaster: {name: '着工指示'}},
              },
            },
            {Process: {...forceDoneProcessObject}},
          ],
        },
      },

      onProcess: {
        label: '進行中',
        description: 'CR受入後、拠点受取がなされていない車両です。',
        keyValueList: [{key: 'onProcess', value: true}],
        CONDITION: {
          ...commonNotCondition,
          CrUser: {isNot: null},
          AND: [
            //許可あり
            {
              Process: {
                some: {
                  AND: [{ProcessNameMaster: {name: '着工指示'}}],
                },
              },
            },

            {Process: {...forceDoneProcessObject}},
          ],
        },
      },

      // 着工指示がなされ、拠点受取がなされていない
      isRepairAllowed: {
        label: '工程入力可能',
        description: 'CRで着工指示後、拠点未受け取りの車両です。',
        keyValueList: [{key: 'isRepairAllowed', value: true}],
        exclusiveTo: false,
        CONDITION: {
          ...commonNotCondition,
          CrUser: {isNot: null},
          AND: [
            {
              Process: {
                some: {ProcessNameMaster: {name: '着工指示'}},
                none: {ProcessNameMaster: {name: '拠点受取'}},
              },
            },
            {Process: {...forceDoneProcessObject}},
          ],
        },
      },
      waitingForAccept: {
        label: '受取待ち',
        notify: true,
        description: '「洗車 or 作業完了」後、「拠点受取」がまだの車です。',
        keyValueList: [{key: 'waitingForAccept', value: true}],
        CONDITION: {
          ...commonNotCondition,
          CrUser: {isNot: null},
          AND: [
            {
              Process: {
                some: {
                  OR: [{ProcessNameMaster: {name: '洗車'}}, {ProcessNameMaster: {name: '作業完了'}}],
                },
                none: {ProcessNameMaster: {name: '拠点受取'}},
              },
            },
            // {Process: {...forceDoneProcessObject}},
          ],
        },
      },
      acceptedByStore: {
        label: '受取済',
        description: '拠点受取済みの車両です。',
        keyValueList: [{key: 'acceptedByStore', value: true}],
        CONDITION: {
          ...commonNotCondition,
          AND: [{Process: {some: {ProcessNameMaster: {name: '拠点受取'}}}}],
        },
      },

      suspended: {
        label: '中断',
        description: '中断',
        keyValueList: [{key: 'suspended', value: true}],
        exclusiveTo: QRBP?.cr,
        CONDITION: {
          ...commonNotCondition,
          AND: [{Process: {some: {ProcessNameMaster: {name: '中断'}}}}, {Process: {...forceDoneProcessObject}}],
        },
      },

      canceled: {
        label: 'キャンセル',
        description: 'キャンセル',
        keyValueList: [{key: 'canceled', value: true}],
        exclusiveTo: QRBP?.cr,
        CONDITION: {
          ...commonNotCondition,
          AND: [
            {
              Process: {
                some: {ProcessNameMaster: {name: 'キャンセル'}},
                none: {ProcessNameMaster: {name: '拠点受取'}},
              },
            },
          ],
        },
      },
      goodByes: {
        label: 'グッバイ',
        description: 'グッバイ',
        keyValueList: [{key: 'goodByes', value: true}],
        exclusiveTo: QRBP?.cr,
        CONDITION: {
          representativeCarBpNumber: {not: null},
        },
      },
    }

    //データ作成

    type keys = {
      [key in exclusiveKeyStrings]: EasySearchObject
    }

    const dataArr: makeEasySearchGroupsProp[] = []
    toRowGroup(1, dataArr, [
      {exclusiveGroup: Ex_exclusive0, name: `全て`, additionalProps: {refresh: true}},
      {exclusiveGroup: Ex_exclusive1, name: `受入前`, additionalProps: {refresh: true}},
      {exclusiveGroup: Ex_exclusive3, name: `拠点 or 自分`},
      {exclusiveGroup: Ex_exclusive4, name: `工程別`},
    ])

    const result = makeEasySearchGroups(dataArr) as keys

    return result
  }

  const user = async (props: easySearchType) => {
    // 'use server'
    type exclusiveKeyStrings = string

    //データ作成

    type keys = {
      [key in exclusiveKeyStrings]: EasySearchObject
    }

    const {result: stores} = await doStandardPrisma(`store`, `findMany`, {
      orderBy: {code: 'asc'},
    })

    type exclusiveGroups = EasySearchObjectExclusiveGroup<exclusiveKeyStrings>

    const Ex_exclusive1 = stores.reduce((acc: any, store) => {
      const storeName = shorten(store.name, 7, '')
      const obj = {
        label: storeName,
        notify: false,
        CONDITION: {storeId: store.id},
      }
      acc[storeName] = obj
      return acc
    }, {})

    // {
    //   notAccepted: {
    //     label: 'CR受入前',
    //     notify: false,
    //     description: 'CR受入前の車両です',
    //   },
    // }

    const dataArr: makeEasySearchGroupsProp[] = []
    toRowGroup(1, dataArr, [
      //
      {exclusiveGroup: Ex_exclusive0, name: `全て`, additionalProps: {refresh: true}},
      {exclusiveGroup: Ex_exclusive1, name: `拠点`},
    ])
    const result = makeEasySearchGroups(dataArr) as keys

    return result
  }

  return {car, user}
}
