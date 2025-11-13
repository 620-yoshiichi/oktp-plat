import {targetStoreWhere} from '@app/(apps)/newCar/(constants)/forSelectConfig'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Prisma} from '@prisma/client'

export type newCarWhereArgs = Prisma.NewCarWhereInput
export type storeMonthsWhereListType = {
  storeLabel: string
  storeWhere: newCarWhereArgs
  monthLabel: string
  theFourSourceLabel: string
  theFiveMikomiLabel: string
  whereQuery: newCarWhereArgs
  jpLabel: string
  dataLabel: string
  count?: number
  children?: storeMonthsWhereListType[]
}
export type FourDataSourceType = {label: string; where: newCarWhereArgs}

export type FourDataSourceListType = {
  jpLabel?: string
  label: string
  show?: boolean
  combined?: string[]
  getWhere?: (props: any) => newCarWhereArgs | undefined
  children?: any[]
  whereQuery?: newCarWhereArgs
}

export const zones = [
  {
    label: '岩木ゾーン長',
    storeLabels: [
      //
      'TOYOTOWN津山',
      '松竹梅53',
      '落合店',
    ],
  },
  {
    label: '上木ゾーン長',
    storeLabels: [
      //`YAHHO倉敷`,
      'S.Stage伊福町',
      'Hi Touch東岡山',
      'WAVE築港',
      'とう西大寺',
      'E.Stage香登',
      'Lx中庄',
      'HAC BASE',
      `上木ゾーン長合計`,
    ],
  },
  {
    label: '田口ゾーン長',
    storeLabels: [
      //
      '本店',
      `YAHHO倉敷`,
      `GRガレージ`,
      'WAO水島',
      `HARBOR児島`,
      'Com Plaza笠岡',
      `田口ゾーン長合計`,
    ],
  },

  {label: `合計`, storeLabels: [`P店（法人除く）合計`, `レクサス倉敷`, `法人営業部`]},
].map(group => {
  return {
    ...group,
    storeLabels: [...group.storeLabels, group.label + '合計'],
  }
})

export const getStoreQueryList = async () => {
  const stores = await (
    await doStandardPrisma(`store`, `findMany`, {
      where: {name: targetStoreWhere.name},
      orderBy: [{code: `asc`}],
    })
  ).result

  const lexusStores = stores.filter(store => store.code === 20)
  const houjinStores = stores.filter(store => store.code === 97)
  const petStores = stores.filter(store => ![20, 97].includes(store.code))

  const storeQueryList = [
    ...petStores.map(store => ({storeLabel: store.name, storeWhere: {storeId: store.id}})),
    {
      storeLabel: `${zones[0].label}合計`,
      storeWhere: {
        storeId: {
          in: zones[0].storeLabels.map(storeLabel => stores.find(store => store.name === storeLabel)?.id).filter(Boolean),
        },
      },
    },
    {
      storeLabel: `${zones[1].label}合計`,
      storeWhere: {
        storeId: {
          in: zones[1].storeLabels.map(storeLabel => stores.find(store => store.name === storeLabel)?.id).filter(Boolean),
        },
      },
    },

    {
      storeLabel: `レクサス倉敷`,
      storeWhere: {storeId: {in: lexusStores.map(store => store.id)}},
    },
    {
      storeLabel: `P店（法人除く）合計`,
      storeWhere: {storeId: {in: petStores.map(store => store.id)}},
    },
    {
      storeLabel: `法人営業部`,
      storeWhere: {storeId: {in: houjinStores.map(store => store.id)}},
    },
  ]

  return storeQueryList
}

export const FourDataSourceList: FourDataSourceListType[] = [
  {
    label: `全登録可能玉`,
    getWhere: ({thisMonth, monthWhere}) => {
      return {
        OR: [
          // {DD_FR: {not: null}}, {CUSTOM_DD_SEISANYOTEI: monthWhere}
        ],
      }
    },
  },
]

export const fiveMikomiFieldList: FourDataSourceListType[] = [
  {
    jpLabel: `総計`,
    label: `total`,
    show: true,
    children: [
      {
        jpLabel: `確定`,
        label: `confirmed`,
        // show: true,
        children: [
          {
            jpLabel: `登録済`,
            label: `completed`,
            getWhere: ({thisMonth, monthWhere}) => ({DD_TOUROKU: monthWhere}),
          },
          {
            jpLabel: `申請中`,
            label: `torokuApplicationCompleted_Sum`,
            children: [
              {
                jpLabel: `申請中\n(振当済)`,
                label: `torokuApplicationCompleted_FR`,
                getWhere: ({thisMonth, monthWhere}) => ({
                  DD_TOUROKU: null,
                  lastApprovedDesiredTorokuDate: monthWhere,
                  DD_FR: {not: null},
                }),
              },
              {
                jpLabel: `申請中\n(未振当)`,
                label: `torokuApplicationCompleted_NO_FR`,
                getWhere: ({thisMonth, monthWhere}) => ({
                  DD_TOUROKU: null,
                  lastApprovedDesiredTorokuDate: monthWhere,
                  DD_FR: null,
                }),
              },
            ],
          },
        ],
      },
      {
        jpLabel: `見込`,
        label: `predicted_Sum`,
        // show: true,
        children: [
          {
            jpLabel: `申請中\n(振当済)`,
            label: `predicted_FR`,
            getWhere: ({thisMonth, monthWhere}) => ({
              DD_TOUROKU: null,
              lastApprovedDesiredTorokuDate: null,
              m1_toroku_prediction: monthWhere,
              DD_FR: {not: null},
            }),
          },
          {
            jpLabel: `申請中\n(未振当)`,
            label: `predicted_NO_FR`,
            getWhere: ({thisMonth, monthWhere}) => ({
              DD_TOUROKU: null,
              lastApprovedDesiredTorokuDate: null,
              m1_toroku_prediction: monthWhere,
              DD_FR: null,
            }),
          },
        ],
      },
    ],
  },
]
