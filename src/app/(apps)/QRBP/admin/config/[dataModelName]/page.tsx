// 30 37801

//classを切り替える
import {PageBuilder} from '@app/(apps)/QRBP/class/PageBuilder'
import {ColBuilder} from '@app/(apps)/QRBP/class/ColBuilder'
import {QueryBuilder} from '@app/(apps)/QRBP/class/QueryBuilder'
import {ViewParamBuilder} from '@app/(apps)/QRBP/class/ViewParamBuilder'

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

import {getMasterPageCommonConfig} from '@cm/components/DataLogic/helpers/getMasterPageCommonConfig'

const parameters = async ({params, query, session, scopes}) => {
  return await setCustomParams({
    dataModelName: params.dataModelName,
    variants: [
      {
        modelNames: [`roleMaster`],
        setParams: async () => {
          return {
            PageBuilderExtraProps: {where: {apps: {has: `QRBP`}}},
            myTable: {
              delete: scopes.admin ? {} : false,
              create: scopes.admin ? {} : false,
              update: scopes.admin ? {} : false,
            },
          }
        },
      },
      {
        modelNames: ['user'],
        setParams: async () => {
          return {
            myTable: {pagination: {countPerPage: 50}},
            additional: {
              orderBy: [
                //
                {Store: {code: 'asc'}},
                {code: 'asc'},
              ],
              where: {
                OR: [
                  //
                  {apps: {has: 'QRBP'}},
                  // {type: {not: null}},
                  {type2: {not: null}},
                ],
              },
            },
          }
        },
      },

      {
        modelNames: ['damageNameMaster'],
        setParams: async () => ({myTable: scopes.admin ? {} : {create: false, delete: false}}),
      },
    ],
  })
}
