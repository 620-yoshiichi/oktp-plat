'use client'
import React, {useCallback, useEffect, useState} from 'react'
import {SelectorCC, TableCC} from '@app/(apps)/newCar/(pages)/statistics/LeadTimePageCC/TableCC'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import {fetchRawSql} from '@cm/class/Fields/lib/methods'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {
  getGroupByProps,
  getLeadTimeSql,
  getLeadTimeSqlType,
} from '@app/(apps)/newCar/(pages)/statistics/LeadTimePageCC/getLeadTimeSql'
import {LeadTimeColumnList} from '@app/(apps)/newCar/(pages)/statistics/LeadTimePageCC/LeadTimeColumnsList'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {Days} from '@cm/class/Days/Days'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

export type tableFilter = {
  from: Date
  to: Date
}

export default function useStatisTicsTable({commonFilterQuery, fromKey, toKey}) {
  const {query} = useGlobal()
  const {selectCols, groupBy, groupBySelect, orderBy} = getGroupByProps({commonFilterQuery})
  const [data, setdata] = useState<any>(null)

  const from = query[fromKey] ? toUtc(query[fromKey]) : undefined
  let to = query[toKey] ? toUtc(query[toKey]) : undefined
  if (to) {
    to = Days.month.getMonthDatum(to).lastDayOfMonth
  }

  const formData = {[fromKey]: from, [toKey]: to}

  const SqlGetter: getLeadTimeSqlType = useCallback(
    ({additionalWherePhrase}) => {
      const {leadTimeDetailSql, leadTimeAggSql} = getLeadTimeSql({
        dataKey: commonFilterQuery.dataKey,
        ...{from, to},
        ...{groupBySelect, groupBy, orderBy},
        additionalWherePhrase,
      })
      return {leadTimeDetailSql, leadTimeAggSql}
    },
    [commonFilterQuery.dataKey, from, to, groupBySelect, groupBy, orderBy]
  )

  const {leadTimeAggSql} = SqlGetter({})
  useEffect(() => {
    if (data === null) {
      fetchRawSql({sql: leadTimeAggSql}).then(d => {
        setdata(d.rows ?? [])
      })
    }
  }, [query])

  const Table = (props: {dataToCompare?: any}) => {
    const {dataToCompare} = props
    return (
      <C_Stack>
        <SelectorCC {...{formData, fromKey, toKey}} />

        {data === null ? (
          <PlaceHolder>読み込んでいます</PlaceHolder>
        ) : (
          <TableCC
            {...{
              SqlGetter,
              selectCols,
              LeadTimeColumnList,
              data,
              dataToCompare,
            }}
          />
        )}
      </C_Stack>
    )
  }

  return {
    Table,
    data,
    LeadTimeColumnList,
  }
}
