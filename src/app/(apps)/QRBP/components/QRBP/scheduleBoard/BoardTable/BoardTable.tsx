'use client'
import {CSSProperties, Fragment} from 'react'
import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {cl} from '@cm/lib/methods/common'
import {getColorStyles} from '@cm/lib/methods/colors'

import DateColumn from '@app/(apps)/QRBP/components/QRBP/scheduleBoard/BoardTable/DateColumn'

import Droppable from '@cm/components/DnD/Droppable'
import {Z_INDEX} from '@cm/lib/constants/constants'

const BoardTable = (props: any) => {
  const {targetDays, selectedCar, Damages, cars_groupedBy_Damage_Date, setcarOnModal, lastTouchedCarId, setlastTouchedCarId} =
    props
  const dateThClass = `bg-gray-300 text-xs px-0`
  const unscheduledClass = `w-20  `
  const theadStickyStyle: CSSProperties = {position: 'sticky', zIndex: Z_INDEX.thead}

  const left = 200

  return (
    <div className={`table-wrapper  max-h-[75vh] overflow-auto [&_td]:border [&_th]:border`} id="board">
      <table>
        <thead>
          <tr>
            <Fragment>
              <th style={{...theadStickyStyle, left: 0, zIndex: 99999}} className={cl(dateThClass, ``)}>
                #
              </th>
              {targetDays.map((day, d) => {
                const dateId = `date-${formatDate(day)}`
                return (
                  <th
                    id={dateId}
                    className={cl(dateThClass)}
                    key={d}
                    style={{
                      ...Days.day.isHoliday(day)?.style,
                      zIndex: 10,
                    }}
                  >
                    {formatDate(day, 'MM-DD(ddd)')}
                  </th>
                )
              })}
            </Fragment>
          </tr>
        </thead>

        <tbody>
          {Damages?.map((damage, d) => {
            const carsOnDamage = cars_groupedBy_Damage_Date?.[damage.id]

            const carCounts = targetDays.map(day => {
              const cars = carsOnDamage?.[formatDate(day)]
              return cars?.length ?? 0
            })

            const heightElementHeight = Math.max(...carCounts, carsOnDamage?.['unscheduled']?.length ?? 0) * 45

            const th_td_props = {
              minHeight: 200,
              height: heightElementHeight,
            }

            return (
              <tr key={d} className={` min-h-[100px]`}>
                <th style={{...theadStickyStyle, left: 0, zIndex: 9999}} className={cl(unscheduledClass, ` !p-0`)}>
                  <Droppable
                    {...{
                      id: `${damage.id}_${'unscheduled'}`,
                      style: {
                        ...th_td_props,
                      },
                    }}
                  >
                    <div
                      style={{
                        width: left,
                        height: '100%',
                        ...getColorStyles(damage.color),
                      }}
                    >
                      <div className={`px-2`}>{damage.name}</div>
                      <DateColumn
                        key={d}
                        {...{
                          colId: 'unscheduled',
                          cars: carsOnDamage?.['unscheduled'],
                          setcarOnModal,
                          lastTouchedCarId,
                          setlastTouchedCarId,
                        }}
                      />
                    </div>
                  </Droppable>
                </th>

                {/* dates */}

                {targetDays.map((day, d) => {
                  const cars = carsOnDamage?.[formatDate(day)]

                  return (
                    <td key={d}>
                      <Droppable
                        {...{
                          id: `${damage.id}_${day}`,
                          style: {
                            ...th_td_props,
                            ...Days.day.isHoliday(day)?.style,
                          },
                        }}
                      >
                        <DateColumn
                          {...{
                            colId: formatDate(day),
                            cars,
                            setcarOnModal,
                            lastTouchedCarId,
                            setlastTouchedCarId,
                          }}
                        />
                      </Droppable>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default BoardTable
