//classを切り替える
import { PageBuilder } from '@app/(apps)/shinren/class/PageBuilder'
import { ColBuilder } from '@app/(apps)/shinren/class/ColBuilder'
import { getUserIdWhere, QueryBuilder } from '@app/(apps)/shinren/class/QueryBuilder'
import { ViewParamBuilder } from '@app/(apps)/shinren/class/ViewParamBuilder'
import { getMasterPageCommonConfig } from '@cm/components/DataLogic/helpers/getMasterPageCommonConfig'
import { setCustomParams } from '@cm/components/DataLogic/helpers/SetCustomParams'
import { Prisma } from '@prisma/generated/prisma/client'
import { getMidnight, toJst } from '@cm/class/Days/date-utils/calculations'
import { getWhereQuery } from '@cm/lib/methods/redirect-method'
import { Days } from '@cm/class/Days/Days'
import { GET_ALL_AGG_DATA } from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/aggregation-methods-main'

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
  const userIdWhere = getUserIdWhere({ scopes, query })
  const commonColBuilderExtraProps = {
    rentaStoreId: session.rentaStoreId,
    userId: session?.id,
  }
  const { isManager } = scopes.getShinernScopes()

  //---------------個別設定-------------
  const customParams = await setCustomParams({
    dataModelName: params.dataModelName,
    variants: [
      {
        modelNames: ['user'],
        setParams: async () => ({
          additional: { where: { app: 'shinren' }, payload: { app: 'shinren' } },
          myTable: { drag: {} },
        }),
      },
      {
        modelNames: ['rentaCustomer'],
        setParams: async () => {
          const rentaCustomerOrderBy: Prisma.RentaCustomerOrderByWithRelationInput = {
            // RentaDailyReport: {_count: 'desc'},
          }
          const isAdmin = scopes.admin

          return {
            ColBuilderExtraProps: commonColBuilderExtraProps,
            additional: {
              where: {
                userId: userIdWhere,
              },
              orderBy: [rentaCustomerOrderBy, { createdAt: 'desc' }],
            },
            myTable: {
              style: { maxWidth: 1250 },
              create: false,
              delete: isManager ? true : false,
            },
          }
        },
      },
      {
        modelNames: ['rentaDailyReport'],
        setParams: async () => {
          const today = toJst(getMidnight())
          const { whereQuery, redirectPath } = await getWhereQuery({
            query,
            defaultQuery: { from: today, g_userIdArr: session?.id },
            whereQueryConverter: whereQuery => {
              const { gte, lte } = whereQuery ?? {}

              if (gte) {
                if (Days.validate.isDate(lte) === false) {
                  return { gte: gte, lt: Days.day.add(gte, 1) }
                } else if (Days.validate.isSameDate(gte, lte as Date)) {
                  return { gte: gte }
                } else {
                  return { gte, lte: lte }
                }
              }
            },
          })

          const additionalWhere = {
            OR: [{ date: { ...whereQuery } }, { date: null }],

            userId: userIdWhere,
          }

          const commonBy = ['userId', 'date']


          const userWithCount = await GET_ALL_AGG_DATA({ userIdWhere, whereQuery, commonBy })

          const PageBuilderExtraProps = {
            userWithCount,
          }
          return {
            PageBuilderExtraProps,
            redirectPath,
            ColBuilderExtraProps: commonColBuilderExtraProps,
            additional: { where: { ...additionalWhere }, orderBy: [{ date: 'asc' }, { time: 'asc' }] },
            myTable: {
              // header:false,
              style: { maxHeight: '65vh', maxWidth: `95vw` },
            },
          }
        },
      },
    ],
  })
  return customParams
}
