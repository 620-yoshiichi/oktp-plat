//classを切り替える
import { PageBuilder } from '@app/(apps)/ucar/class/PageBuilder'
import { ColBuilder } from '@app/(apps)/ucar/class/ColBuilder/ColBuilder'
import { QueryBuilder, ucarQuery } from '@app/(apps)/ucar/class/QueryBuilder'
import { ViewParamBuilder } from '@app/(apps)/ucar/class/ViewParamBuilder'
import { initServerComopnent } from 'src/non-common/serverSideFunction'

import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { ucarWhere } from '@app/(apps)/ucar/(constants)/ucarWhere'
import { getAvailable98Numbers } from '@app/(apps)/ucar/(lib)/num98/getAvailable98Numbers'
import { getMasterPageCommonConfig } from '@cm/components/DataLogic/helpers/getMasterPageCommonConfig'
import { setCustomParams } from '@cm/components/DataLogic/helpers/SetCustomParams'
import { Prisma } from '@prisma/generated/prisma/client'
import { UCAR_CONSTANTS } from '@app/(apps)/ucar/(constants)/ucar-constants'

export default async function DynamicMasterPage(props) {
  return getMasterPageCommonConfig({
    nextPageProps: props,
    parameters,
    ColBuilder,
    ViewParamBuilder,
    PageBuilder,
    QueryBuilder,
  })
}

const parameters = async ({ params, query, session, scopes }) => {
  // const {} = scopes.getUcarProps()
  const { isHQ, isStoreManager, isSales, carWhere, isChukoshaGroup } = scopes.getUcarProps()
  const customParams = await setCustomParams({
    dataModelName: params.dataModelName,
    variants: [
      {
        modelNames: [`paperProcess`],
        setParams: async () => {
          return {
            dataModelName: `ucar`,
            additional: { orderBy: [{ date: `desc` }] },
          }
        },
      },
      {
        modelNames: ['user'],
        setParams: async () => {
          return {
            additional: {
              payload: { apps: ['ucar'] },
              orderBy: [{ role: 'asc' }],
              where: {
                OR: [{ apps: { has: `ucar` } }],
              },
            },
            myTable: {},
          }
        },
      },
      {
        modelNames: ['ucar'],
        setParams: async () => {
          const { session, scopes } = await initServerComopnent({ query })
          const { isHQ, isStoreManager, isSales, isChukoshaGroup, carWhere } = scopes.getUcarProps()

          const [stores, getAvailable98NumbersReturn] = await Promise.all([
            (await doStandardPrisma(`store`, `findMany`, { orderBy: { name: 'asc' }, where: ucarWhere.ucarStores }))?.result,
            await getAvailable98Numbers({ take: 20 }),
          ])

          const easySearchExtraProps = { stores }

          const additionalWhere = [
            query.__search__sateiID && { sateiID: { contains: query.__search__sateiID } }, //検索時
            query.__search__number98 && { number98: { contains: query.__search__number98 } }, //検索時,
            query.__search__chassisNumber && { UPASS: { chassisNumber: { contains: query.__search__chassisNumber } } }, //検索時,
          ]

          const showDisActived = !!(query.__search__sateiID || query.__search__number98 || query.__search__chassisNumber)




          const whereAND: Prisma.UcarWhereInput[] = [
            //
            carWhere,
            {
              ...UCAR_CONSTANTS.getCommonQuery({
                active: showDisActived ? undefined : true,
              })
            },
            ...additionalWhere

          ].filter(Boolean)


          // 並び順の設定（クエリパラメータで切り替え可能）
          const sortOrder = query.__search__sortOrder ?? 'default'
          let orderBy: Prisma.UcarOrderByWithRelationInput[] = [{ createdAt: 'desc' }]

          if (sortOrder === 'siireDate') {
            orderBy = [
              //
              { DD_SIIRE: { sort: 'desc', nulls: 'last' } },
              { number98: { sort: 'desc', nulls: 'last' } },
              ...orderBy
            ]
          }



          return {
            editType: { type: `modal` },
            additional: {
              select: ucarQuery.select as any,
              omit: ucarQuery.omit as any,
              orderBy: orderBy,
              where: { AND: whereAND },
            },
            easySearchExtraProps,
            PageBuilderExtraProps: { getAvailable98NumbersReturn },
            ColBuilderExtraProps: { getAvailable98NumbersReturn },
          }
        },
      },
      {
        modelNames: [`ucarGarageLocationMaster`],
        setParams: async () => {
          return {
            myTable: {
              create: false,
              delete: false,
              update: true,
            },
          }
        },
      },
      {
        modelNames: [`bankMaster`],
        setParams: async () => {
          return {
            additional: {
              orderBy: [{ code: 'asc' }],
              include: {
                BankBranchMaster: {
                  orderBy: { code: 'asc' },
                },
              },
            },
            myTable: {
              create: false,
              delete: false,
              update: false,
            },
          }
        },
      },
    ],
  })
  return customParams
}
