'use client'

import {LazyLoadingTd} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/LazyLoadingTd'
import {getCellStyle} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/Ths2'
import {dataCountArrForUserType} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/types'
import {Days} from '@cm/class/Days/Days'
import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'
import {optionType} from '@cm/class/Fields/col-operator-types'

import {CSSProperties, Fragment, useState} from 'react'

export const Tds = (props: {
  dataKey: string
  columnOrigin: optionType[] | any[]
  dataCountArrForUser: dataCountArrForUserType[]
  day?: Date
}) => {
  const {dataKey, columnOrigin, dataCountArrForUser, day} = props

  const [total, settotal] = useState(0)
  const tdStyle: CSSProperties = {...(day ? Days.day.isHoliday(day)?.style : {}), color: 'gray', fontWeight: 'normal'}

  const counts = {total: 0}

  columnOrigin.map((obj, i) => {
    const key = obj.name || obj.value
    const dataArr = dataCountArrForUser?.filter(DATA_OBJ => {
      const typeMatch = DATA_OBJ.key === (obj?.id ?? obj.value)

      if (day) {
        // ここでdayがあるかどうかで、日付のフィルタリングをするかどうかを判断している
        const dateMatch = DATA_OBJ.date && Days.validate.isSameDate(DATA_OBJ.date, day)
        return typeMatch && dateMatch
      } else {
        return typeMatch
      }
    })

    dataArr.forEach(DATA_OBJ => {
      obj__initializeProperty(counts, key, 0)

      counts[key] += DATA_OBJ.COUNT
      counts.total += DATA_OBJ.COUNT
    })
  })

  const TOTAL = (counts.total ?? 0) - (counts[`新規`] ?? 0) - (counts[`新規[継続]`] ?? 0)

  return (
    <Fragment>
      {columnOrigin.map((obj, i) => {
        return <LazyLoadingTd key={i} {...{i, counts, obj, tdStyle}} />
      })}

      <td style={{...tdStyle, ...getCellStyle({total: true})}}>{TOTAL ? TOTAL : ''}</td>
    </Fragment>
  )
}
