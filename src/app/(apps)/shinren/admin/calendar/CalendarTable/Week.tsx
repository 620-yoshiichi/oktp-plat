'use client'

import ListByCalendarDataType from '@app/(apps)/shinren/admin/calendar/CalendarTable/ListByCalendarDataType'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {C_Stack} from '@cm/components/styles/common-components/common-components'

import {cl, responsiveClass} from '@cm/lib/methods/common'

const Week = ({isDifferentMonth, day, listsOnDate, activeInfoType, query, useGlobalProps}) => {
  const className = cl(
    isDifferentMonth ? 'bg-gray-400 opacity-70' : '',
    'border-[1px]',
    'relative',
    'h-[100px] w-[14%] overflow-auto',
    responsiveClass(' text-xs '),
    responsiveClass(' text-base', 'sm')
  )

  return (
    <td className={className}>
      <C_Stack className={`h-full items-stretch `}>
        <div className={`sticky right-1 top-0 bg-white text-right`}>{formatDate(day, 'D(ddd)')}</div>

        {listsOnDate && (
          <>
            {/* 代替え、証券、メモ別 */}
            {listsOnDate.map((data, idx) => {
              return (
                <div key={idx}>
                  <ListByCalendarDataType
                    {...{
                      data,
                      idx,
                      activeInfoType,
                      query,
                      useGlobalProps,
                    }}
                  />
                </div>
              )
            })}
          </>
        )}
      </C_Stack>
    </td>
  )
}
export default Week
