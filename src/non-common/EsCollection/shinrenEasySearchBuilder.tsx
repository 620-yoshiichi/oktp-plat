'use server'

import {Shinren} from '@app/(apps)/shinren/class/Shinren'
import {
  EasySearchObject,
  EasySearchObjectExclusiveGroup,
  Ex_exclusive0,
  makeEasySearchGroups,
  makeEasySearchGroupsProp,
  toRowGroup,
} from '@cm/class/builders/QueryBuilderVariables'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'

import {addMonths} from 'date-fns'
import prisma from 'src/lib/prisma'

export const shinrenEasySearchBuilder = async () => {
  const rentaCustomer = async () => {
    'use server'

    type exclusiveKeyStrings =
      | 'newCustomer'
      | 'continueVisiting'
      | 'managementCustomer'
      | 'unVisitedInThreeMonth'
      | 'notInNeoSystem'
      | 'isMergeCandidates'
      | 'emergentManagedCustomer'
      | 'recent'
    type exclusiveGroups = EasySearchObjectExclusiveGroup<exclusiveKeyStrings>

    const Ex_exclusive1: exclusiveGroups = {
      newCustomer: {
        label: '新規',
        notify: false,
        exclusiveTo: true,
        CONDITION: {
          AND: [{type: `新規`}],
        },
      },
      continueVisiting: {
        label: '新規継続',
        notify: false,
        exclusiveTo: true,
        CONDITION: {
          AND: [{result: {contains: '継続する'}}],
        },
      },
      managementCustomer: {
        label: '管理',
        notify: false,
        exclusiveTo: true,
        CONDITION: {
          type: {contains: '管理'},
        },
      },
      unVisitedInThreeMonth: {
        label: '管理未訪問',
        notify: false,
        description: '(3ヶ月以上未訪問)',
        exclusiveTo: true,
        CONDITION: {
          type: {contains: '管理'},
          RentaDailyReport: {
            none: {
              date: {gt: addMonths(new Date(), -3)},
            },
          },
        },
      },
      notInNeoSystem: {
        label: 'NEO未連携',
        notify: false,
        description: 'NEOのデータが存在しないデータ（コードと名前上段が空欄のもの）です。',
        exclusiveTo: true,
        CONDITION: {
          OR: [{name: null}, {code: null}],
        },
      },
      isMergeCandidates: {
        label: 'NEO連携候補',
        notify: true,
        description: '自己保有の管理客の中で、名称が部分一致しているもの',
        exclusiveTo: true,
        CONDITION: {
          OR: [{name: null}, {code: null}],
          mergeCandidatesIds: {isEmpty: false},
        },
      },
      // emergentManagedCustomer: {
      //   label: '緊急措置',
      //   notify: false,
      //   description: '拠点移動時の緊急措置用',
      //   exclusiveTo: true,
      //   CONDITION: {
      //     RentaDailyReport: {
      //       some: {
      //         visitType: {contains: '緊急措置'},
      //       },
      //     },
      //   },
      // },
    }
    const Ex_exclusive2: exclusiveGroups = {
      recent: {
        label: '1ヶ月以内',
        notify: true,
        description: '直近1ヶ月以内に訪問している顧客です。',
        CONDITION: {
          RentaDailyReport: {
            some: {
              date: {gt: addMonths(new Date(), -1)},
            },
          },
        },
      },
    }

    const dataArr: makeEasySearchGroupsProp[] = []
    toRowGroup(1, dataArr, [
      {exclusiveGroup: Ex_exclusive0, name: ``, additionalProps: {refresh: true}},
      {exclusiveGroup: Ex_exclusive1, name: ``},
      {exclusiveGroup: Ex_exclusive2, name: ``},
    ])

    type keys = {
      [K in exclusiveKeyStrings]: EasySearchObject
    }

    const result = makeEasySearchGroups(dataArr) as keys
    return result
  }
  const rentaDailyReport = async () => {
    'use server'

    type exclusiveKeyStrings = '新規[継続]' | '新規' | '管理' | '管理[緊急措置]' | 'その他'

    type exclusiveGroups = EasySearchObjectExclusiveGroup<exclusiveKeyStrings>

    const Ex_exclusive1: exclusiveGroups = Object.fromEntries(
      Shinren.constants.visitTypes.map(v => {
        return [
          v.value,
          {
            label: v.value,
            CONDITION: {
              visitType: v.value,
            },
          },
        ]
      })
    )

    const outcomeMaster = await prisma.outcomeMaster.findMany({
      orderBy: [{sortOrder: 'asc'}],
    })
    const Ex_exclusive2: exclusiveGroups = Object.fromEntries(
      outcomeMaster.map(v => {
        return [
          `成果_${v.sortOrder}`,
          {
            label: (
              <IconBtn className={`!text-black w-[200px]`} color={v.color}>
                {v.name}
              </IconBtn>
            ),

            CONDITION: {
              Outcome: {
                some: {outcomeMasterId: v.id},
              },
            },
          },
        ]
      })
    )

    type keys = {
      [K in exclusiveKeyStrings]: EasySearchObject
    }

    const dataArr: makeEasySearchGroupsProp[] = []
    toRowGroup(1, dataArr, [
      {exclusiveGroup: Ex_exclusive0, name: `初期化`, additionalProps: {refresh: true}},
      {exclusiveGroup: Ex_exclusive1, name: `訪問区分別`},
      {exclusiveGroup: Ex_exclusive2, name: `成果別`, additionalProps: {showAsModal: true}},
    ])

    const result = makeEasySearchGroups(dataArr) as keys

    return result
  }

  return {
    rentaCustomer,
    rentaDailyReport,
  }
}
