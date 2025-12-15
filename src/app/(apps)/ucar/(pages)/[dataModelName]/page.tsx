//classを切り替える
import {PageBuilder} from '@app/(apps)/ucar/class/PageBuilder'
import {ColBuilder} from '@app/(apps)/ucar/class/ColBuilder/ColBuilder'
import {QueryBuilder, ucarQuery} from '@app/(apps)/ucar/class/QueryBuilder'
import {ViewParamBuilder} from '@app/(apps)/ucar/class/ViewParamBuilder'
import {initServerComopnent} from 'src/non-common/serverSideFunction'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {ucarWhere} from '@app/(apps)/ucar/(constants)/ucarWhere'
import {getAvailable98Numbers} from '@app/(apps)/ucar/(lib)/num98/getAvailable98Numbers'
import {getMasterPageCommonConfig} from '@cm/components/DataLogic/helpers/getMasterPageCommonConfig'
import {setCustomParams} from '@cm/components/DataLogic/helpers/SetCustomParams'
import {UCAR_CONSTANTS} from '@app/(apps)/ucar/(constants)/ucar-constants'

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

const parameters = async ({params, query, session, scopes}) => {
  const customParams = await setCustomParams({
    dataModelName: params.dataModelName,
    variants: [
      {
        modelNames: [`paperProcess`],
        setParams: async () => {
          return {
            dataModelName: `ucar`,
            additional: {orderBy: [{date: `desc`}]},
          }
        },
      },
      {
        modelNames: ['user'],
        setParams: async () => {
          return {
            additional: {
              payload: {app: `ucar`},
              orderBy: [{role: 'asc'}],
              where: {
                OR: [{app: `ucar`}],
              },
            },
            myTable: {},
          }
        },
      },
      {
        modelNames: ['ucar'],
        setParams: async () => {
          const {session, scopes} = await initServerComopnent({query})
          const {isHQ, isStoreManager, isSales, carWhere} = scopes.getUcarProps()

          const {result: stores} = await doStandardPrisma(`store`, `findMany`, {
            orderBy: {name: 'asc'},
            where: ucarWhere.ucarStores,
          })

          const easySearchExtraProps = {stores}
          const getAvailable98NumbersReturn = await getAvailable98Numbers({take: 10})

          return {
            editType: {type: `modal`},
            additional: {
              select: ucarQuery.select as any,
              omit: ucarQuery.omit as any,
              orderBy: [
                //
                {createdAt: 'desc'},
              ],
              where: {
                AND: [
                  //
                  carWhere,
                  {createdAt: {gte: UCAR_CONSTANTS.commonQuery.THRESHOLD_DATE}},
                ],
              },
            },
            easySearchExtraProps,
            PageBuilderExtraProps: {getAvailable98NumbersReturn},
            ColBuilderExtraProps: {getAvailable98NumbersReturn},
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
    ],
  })
  return customParams
}
