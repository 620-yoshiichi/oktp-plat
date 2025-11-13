'use client'

import Week from '@app/(apps)/shinren/admin/calendar/CalendarTable/Week'

import useElementRef from '@cm/hooks/useElementRef'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {cl, responsiveClass} from '@cm/lib/methods/common'
import {Paper} from '@cm/components/styles/common-components/paper'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {Days} from '@cm/class/Days/Days'

const CalendarTable = ({CalendarInfo, activeInfoType}) => {
  const useGlobalProps = useGlobal()
  const {query} = useGlobalProps
  const month = toUtc(query.from)

  const MonthData = Days.month.getMonthDatum(month)

  const {TargetElementProps, TargetElementRef} = useElementRef({id: 'calendarTable'})
  const tableWdith = TargetElementProps.rect.width
  const cellWidth = Math.floor(tableWdith / 7)
  const WIDTH = {
    cellWidth,
    tableWdith,
  }

  return (
    <>
      <Paper>
        <h3>{formatDate(month, 'YYYY年MM月')}</h3>
        <table
          ref={TargetElementRef}
          className={cl(
            'mx-auto table-fixed',
            responsiveClass('h-[200px] w-[90vw]'),
            responsiveClass('h-[200px] w-[90vw]', 'lg')
          )}
        >
          <tbody>
            {MonthData.getWeeks('月', {showPrevAndNextMonth: true}).map((week, index) => {
              return (
                //週

                <tr key={index}>
                  {week.map((day, index) => {
                    const listsOnDate = CalendarInfo[formatDate(day)]
                    const isDifferentMonth = new Date(day).getMonth() !== month.getMonth()

                    return (
                      <Week
                        key={index}
                        {...{
                          isDifferentMonth: isDifferentMonth,
                          day: day,
                          listsOnDate: listsOnDate,
                          activeInfoType,
                          query: query,

                          useGlobalProps,
                        }}
                      />
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </Paper>
    </>
  )
}

export default CalendarTable
