'use client'

import CarCardPopover from '@app/(apps)/newCar/(pages)/crOperation/CarCardPopover'
import {checkAlert, NDayMsterList} from '@app/(apps)/newCar/(pages)/crOperation/const'
import {NewCarClass} from '@app/(apps)/newCar/class/NewCarClass/NewCarClass'

import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import React from 'react'
import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'

export default function ScheduledCarTable({from, to, crHolidays, newCars, CrScheduleSwitcherModal_HK}) {
  let minusNumber = -7
  let days: any[] = Days.day.getDaysBetweenDates(from, to)

  // days.reverse()
  days = days.map(d => {
    const isHoliday = crHolidays.some(h => Days.validate.isSameDate(h, d))
    let nDateStr = ``
    if (!isHoliday) {
      const abs = Math.abs(minusNumber)

      nDateStr = minusNumber === 0 ? 'N' : minusNumber > 0 ? `N+${abs}` : `N-${abs}`
      minusNumber++
    } else {
      nDateStr = `休`
    }

    const nDayMsterProps = NDayMsterList.find(n => n.nDayStr === nDateStr)

    return {date: d, nDateStr, isHoliday, nDayMsterProps}
  })

  const CarsOnDate = {}
  newCars.forEach(car => {
    const newCarCl = new NewCarClass(car)
    const pendingDate = newCarCl.chakko.getPendingDateOrDD_SAGTYYO()
    const dateStr = pendingDate ? formatDate(pendingDate) : ''
    obj__initializeProperty(CarsOnDate, dateStr, [])
    CarsOnDate[dateStr].push(car)
  })
  const MaxRowCount = Math.max(1, ...Object.values(CarsOnDate).map((cars: any[]) => cars.length))

  const stylesInColumns = Object.fromEntries([
    // [0, {style: {width: 20}}],
    ...days.map((d, idx) => {
      const {isHoliday} = d
      const style = {
        ...(isHoliday ? {backgroundColor: `#848484`} : {}),
      }
      return [idx + 1, {style}]
    }),
  ])

  const TB = CsvTable({
    stylesInColumns,
    records: new Array(MaxRowCount).fill(0).map((_, rowIdx) => {
      return {
        csvTableRow: [
          {
            label: `連番`,
            cellValue: rowIdx + 1,
            style: {textAlign: `center`},
          },
          ...days.map((day, dayIdx) => {
            const theCar = CarsOnDate?.[formatDate(day.date)]?.[rowIdx]

            if (!theCar) {
              return {cellValue: ''}
            }

            const cellProps = checkAlert({
              date: day.date,
              newCar: theCar,
              crHolidays,
            })

            return {
              label: formatDate(day.date, 'M/D(ddd)'),
              cellValue: <CarCardPopover {...{CrScheduleSwitcherModal_HK, theCar, day, cellProps}} />,
            }
          }),
        ],
      }
    }),
  })
  return (
    <div>
      <TB.WithWrapper />
    </div>
  )
}
