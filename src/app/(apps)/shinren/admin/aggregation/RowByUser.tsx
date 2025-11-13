'use client'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
IconBtn

import {HREF} from '@cm/lib/methods/urls'
import {T_LINK} from '@cm/components/styles/common-components/links'
import {Fragment} from 'react'
import {countCagetory, RowByUserProps} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/types'
import {Tds} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/Tds'

const RowByUser = (props: RowByUserProps) => {
  const {day, user, outcomeMasters, purposeMaters, query} = props

  const link = HREF(`/shinren/admin/config/rentaDailyReport`, {from: formatDate(day)}, query)
  const {id, name, RentaStore, ...restCountObject} = user
  const dateStr = formatDate(day, 'MM-DD(ddd)')

  return (
    <Fragment>
      <tr>
        <th className={`!z-auto w-[100px] bg-white`}>
          <R_Stack>
            <div>
              <T_LINK href={link}>{dateStr}</T_LINK>
            </div>
          </R_Stack>
        </th>

        {Object.keys(restCountObject).map((dataKey, i) => {
          const object = restCountObject[dataKey] as countCagetory

          const {columnOrigin} = object

          return (
            <Tds
              key={i}
              {...{
                dataKey: dataKey,
                columnOrigin,
                dataCountArrForUser: object.groupByArr,
                day,
              }}
            />
          )
        })}
      </tr>
    </Fragment>
  )
}

export default RowByUser
