import {getQueryIds} from '@cm/lib/methods/urls'

import {includeProps, roopMakeRelationalInclude} from '@cm/class/builders/QueryBuilderVariables'

import {Prisma} from '@prisma/generated/prisma/client'

export class QueryBuilder {
  static getInclude = (includeProps: includeProps) => {
    const {session, query} = includeProps

    const user: Prisma.UserFindManyArgs = {
      include: {
        RentaStore: {},
      },
    }
    const rentaCustomer: Prisma.RentaCustomerFindManyArgs = {
      include: {
        RentaDailyReport: {
          take: 3,
          orderBy: [{date: 'desc'}],
        },
        User: {},
        ExtraInfo: {},
        AlternateInfo: {},
        InsuranceInfo: {},
        RentaReference: {},
      },
    }
    const rentaDailyReport = {
      orderBy: [{date: 'asc'}],
      include: {
        Purpose: {include: {PurposeMaster: {}}},
        Outcome: {include: {OutcomeMaster: {}}},
        User: {},
        RentaCustomer: rentaCustomer,
        RentaStore: {},
      },
    }

    const include = {
      user,
      rentaCustomer,
      rentaDailyReport,
    }

    Object.keys(include).forEach(key => {
      roopMakeRelationalInclude({
        parentName: key,
        parentObj: include[key],
      })
    })

    return include
  }
}

export const getUserIdWhere = ({scopes, query}) => {
  const isManager = true
  let userId

  if (isManager) {
    const {
      idsArrToString: {current},
    } = getQueryIds({query, queryKey: 'g_userIdArr'})

    userId = {in: current.map(d => Number(d))}
  } else {
    userId = scopes.session?.id
  }

  return userId
}

export const getLimitToUser = ({session}) => {
  return {
    additional: {
      where: {userId: session?.id},
      payload: {userId: session?.id},
    },
    ColBuilderExtraProps: {
      rentaStoreId: session.rentaStoreId,
      userId: session?.id,
    },
  }
}
