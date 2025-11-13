'use client'

import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'

import {DetailPagePropType} from '@cm/types/types'

export const RentaDailyReportQuerySwitcher = (props: DetailPagePropType) => {
  return <NewDateSwitcher selectPeriod={true} />
}

export default RentaDailyReportQuerySwitcher
