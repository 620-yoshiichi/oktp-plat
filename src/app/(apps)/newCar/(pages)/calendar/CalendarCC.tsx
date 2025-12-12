'use client'

import {C_Stack, FitMargin, Padding, R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'

import {TableBordered, TableWrapper} from '@cm/components/styles/common-components/Table'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {createUpdate} from '@cm/lib/methods/createUpdate'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {colorVariants} from '@cm/lib/methods/colorVariants'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {Calendar} from '@prisma/generated/prisma/client'
import React from 'react'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {Days} from '@cm/class/Days/Days'

export default function CalendarCC() {
  const {query} = useGlobal()

  const month = toUtc(query.from ?? getMidnight())

  return (
    <Padding>
      <FitMargin>
        <NewDateSwitcher {...{monthOnly: true}} />
      </FitMargin>
      <R_Stack>
        <MonthlyCalendar {...{dayInMonth: month}} />
      </R_Stack>
    </Padding>
  )
}

const MonthlyCalendar = ({dayInMonth}) => {
  const monthStr = formatDate(dayInMonth, 'YYYY/MM')
  const month = Days.month.getMonthDatum(dayInMonth)

  const weeks = month.getWeeks(`月`, {showPrevAndNextMonth: true})

  const {data, mutate} = useDoStandardPrisma(`calendar`, `findMany`, {})
  if (!data) {
    return <PlaceHolder />
  }

  const calendars = data as Calendar[]
  return (
    <div className={`mx-auto w-fit`}>
      <strong>{monthStr}</strong>
      <hr />
      <TableWrapper>
        <TableBordered>
          <thead>
            <tr>
              {weeks[0].map((day, idx) => {
                const dayStr = formatDate(day, 'ddd')

                return (
                  <th key={idx} className={`text-center`}>
                    {dayStr}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIdx) => {
              return (
                <tr key={weekIdx}>
                  {week.map((date, dayIdx) => {
                    const dayStr = formatDate(date, 'D(ddd)')
                    const onThisMonth = formatDate(date, 'MM') === formatDate(dayInMonth, 'MM')

                    const calendarRecord = calendars.find(d => Days.validate.isSameDate(d.date, date)) as Calendar
                    if (onThisMonth) {
                      const isToday = Days.validate.isSameDate(date, new Date())
                      const tdStyle = isToday ? {background: `yellow`} : Days.day.isHoliday(date)?.style
                      return (
                        <td key={dayIdx} style={tdStyle}>
                          <div className={`h-[70px] w-[70px] text-sm `}>
                            <div className={`text-right`}>{dayStr}</div>
                            <HolidayConfigCheckbox {...{date, mutate, calendarRecord, daysInMonth: month.days}} />
                          </div>
                        </td>
                      )
                    } else {
                      return (
                        <td key={dayIdx} className={`text-gray-300`}>
                          <div className={`h-[60px] w-[60px] text-sm `}></div>
                        </td>
                      )
                    }
                  })}
                </tr>
              )
            })}
          </tbody>
        </TableBordered>
      </TableWrapper>
    </div>
  )
}

const HolidayConfigCheckbox = (props: {daysInMonth: Date[]; calendarRecord?: Calendar; date: Date; mutate: any}) => {
  const {daysInMonth, calendarRecord, date, mutate} = props ?? {}

  const keys = [
    {id: 'cr', label: `CR`, holidayColor: `blue`},
    {id: 'sharyobu', label: `車両部`, holidayColor: `red`},
  ]

  return (
    <C_Stack className={` items-center gap-1`}>
      {keys.map((d, keyIdx) => {
        const {id, label} = d
        const holidayColor = d.holidayColor as colorVariants
        const active = !!calendarRecord?.[id] === true

        const onClick = async () => {
          const checked = !active
          const payload = {
            date: getMidnight(date),
            [id]: checked,
          }

          const transactionQueryList: transactionQuery<'calendar', 'upsert'>[] = daysInMonth.map(d => {
            return {
              model: `calendar`,
              method: `upsert`,
              queryObject: {
                where: {date: d},
                create: {date: d, cr: false, sharyobu: false},
                update: {date: d},
              },
            }
          })

          await doTransaction({transactionQueryList})
          await doStandardPrisma(`calendar`, `upsert`, {
            where: {date: payload.date},
            ...createUpdate(payload),
          })

          await doStandardPrisma(`calendar`, `upsert`, {
            where: {date: payload.date},
            ...createUpdate(payload),
          })

          mutate(records => {
            const idx = records.findIndex(r => Days.validate.isSameDate(r.date, payload.date))
            if (idx > -1) {
              records[idx] = {...records[idx], ...payload}
            } else {
              records.push(payload)
            }
            return records
          })
        }
        return (
          <div key={keyIdx} className={`onHover text-center`} onClick={onClick}>
            {active ? (
              <IconBtn color={active ? holidayColor : `#d1d1d144`} className={`w-fit rounded p-0.5 py-0 text-xs`}>
                {label}
              </IconBtn>
            ) : (
              label
            )}
          </div>
        )
      })}
    </C_Stack>
  )
}
