import {getUserIdWhere} from '@app/(apps)/shinren/class/QueryBuilder'
import {Days} from '@cm/class/Days/Days'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {getWhereQuery} from '@cm/lib/methods/redirect-method'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import prisma from 'src/lib/prisma'

import {addDays, startOfMonth} from 'date-fns'
import dynamic from 'next/dynamic'
import Redirector from '@cm/components/utils/Redirector'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import {GET_ALL_AGG_DATA} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/aggregation-methods-main'
import {JoinedQuery} from '@cm/class/JoinedQuery'

GET_ALL_AGG_DATA
const loading = () => <PlaceHolder />
const RentaAggTableByUser = dynamic(
  () => import('@app/(apps)/shinren/admin/aggregation/RentaAggTableByUser/RentaAggTableByUser'),
  {
    loading,
  }
)
const RentaAggTableByDate = dynamic(
  () => import('@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/RentaAggTableByDate'),
  {
    loading,
  }
)
const Chart1 = dynamic(() => import('@app/(apps)/shinren/admin/aggregation/Chart1'), {loading})
const AggTableSwitcher = dynamic(() => import('@app/(apps)/shinren/admin/aggregation/AggTableSwitcher'), {loading})

const CalendarPage = async props => {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})
  const refDate = query.from ? toUtc(query.from) : new Date()
  const from = Days.month.getMonthDatum(refDate).firstDayOfMonth
  const monthData = Days.month.getMonthDatum(from)

  const defaultQuery = {from: startOfMonth(new Date())}
  const userIdWhere = getUserIdWhere({query, scopes})

  const {redirectPath, whereQuery} = await getWhereQuery({
    defaultQuery,
    query,
    whereQueryConverter: whereQuery => {
      const {gte} = whereQuery ?? {}

      const lt = gte ? Days.month.getMonthDatum(new Date(gte)).lastDayOfMonth : undefined

      return {gte: from, lt: lt ? addDays(lt, 1) : undefined}
    },
  })

  if (redirectPath) {
    return <Redirector redirectPath={redirectPath} />
  }

  const {days} = Days.day.getIntervalDatum(monthData.firstDayOfMonth, monthData.lastDayOfMonth)

  const masterFindManyProps: any = {
    orderBy: {sortOrder: 'asc'},
  }
  const outcomeMasters = await prisma.outcomeMaster.findMany({...masterFindManyProps})
  const purposeMaters = await prisma.purposeMaster.findMany({...masterFindManyProps})

  //全員表示モードかどうかで切り替える
  const UserJQ = new JoinedQuery({
    query,
    queryKey: `g_userIdArr`,
    modelDataArr: [],
    uniqueKeyOnModel: `id`,
    type: `add`,
  })

  // const {idsArrToString} = getQueryId({query, queryKey: 'g_userIdArr'})

  const totalMode = UserJQ.extract().string().current.length > 1 && query.tableMode === 'byDate'

  const commonBy = totalMode ? ['date'] : ['userId', 'date']
  const userWithCount = await GET_ALL_AGG_DATA({userIdWhere, whereQuery, commonBy})

  const modes = [
    {
      label: 'ユーザー別月間合計',
      value: 'byUser',
      component: <RentaAggTableByUser {...{days, userWithCount, outcomeMasters, purposeMaters}} />,
    },
    {
      label: '日付別',
      value: 'byDate',
      component: <RentaAggTableByDate {...{query, days, userWithCount, outcomeMasters, purposeMaters}} />,
    },
    {
      label: 'グラフ',
      value: 'chart1',
      component: <Chart1 {...{days, userWithCount, outcomeMasters, purposeMaters}} />,
    },
  ]

  return (
    <div>
      <>
        <AggTableSwitcher {...{modes}} />
      </>
    </div>
  )
}

export default CalendarPage
