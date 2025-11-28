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
            additional: {
              orderBy: [{date: `desc`}],
            },
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
          const {available98Numbers, Last98NumberCar, used98Numbers, next98Number, next98NumberModel} =
            await getAvailable98Numbers({take: 30})

          const extras = {available98Numbers, Last98NumberCar, used98Numbers, next98NumberModel}

          return {
            editType: {type: `modal`},
            additional: {
              select: ucarQuery.select as any,
              omit: ucarQuery.omit as any,
              orderBy: [
                {
                  qrIssuedAt: {sort: `desc`, nulls: `last`},
                },
              ],
              where: {...carWhere},
            },

            easySearchExtraProps,
            PageBuilderExtraProps: extras,
            ColBuilderExtraProps: extras,
          }
        },
      },
      {
        modelNames: [`ucarGarageLocationMaster`],
        setParams: async () => {
          return {
            myTable: {create: false, delete: false, update: true},
          }
        },
      },
    ],
  })
  return customParams
}
