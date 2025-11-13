import {
  createCalendarInfo,
  getAlternateInfo,
  getExtraInfo,
  getInsuranceInfo,
} from '@app/(apps)/shinren/admin/calendar/calendar-methods'
import ViewSwitcher from '@app/(apps)/shinren/admin/calendar/ViewSwitcher'
import {getUserIdWhere} from '@app/(apps)/shinren/class/QueryBuilder'

import {C_Stack} from '@cm/components/styles/common-components/common-components'

import Redirector from '@cm/components/utils/Redirector'

import {getWhereQuery} from '@cm/lib/methods/redirect-method'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {addDays} from 'date-fns'
import {Days} from '@cm/class/Days/Days'

const CalendarPage = async props => {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})

  const today = new Date()

  const defaultQuery = {
    from: today,
  }

  const {redirectPath, whereQuery} = await getWhereQuery({
    defaultQuery,
    query,
    whereQueryConverter: whereQuery => {
      const {gte} = whereQuery ?? {}
      const monthDatum = Days.month.getMonthDatum(gte || new Date())
      const {firstDayOfMonth, lastDayOfMonth} = monthDatum
      const result = {gte: gte ? firstDayOfMonth : undefined, lt: gte ? addDays(lastDayOfMonth, 360) : undefined}

      return result
    },
  })

  if (redirectPath) {
    return <Redirector redirectPath={redirectPath} />
  }

  const userIdWhere = getUserIdWhere({query, scopes})

  const AlterNateInfo = await getAlternateInfo({whereQuery, userIdWhere})
  const InsuranceInfo = await getInsuranceInfo({whereQuery, userIdWhere})
  const ExtraInfo = await getExtraInfo({whereQuery, userIdWhere})
  const CalendarInfo = createCalendarInfo({AlterNateInfo, InsuranceInfo, ExtraInfo})

  return (
    <div className={`p-2`}>
      <C_Stack className={`items-start`}>
        <ViewSwitcher
          {...{
            AlterNateInfo,
            InsuranceInfo,
            ExtraInfo,
            CalendarInfo,
          }}
        />
      </C_Stack>
    </div>
  )
}

export default CalendarPage
