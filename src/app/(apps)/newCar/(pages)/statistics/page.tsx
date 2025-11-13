import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {Days} from '@cm/class/Days/Days'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

import {getWhereQuery} from '@cm/lib/methods/redirect-method'
import LeadTimePageCC from '@app/(apps)/newCar/(pages)/statistics/LeadTimePageCC/LeadTimePageCC'
import Redirector from '@cm/components/utils/Redirector'

export default async function Page(props) {
  const query = await props.searchParams
  const {firstDayOfMonth} = Days.month.getMonthDatum(getMidnight())

  const {redirectPath, whereQuery} = await getWhereQuery({
    defaultQuery: {
      lt1_from: Days.month.getNextMonthLastDate(firstDayOfMonth, 0),
      lt1_to: Days.month.getNextMonthLastDate(firstDayOfMonth, 0),
      lt2_from: toUtc(new Date(2024, 3, 1)),
      lt2_to: toUtc(new Date(2024, 5, 1)),
    },
    query,
  })

  if (redirectPath) return <Redirector {...{redirectPath}} />
  return <LeadTimePageCC />
}
