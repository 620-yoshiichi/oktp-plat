'use client'

import {ArrowPathIcon} from '@heroicons/react/20/solid'

import {getColorStyles} from '@cm/lib/methods/colors'
import {useEffect, useState} from 'react'
import {getCellStyle} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/Ths2'

export const LazyLoadingTd = ({i, counts, obj, tdStyle}) => {
  const key = obj.name || obj.value
  const [COUNT, setCOUNT] = useState<any>(
    <small>
      <ArrowPathIcon className={`  animate-[spin_3s_ease-out] text-gray-500  `} />
    </small>
  )

  useEffect(() => {
    const count = counts[key]
    setCOUNT(count)
  }, [])

  return (
    <td
      style={{
        ...getColorStyles(obj.color + '40'),
        ...tdStyle,
        ...getCellStyle({i, total: false}),
      }}
    >
      {COUNT}
    </td>
  )
}
