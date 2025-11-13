'use server'
import {JSX} from 'react'
import {anyObject} from '@cm/types/utility-types'
import prisma from 'src/lib/prisma'
import {optionType} from '@cm/class/Fields/col-operator-types'
import {countCagetory, dataCountArrForUserType} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/types'

export type aggregationObjectType =
  | {
      key: string
      label: string
      count: number
    }
  | anyObject

export const getvisitTypeGroupedByArr = async (props: any) => {
  const {User_Date_Where_Query, commonBy, additionalWhere} = props

  const data = await prisma.rentaDailyReport.groupBy({
    by: [...commonBy, 'visitType'],
    where: {...User_Date_Where_Query, ...additionalWhere},
    _count: {
      _all: true,
    },
    // orderBy: [{userId: 'asc'}],
  })

  data.forEach(d => {
    if (['新規[継続]', '新規'].some(v => d?.['visitType']?.includes(v))) {
      const row = {...d, visitType: '新規(計)'}

      data.push(row)
    }
  })

  return data
}
export const getapproachTypeGroupedByArr = async ({User_Date_Where_Query, commonBy}) => {
  const data = await prisma.rentaDailyReport.groupBy({
    by: [...commonBy, 'approachType'],
    where: {...User_Date_Where_Query},
    _count: {
      _all: true,
    },
    // orderBy: [{userId: 'asc'}],
  })
  return data
}

export const getoutcomeGroupedByArr = async ({User_Date_Where_Query, commonBy, masterDataArr}) => {
  const data = await prisma.outcome.groupBy({
    by: [...commonBy, 'outcomeMasterId'],
    where: {RentaDailyReport: {...User_Date_Where_Query}},
    _count: {_all: true},
  })

  return data
}

export const getpurposeGroupedByArr = async ({User_Date_Where_Query, commonBy}) => {
  const data = await prisma.purpose.groupBy({
    by: [...commonBy, 'purposeMasterId'],
    where: {RentaDailyReport: {...User_Date_Where_Query}},
    _count: {
      _all: true,
    },
  })

  return data
}

export const createUserGroupedByArr = async (props: {
  user: anyObject
  GroupedByArrSort: anyObject[]
  MASTER: {
    Array: optionType[]
    dataKey: string
  }
  columnOrigin: optionType[] | any[]
  categoryName?: string | JSX.Element
}) => {
  const {GroupedByArrSort, user, MASTER, columnOrigin, categoryName} = props

  const {Array, dataKey} = MASTER ?? {}

  const result = GroupedByArrSort.filter(P_AGG => {
    return P_AGG['userId'] === user['id']
  }).map((P_AGG, i) => {
    const COUNT = P_AGG['_count']['_all']
    const THE_MASTER = MASTER.Array.find(op => op.value === P_AGG[dataKey])
    const {label, color} = THE_MASTER ?? {}
    const key = P_AGG[dataKey]

    // const label = name ?? P_AGG[dataKey] ?? key

    return {
      ...P_AGG,
      date: P_AGG['date'],
      key: P_AGG[dataKey],
      label: label,
      color,
      COUNT,
    }
  })

  return {groupByArr: result, columnOrigin, categoryName} as countCagetory
}

export const getIncreasedNegotiationsCount = async ({User_Date_Where_Query, commonBy}) => {
  const data = await prisma.rentaDailyReport.groupBy({
    by: [...commonBy, 'increasedNegotiationsCount'],
    where: {
      ...User_Date_Where_Query,
      increasedNegotiationsCount: {
        gt: 0,
      },
    },
    _sum: {
      increasedNegotiationsCount: true,
    },
    // orderBy: [{userId: 'asc'}],
  })
  return data
}

export const getCurrentApproachableCustomerCount = async ({User_Date_Where_Query, commonBy}) => {
  const {userId, date} = User_Date_Where_Query

  const data = await prisma.rentaCustomer.groupBy({
    by: ['userId', 'createdAt'],
    where: {userId, result: '継続する'},
    _count: {
      _all: true,
    },
    // orderBy: [{userId: 'asc'}],
  })
  return data
}

export const getOtherAggCount = async ({
  user,
  increasedNegotiationsGroupedByArr,
  currentApproachableCustomerCount,
  promptActivityCount,
}) => {
  const otherAgGroupByArr: dataCountArrForUserType[] = []

  increasedNegotiationsGroupedByArr
    .filter(P_AGG => P_AGG['userId'] === user['id'])
    .forEach(P_AGG => {
      const data: dataCountArrForUserType = {
        key: 'increasedNegotiationsCount',
        label: '増加商談',
        color: 'black',
        date: P_AGG['date'],
        COUNT: P_AGG['_sum']['increasedNegotiationsCount'],
        columnOrigin: [],
      }
      otherAgGroupByArr.push(data)
    })

  currentApproachableCustomerCount
    .filter(P_AGG => P_AGG['userId'] === user['id'])
    .forEach(P_AGG => {
      const data: dataCountArrForUserType = {
        key: 'CurrentApproachableCustomerCount',
        label: '新規訪問継続（累積）',
        color: 'black',
        date: P_AGG['createdAt'],
        COUNT: P_AGG['_count']['_all'],
        columnOrigin: [],
      }
      otherAgGroupByArr.push(data)
    })

  promptActivityCount
    .filter(P_AGG => P_AGG['userId'] === user['id'])
    .forEach(P_AGG => {
      const data: dataCountArrForUserType = {
        key: 'promptActivity',
        label: '促進活動数',
        color: 'black',
        date: P_AGG['date'],
        COUNT: P_AGG['_count']['_all'],
        columnOrigin: [],
      }
      otherAgGroupByArr.push(data)
    })
  const columnOrigin = [
    {id: 'increasedNegotiationsCount', value: '増加商談', color: 'black'},
    {id: 'CurrentApproachableCustomerCount', value: '新規訪問継続（累積）', color: 'black'},
    {id: 'promptActivity', value: '促進活動数', color: 'black'},
  ]
  const otherAggCount = {
    groupByArr: otherAgGroupByArr,
    columnOrigin,
    categoryName: 'その他重要',
  }
  return otherAggCount
}
