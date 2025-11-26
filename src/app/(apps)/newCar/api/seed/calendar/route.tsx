import {Days} from '@cm/class/Days/Days'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

import {transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {Prisma} from '@prisma/client'
import {addMonths, addYears} from 'date-fns'

import {NextRequest, NextResponse} from 'next/server'

export const POST = async (req: NextRequest) => {
  const {firstDateOfYear} = Days.year.getYearDatum(getMidnight().getFullYear())
  const nextYearFirstDate = addYears(firstDateOfYear, 1)
  const nextApril = addMonths(nextYearFirstDate, 3)
  const months = Days.month.getMonthsBetweenDates(firstDateOfYear, nextApril)
  const allDaysInYear = months
    .map(d => {
      const daysInMonth = Days.month.getMonthDatum(d).days

      return daysInMonth.flat()
    })
    .flat()

  const honbuHolidays = [
    `2024/04/07`,
    `2024/04/10`,
    `2024/04/14`,
    `2024/04/21`,
    `2024/04/28`,
    `2024/04/29`,
    `2024/04/30`,
    `2024/05/01`,
    `2024/05/02`,
    `2024/05/03`,
    `2024/05/04`,
    `2024/05/05`,
    `2024/05/06`,
    `2024/05/07`,
    `2024/05/12`,
    `2024/05/19`,
    `2024/05/26`,
    `2024/06/02`,
    `2024/06/09`,
    `2024/06/12`,
    `2024/06/16`,
    `2024/06/23`,
    `2024/06/30`,
    `2024/07/07`,
    `2024/07/10`,
    `2024/07/14`,
    `2024/07/15`,
    `2024/07/21`,
    `2024/07/28`,
    `2024/08/04`,
    `2024/08/10`,
    `2024/08/11`,
    `2024/08/12`,
    `2024/08/13`,
    `2024/08/14`,
    `2024/08/15`,
    `2024/08/16`,
    `2024/08/18`,
    `2024/08/25`,
    `2024/09/01`,
    `2024/09/08`,
    `2024/09/11`,
    `2024/09/15`,
    `2024/09/16`,
    `2024/09/22`,
    `2024/09/23`,
    `2024/09/29`,
    `2024/10/06`,
    `2024/10/09`,
    `2024/10/13`,
    `2024/10/14`,
    `2024/10/20`,
    `2024/10/27`,
    `2024/11/03`,
    `2024/11/04`,
    `2024/11/06`,
    `2024/11/10`,
    `2024/11/17`,
    `2024/11/23`,
    `2024/11/24`,
    `2024/12/1`,
    `2024/12/8`,
    `2024/12/11`,
    `2024/12/15`,
    `2024/12/22`,
    `2024/12/28`,
    `2024/12/29`,
    `2024/12/30`,
    `2024/12/31`,
    `2025/1/1`,
    `2025/1/2`,
    `2025/1/3`,
    `2025/1/4`,
    `2025/1/5`,
    `2025/1/12`,
    `2025/1/13`,
    `2025/1/19`,
    `2025/1/26`,
    `2025/2/2`,
    `2025/2/5`,
    `2025/2/9`,
    `2025/2/11`,
    `2025/2/16`,
    `2025/2/23`,
    `2025/2/24`,
    `2025/3/2`,
    `2025/3/9`,
    `2025/3/12`,
    `2025/3/16`,
    `2025/3/20`,
    `2025/03/23`,
    `2025/03/30`,
  ]
  const transactionQueryList: transactionQuery<'calendar', 'upsert'>[] = []

  allDaysInYear.forEach(date => {
    const formattedHolidays = honbuHolidays.map(d => formatDate(new Date(d)))
    const includes = formattedHolidays.includes(formatDate(date))

    const theDate = new Date(date)
    const isHoliday = Days.day.isHoliday(theDate)
    const payload = {
      date: theDate,
      cr: includes,
      sharyobu: isHoliday ? true : includes,
    }
    const queryObject: Prisma.CalendarUpsertArgs = {
      where: {
        date: payload.date,
      },
      create: payload,
      update: payload,
    }

    transactionQueryList.push({
      model: `calendar`,
      method: `upsert`,
      queryObject,
    })
  })

  const res = await doTransaction({transactionQueryList})

  return NextResponse.json(res)
}
