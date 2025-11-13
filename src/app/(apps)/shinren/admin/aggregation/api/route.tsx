// import {GET_ALL_AGG_DATA} from '@app/(apps)/shinren/admin/calendar/CalendarTable/aggregation/RentaAggTableByDate/aggregation-methods-main'
import {NextRequest, NextResponse} from 'next/server'
import {GET_ALL_AGG_DATA} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/aggregation-methods-main'

export const POST = async (req: NextRequest) => {
  const {whereQuery, userIdWhere} = await req.json()
  const userWithCount = await GET_ALL_AGG_DATA({
    whereQuery,
    userIdWhere,
    commonBy: ['userId', 'date'],
  })

  userWithCount.forEach(user => {
    const {name, id, RentaStore, ...restInfo} = user
    Object.keys(restInfo).forEach((key, aggDataKeyIndex) => {
      const Data = restInfo[key]
      const {groupByArr, columnOrigin, categoryName} = Data
      groupByArr.forEach(record => {
        const {key, color, label, COUNT, date, aggregateAs, sortOrder} = record
      })
    })
  })

  return NextResponse.json({result: userWithCount, success: true})
}
