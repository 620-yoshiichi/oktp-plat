import {PageBuilder} from '@app/(apps)/newCar/class/PageBuilder'
import {ColBuilder} from '@app/(apps)/newCar/class/Colbuilder/ColBuilder'
import {QueryBuilder} from '@app/(apps)/newCar/class/QueryBuilder'
import {ViewParamBuilder} from '@app/(apps)/newCar/class/ViewParamBuilder'

import {newCarWhereArgs} from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/constants'

import {get_mikomiS_additionalWhere} from '@app/(apps)/newCar/(pages)/[dataModelName]/get_mikomiS_additionalWhere'
import {get_progressReportQ_additionalWhere} from '@app/(apps)/newCar/(pages)/[dataModelName]/get_progressReportQ_additionalWhere'
import {NEW_CAR_CONST} from '@app/(apps)/newCar/(constants)/newCar-constants'
import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {findPredicate, getMonthBoundaries} from '@app/(apps)/newCar/(lib)/statistics/conditionRegistry'

import {addHours} from 'date-fns'
import {setCustomParams} from '@cm/components/DataLogic/helpers/SetCustomParams'
import {getMasterPageCommonConfig} from '@cm/components/DataLogic/helpers/getMasterPageCommonConfig'
import {Days} from '@cm/class/Days/Days'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

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

const parameters = async (props: {params; query; session; scopes: ReturnType<typeof getScopes>}) => {
  const {params, query, scopes} = props
  const {newCarWhere} = scopes.getNewCarProps()

  //---------------個別設定-------------
  const customParams = await setCustomParams({
    dataModelName: params.dataModelName,
    variants: [
      {
        modelNames: [`roleMaster`],
        setParams: async () => {
          return {
            PageBuilderExtraProps: {where: {apps: {has: `newCar`}}},
            myTable: {
              delete: scopes.admin ? {} : false,
              create: scopes.admin ? {} : false,
              update: scopes.admin ? {} : false,
            },
          }
        },
      },
      {
        modelNames: [`store`],
        setParams: async () => {
          return {
            myTable: {drag: {}},
          }
        },
      },
      {
        modelNames: [`user`],
        setParams: async () => {
          return {
            additional: {where: {apps: {has: `newCar`}}},
          }
        },
      },
      {
        modelNames: [`newCar`],

        setParams: async () => {
          let where: newCarWhereArgs = {
            AND: [
              {
                ...NEW_CAR_CONST.NEW_CAR.WHERE.COMMON_WHERE,
              },
              {...newCarWhere},

              //納車済みを表示するかしないか
              {DD_NOSYA: query.showNosya ? undefined : null},
            ],
          }

          if (query.filterKey) {
            const {filterKey} = query
            const predicate = findPredicate(filterKey)
            if (predicate) {
              const {firstDay, nextFirstDay} = getMonthBoundaries(new Date(query.month))

              const baseMonth = addHours(Days.month.getMonthDatum(new Date(query.month)).firstDayOfMonth, 9)

              const pargs = {
                baseMonth: baseMonth,
                // storeId: Number(query.storeId),
                // userId: 'all' as any,
                firstDay: toUtc(firstDay),
                nextFirstDay: toUtc(nextFirstDay),
              } as any

              const storeId = query.storeId ? Number(query.storeId) : undefined

              where = {
                AND: [
                  //
                  where,
                  {storeId},
                  predicate.getWhere(pargs),
                ],
              }
            }
          } else {
            //見込み早見表の店舗別表示
            if (query[`mikomiS`]) {
              const {additionalWhere} = await get_mikomiS_additionalWhere({query})

              where = {AND: [where, additionalWhere]}
            }

            //進捗表の店舗別表示
            if (query[`progressReportQ`]) {
              const {theCondition} = await get_progressReportQ_additionalWhere({query, newCarWhere})

              const additionalWhere = {...theCondition}
              where = {AND: [where, {...additionalWhere}]}
            }
          }

          return {
            easySearchExtraProps: {
              isHQ: scopes.getNewCarProps().isHQ,
              isTestUser: scopes.getNewCarProps().isTestUser,
            },

            myTable: {delete: false, create: false, update: false, pagination: {countPerPage: 10}, style: {maxWidth: 1300}},

            additional: {
              where,
              orderBy: [{User: {code: 'asc'}}],
            },
          }
        },
      },
    ],
  })
  return customParams
}
