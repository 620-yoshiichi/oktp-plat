'use client'

import { getQueryByMonthType, Month } from '@app/(apps)/newCar/class/ProgressReport/(lib)/getWheres'

import { Days } from '@cm/class/Days/Days'
import { toUtc } from '@cm/class/Days/date-utils/calculations'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import React from 'react'
import { getQueryByMonth } from '@app/(apps)/newCar/class/ProgressReport/(lib)/getQueryByMonth'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useSWR from 'swr'
import { cacheFetchProgressReportRecords } from '@app/(apps)/newCar/class/ProgressReport/(lib)/cacheFetchProgressReportRecords'
import ProgressReportClient from '@app/(apps)/newCar/class/ProgressReport/ProgressReportClient'

export default function ProgressReport({ query }) {
  const { accessScopes } = useGlobal()
  const scopes = accessScopes()

  const { newCarWhere } = scopes.getNewCarProps()
  const { storeId, userId } = newCarWhere

  const thisMonth = toUtc(query.month)
  const firstMonth = Days.month.getNextMonthLastDate(thisMonth, -1)

  const rawMonths = [...Days.month.getMonthsBetweenDates(firstMonth, Days.month.getNextMonthLastDate(thisMonth, 2))]
  const months: Month[] = rawMonths.map(m => toUtc(formatDate(m, 'YYYY-MM') + '-01'))

  const queryByMonthList: getQueryByMonthType[] = getQueryByMonth({ months, newCarWhere, userId, storeId })

  const key = JSON.stringify({ months, newCarWhere, userId, storeId })
  const { data: ProgressReportRecords } = useSWR(key, async () => cacheFetchProgressReportRecords({ months, newCarWhere, userId, storeId }))

  if (!ProgressReportRecords) return <div>Loading...</div>
  return (
    <>

      <ProgressReportClient {...{ months, ProgressReportRecords, queryByMonthList }} />
    </>
  )
}
