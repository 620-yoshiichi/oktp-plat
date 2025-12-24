import {Shinren} from '@app/(apps)/shinren/class/Shinren'
import prisma from 'src/lib/prisma'

import {
  createUserGroupedByArr,
  getapproachTypeGroupedByArr,
  getCurrentApproachableCustomerCount,
  getIncreasedNegotiationsCount,
  getOtherAggCount,
  getoutcomeGroupedByArr,
  getpurposeGroupedByArr,
  getvisitTypeGroupedByArr,
} from '@app/(apps)/shinren/admin/aggregation/aggregation-methods'
import {UserData} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/types'

export const GET_ALL_AGG_DATA = async (props: {userIdWhere; whereQuery; commonBy}) => {
  const {userIdWhere, whereQuery, commonBy = ['userId', 'date']} = props

  const withoutTelVisit = {approachType: {contains: '訪問'}}
  const tellOnly = {approachType: {contains: '電話'}}

  const User_Date_Where_Query = {
    userId: userIdWhere,
    date: whereQuery,
  }

  const masterFindManyProps: any = {
    orderBy: {sortOrder: 'asc'},
  }
  const outcomeMasters = await prisma.outcomeMaster.findMany({...masterFindManyProps})
  const purposeMaters = await prisma.purposeMaster.findMany({...masterFindManyProps})

  /**ベーシック集計 */
  const outcomeGroupedByArr = await getoutcomeGroupedByArr({User_Date_Where_Query, commonBy, masterDataArr: outcomeMasters})

  const purposeGroupedByArr = await getpurposeGroupedByArr({User_Date_Where_Query, commonBy})
  const visitTypeGroupedByArr = await getvisitTypeGroupedByArr({
    commonBy,
    User_Date_Where_Query,
  })

  const visitWithoutTellGroupedByArr = await getvisitTypeGroupedByArr({
    commonBy,
    User_Date_Where_Query,
    additionalWhere: withoutTelVisit,
  })
  const visitTellOnlyGroupedByArr = await getvisitTypeGroupedByArr({
    commonBy,
    User_Date_Where_Query,
    additionalWhere: tellOnly,
  })

  const approachTypeGroupedByArr = await getapproachTypeGroupedByArr({User_Date_Where_Query, commonBy})

  //種類が違う

  const increasedNegotiationsGroupedByArr = await getIncreasedNegotiationsCount({User_Date_Where_Query, commonBy})
  const currentApproachableCustomerCount = await getCurrentApproachableCustomerCount({User_Date_Where_Query, commonBy})
  const promptActivityCount = purposeGroupedByArr.filter(P_AGG => {
    const aggregateAs = purposeMaters.find(p => p.id === P_AGG.purposeMasterId)?.aggregateAs
    return aggregateAs === '促進活動'
  })

  const users = await prisma.user.findMany({
    where: {app: 'shinren', id: userIdWhere},
    include: {
      RentaStore: true,
    },
    orderBy: [{rentaStoreId: 'asc'}, {sortOrder: 'asc'}],
  })

  const usersOrTotal = commonBy.includes('userId') ? users : [{id: undefined, name: 'total', RentaStore: null}]
  const userWithCount: UserData[] = await Promise.all(
    usersOrTotal.map(async user => {
      const otherAggCount = await getOtherAggCount({
        user,
        increasedNegotiationsGroupedByArr,
        currentApproachableCustomerCount,
        promptActivityCount,
      })

      const CustomVisitTypeMaster = [
        {value: '新規(計)', label: '新規(計)', color: '#ff0000'},
        ...Shinren.constants.visitTypes.map(v => ({value: v.value, label: v.value, color: v.color})),
      ]

      const visitTypeCount = await createUserGroupedByArr({
        user,
        GroupedByArrSort: visitTypeGroupedByArr,
        MASTER: {
          Array: CustomVisitTypeMaster,
          dataKey: 'visitType',
        },
        columnOrigin: CustomVisitTypeMaster,
        categoryName: '総合活動',
      })

      const visitTypeWithoutTellCount = await createUserGroupedByArr({
        user,
        GroupedByArrSort: visitWithoutTellGroupedByArr,
        MASTER: {
          Array: CustomVisitTypeMaster,
          dataKey: 'visitType',
        },
        columnOrigin: CustomVisitTypeMaster,
        categoryName: 'うち訪問',
      })
      const visitTypeTellOnlyCount = await createUserGroupedByArr({
        user,
        GroupedByArrSort: visitTellOnlyGroupedByArr,
        MASTER: {
          Array: CustomVisitTypeMaster,
          dataKey: 'visitType',
        },
        columnOrigin: CustomVisitTypeMaster,
        categoryName: 'うちTEL',
      })

      const outcomeCount = await createUserGroupedByArr({
        user,
        GroupedByArrSort: outcomeGroupedByArr,
        MASTER: {
          Array: outcomeMasters.map(op => {
            return {...op, value: op.id, label: op.name}
          }),
          dataKey: 'outcomeMasterId',
        },
        columnOrigin: outcomeMasters,
        categoryName: '成果',
      })
      const purposeCount = await createUserGroupedByArr({
        user,
        GroupedByArrSort: purposeGroupedByArr,
        MASTER: {
          Array: purposeMaters.map(op => {
            return {...op, value: op.id, label: op.name}
          }),
          dataKey: 'purposeMasterId',
        },
        columnOrigin: purposeMaters,
        categoryName: '目的',
      })

      const {name, id, RentaStore} = user

      const data: UserData = {
        id,
        name,
        RentaStore,
        visitTypeCount,
        visitTypeWithoutTellCount,
        visitTypeTellOnlyCount,
        otherAggCount,
        outcomeCount,
        purposeCount,
      }

      return data
    })
  )

  return userWithCount
}
