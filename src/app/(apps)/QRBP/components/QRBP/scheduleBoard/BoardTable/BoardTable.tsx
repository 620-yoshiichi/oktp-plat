'use client'
import { CSSProperties } from 'react'
import { Days } from '@cm/class/Days/Days'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { isToday } from 'date-fns'

import DateColumn from '@app/(apps)/QRBP/components/QRBP/scheduleBoard/BoardTable/DateColumn'

import Droppable from '@cm/components/DnD/Droppable'
import { Z_INDEX } from '@cm/lib/constants/constants'
import { BP_Car } from '@app/(apps)/QRBP/class/BP_Car'
import { getColorStyles } from '@cm/lib/methods/colors'

const BoardTable = (props: any) => {
  const { targetDays, Damages, cars_groupedBy_Damage_Date, activeCars, setcarOnModal, lastTouchedCarId, setlastTouchedCarId, mode = 'cr' } = props
  const theadStickyStyle: CSSProperties = { position: 'sticky', zIndex: Z_INDEX.thead }

  const headerWidth = 160

  const getDateHeaderClass = (day: Date) => {
    if (isToday(day)) return 'bg-blue-50 text-blue-700 font-bold'
    const holiday = Days.day.isHoliday(day)
    if (holiday) return 'bg-red-50/40 text-red-400'
    return 'bg-gray-100 text-gray-500'
  }

  return (
    <div className={`  rounded-lg border border-gray-300`} id="board">
      <table className={`w-full border-collapse`}>
        <thead>
          <tr>
            <th
              style={{ ...theadStickyStyle, left: 0, zIndex: 99999, width: headerWidth }}
              className={`bg-gray-100 px-2 py-2 text-left text-[11px] font-medium text-gray-500 border-b-2 border-b-gray-400 border-r-2 border-r-gray-400`}
            >
              ダメージ区分
            </th>
            {targetDays.map((day, d) => {
              const dateId = `date-${formatDate(day)}`
              const today = isToday(day)
              return (
                <th
                  id={dateId}
                  key={d}
                  className={`
                    px-1 py-2 text-center text-[11px] font-medium whitespace-nowrap
                    border-b-2 border-b-gray-400
                    border-r border-r-gray-200
                    ${getDateHeaderClass(day)}

                    ${today ? 'border-b-blue-500!' : ''}
                  `}
                  style={{
                    ...theadStickyStyle, zIndex: 10, minWidth: 110,

                  }}
                >
                  {formatDate(day, 'MM/DD(ddd)')}
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody>
          {Damages?.map((damage, d) => {
            const carsOnDamage = cars_groupedBy_Damage_Date?.[damage.id]

            const inProgressCount = (activeCars ?? []).filter(car => {
              if (car.damageNameMasterId !== damage.id) return false
              const bpCar = new BP_Car(car)
              return bpCar.findProcessByName('着工指示') && !bpCar.findProcessByName('作業完了')
            }).length

            const carCounts = targetDays.map(day => {
              const cars = carsOnDamage?.[formatDate(day)]
              return cars?.length ?? 0
            })

            const heightElementHeight = Math.max(...carCounts, carsOnDamage?.['unscheduled']?.length ?? 0) * 42
            const isEvenRow = d % 2 === 0
            const rowBg = isEvenRow ? 'bg-white' : 'bg-gray-50/40'

            const cellStyle: CSSProperties = {
              minHeight: 80,
              height: heightElementHeight,
            }

            return (
              <tr key={d} className={`border-b-2  border-b-gray-400`}>
                <th
                  style={{
                    ...theadStickyStyle, left: 0, zIndex: 9999, width: headerWidth,

                  }}
                  className={`p-0! align-top border-r-2 border-r-gray-400 bg-gray-100`}
                >
                  <Droppable
                    {...{
                      id: `${damage.id}_${'unscheduled'}`,
                      style: cellStyle,
                    }}
                  >
                    <div
                      className={`h-full border-l-4`}
                      style={{
                        width: headerWidth,
                        borderLeftColor: damage.color || '#ccc',
                      }}
                    >
                      <div className={`flex items-center gap-1.5 px-2.5 py-2`}>
                        <span className={`text-xs font-semibold text-gray-700`}>{damage.name}</span>
                        {inProgressCount > 0 && (
                          <span
                            className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-100 px-1 text-[10px] font-bold text-orange-600`}
                          >
                            {inProgressCount}
                          </span>
                        )}
                      </div>
                      <DateColumn
                        key={d}
                        {...{
                          colId: 'unscheduled',
                          cars: carsOnDamage?.['unscheduled'],
                          setcarOnModal,
                          lastTouchedCarId,
                          setlastTouchedCarId,
                          mode,
                        }}
                      />
                    </div>
                  </Droppable>
                </th>

                {targetDays.map((day, di) => {
                  const cars = carsOnDamage?.[formatDate(day)]
                  const today = isToday(day)
                  const dayIso = formatDate(day, 'iso')

                  return (
                    <td
                      key={di}
                      className={`p-0 align-top border-r border-r-gray-200 ${rowBg} ${today ? 'bg-blue-50/30' : ''}`}
                    >
                      <Droppable
                        {...{
                          id: `${damage.id}_${dayIso}`,
                          style: cellStyle,
                        }}
                      >
                        <DateColumn
                          {...{
                            colId: formatDate(day),
                            cars,
                            setcarOnModal,
                            lastTouchedCarId,
                            setlastTouchedCarId,
                            mode,
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
