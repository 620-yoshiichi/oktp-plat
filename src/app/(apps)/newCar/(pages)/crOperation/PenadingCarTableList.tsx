'use client'

import CarCardPopover from '@app/(apps)/newCar/(pages)/crOperation/CarCardPopover'
import {checkAlert} from '@app/(apps)/newCar/(pages)/crOperation/const'
import {NEW_CAR_CONST} from '@app/(apps)/newCar/(constants)/newCar-constants'
import {NewCarClass} from '@app/(apps)/newCar/class/NewCarClass/NewCarClass'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'

import React from 'react'

export default function ({pendingCars, crHolidays, CrScheduleSwitcherModal_HK}) {
  const registered = pendingCars.filter(car => car.DD_TOUROKU)
  const unRegisterd = pendingCars.filter(car => !car.DD_TOUROKU)
  const find = registered?.find(d => d.NO_CYUMON.includes('13 47627'))

  const carTypes: {label: string; cars: any[]}[] = [
    ...NEW_CAR_CONST.CR_OPERATION.STATUS_COLORS.filter(d => d.value.includes(`保留`)).map(status => {
      return {
        label: status.value,
        cars: unRegisterd?.filter(car => {
          const theStatus = new NewCarClass(car)?.chakko?.getLatestCrInspectionHistory()?.status

          return theStatus === status.value
        }),
      }
    }),
    {
      label: `登録済み`,
      cars: registered.filter(car => {
        const theStatus = new NewCarClass(car)?.chakko?.getLatestCrInspectionHistory()?.status
        return true
      }),
    },
  ]

  return (
    <R_Stack className={` flex-nowrap  items-start`}>
      {carTypes.map(d => {
        return (
          <div key={d.label} className={`min-w-[160px]`}>
            {d.cars.length === 0 && <p>{d.label} なし</p>}
            <PenadingCarTable
              {...{
                label: d.label,
                cars: d.cars,
                crHolidays,
                CrScheduleSwitcherModal_HK,
              }}
            />
          </div>
        )
      })}
    </R_Stack>
  )
}

const PenadingCarTable = ({label, cars, crHolidays, CrScheduleSwitcherModal_HK}) => {
  const table = CsvTable({
    ...{
      headerRecords: [],
      records: cars.map(theCar => {
        const date = new Date()
        const cellProps = checkAlert({
          date: date,
          newCar: theCar,
          crHolidays,
        })

        return {
          csvTableRow: [
            //
            {
              label: label,
              cellValue: <CarCardPopover {...{CrScheduleSwitcherModal_HK, theCar, day: date, cellProps}} />,
            },
          ],
        }
      }),
    },
  })

  return table.WithWrapper({size: `sm`, className: 'max-h-[70vh] text-center [&_td]:!p-0 '})
}
