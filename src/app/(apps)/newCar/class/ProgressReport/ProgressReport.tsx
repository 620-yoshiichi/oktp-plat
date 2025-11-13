'use client'

import {getQueryByMonthType, Month} from '@app/(apps)/newCar/class/ProgressReport/(lib)/getWheres'

import {Days} from '@cm/class/Days/Days'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import React from 'react'
import {getQueryByMonth} from '@app/(apps)/newCar/class/ProgressReport/(lib)/getQueryByMonth'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useSWR from 'swr'
import {cacheFetchProgressReportRecords} from '@app/(apps)/newCar/class/ProgressReport/(lib)/cacheFetchProgressReportRecords'

export default function ProgressReport({query}) {
  const {accessScopes} = useGlobal()
  const scopes = accessScopes()

  const {newCarWhere} = scopes.getNewCarProps()
  const {storeId, userId} = newCarWhere

  const thisMonth = toUtc(query.month)
  const firstMonth = Days.month.getNextMonthLastDate(thisMonth, -1)

  const months: Month[] = [...Days.month.getMonthsBetweenDates(firstMonth, Days.month.getNextMonthLastDate(thisMonth, 2))]

  const queryByMonthList: getQueryByMonthType[] = getQueryByMonth({months, newCarWhere, userId, storeId})

  const key = JSON.stringify({queryByMonthList})
  const {data: ProgressReportRecords} = useSWR(key, async data => cacheFetchProgressReportRecords({queryByMonthList}))

  if (!ProgressReportRecords) return <div>Loading...</div>
  return (
    <>
      ただいまメンテナンス中です
      {/* <ProgressReportClient {...{months, ProgressReportRecords, queryByMonthList}} /> */}
    </>
  )
}
