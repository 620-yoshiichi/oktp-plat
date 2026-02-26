'use client'

import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { cl } from '@cm/lib/methods/common'
import { differenceInDays } from 'date-fns'

import React, { Fragment } from 'react'

const getElapsedDaysColor = (days: number) => {
  if (days >= 100) return `bg-red-100 text-red-700 font-bold`
  if (days >= 90) return `bg-orange-100 text-orange-700 font-bold`
  if (days >= 60) return `bg-yellow-100 text-yellow-700`
  return ``
}

const getElapsedDaysBorderColor = (days: number) => {
  if (days >= 100) return `border-l-4 border-l-red-500`
  if (days >= 90) return `border-l-4 border-l-orange-400`
  if (days >= 60) return `border-l-4 border-l-yellow-400`
  return ``
}

type GroupedByStoreStaff = {
  storeName: string
  storeCode: string
  staffName: string
  staffId: number
  cars: any[]
}

const groupByStoreAndStaff = (cars: any[]): GroupedByStoreStaff[] => {
  const groups: GroupedByStoreStaff[] = []
  const keyMap = new Map<string, GroupedByStoreStaff>()

  for (const car of cars) {
    const key = `${car.Store.code}_${car.User.id}`
    let group = keyMap.get(key)
    if (!group) {
      group = {
        storeName: car.Store.name,
        storeCode: car.Store.code,
        staffName: car.User.name,
        staffId: car.User.id,
        cars: [],
      }
      keyMap.set(key, group)
      groups.push(group)
    }
    group.cars.push(car)
  }

  for (const group of groups) {
    group.cars.sort((a, b) => {
      const dateA = a.DD_FR ? new Date(a.DD_FR).getTime() : Infinity
      const dateB = b.DD_FR ? new Date(b.DD_FR).getTime() : Infinity
      return dateA - dateB
    })
  }

  return groups
}

const isInputComplete = (car: any) => !!car.furiate_chien_riyu || !!car.nouki_mishitei_riyu

const COL_COUNT = 9

export default function Table({ cars, onRowClick, selectedCarId, maxHeighClass }: { cars: any[]; onRowClick: (car: any) => void; selectedCarId?: number; maxHeighClass?: string }) {
  const today = new Date()
  const groups = groupByStoreAndStaff(cars)

  return (
    <div>
      <div className={`mb-2 text-sm`}>
        <span className={`mr-3 text-xs text-gray-500`}>経過日数（60日、90日、100日）で警告色を表示</span>
        <span className={`mr-2 inline-block rounded bg-yellow-100 px-2 py-0.5 text-xs`}>60日~</span>
        <span className={`mr-2 inline-block rounded bg-orange-100 px-2 py-0.5 text-xs`}>90日~</span>
        <span className={`inline-block rounded bg-red-100 px-2 py-0.5 text-xs`}>100日~</span>
      </div>

      <div className={`${maxHeighClass} overflow-x-auto`}>
        <table className={`w-full border-collapse text-sm`}>
          <thead className={`sticky top-0`}>
            <tr className={`border-b-2 border-gray-300 bg-gray-50`}>
              <th className={`whitespace-nowrap px-2 py-1.5 text-left text-xs font-bold text-gray-600`}>注文番号</th>
              <th className={`whitespace-nowrap px-2 py-1.5 text-left text-xs font-bold text-gray-600`}>振り当て日</th>
              <th className={`whitespace-nowrap px-2 py-1.5 text-left text-xs font-bold text-gray-600`}>車名</th>
              <th className={`whitespace-nowrap px-2 py-1.5 text-left text-xs font-bold text-gray-600`}>買主名</th>
              <th className={`whitespace-nowrap px-2 py-1.5 text-left text-xs font-bold text-gray-600`}>名義人名</th>
              <th className={`whitespace-nowrap px-2 py-1.5 text-center text-xs font-bold text-gray-600`}>経過日数</th>
              <th className={`whitespace-nowrap px-2 py-1.5 text-left text-xs font-bold text-gray-600`}>登録予定</th>
              <th className={`whitespace-nowrap px-2 py-1.5 text-left text-xs font-bold text-gray-600`}>遅延理由</th>
              <th className={`whitespace-nowrap px-2 py-1.5 text-left text-xs font-bold text-gray-600`}>納期を指定しなかった理由</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group, groupIdx) => (
              <Fragment key={groupIdx}>
                <tr className={`bg-gray-100`}>
                  <td colSpan={COL_COUNT} className={`px-2 py-1.5`}>
                    <span className={`text-sm font-bold`}>{group.staffName}</span>
                    <span className={`ml-2 text-xs text-gray-400`}>
                      {group.cars.filter(isInputComplete).length}/{group.cars.length}
                    </span>
                  </td>
                </tr>

                {group.cars.map(car => {
                  const elapsedDays = car.DD_FR ? differenceInDays(today, new Date(car.DD_FR)) : 0
                  const isSelected = selectedCarId === car.id
                  const complete = isInputComplete(car)

                  return (
                    <tr
                      key={car.id}
                      className={cl(
                        `cursor-pointer border-b border-gray-100 transition-colors hover:bg-blue-50`,
                        isSelected ? `bg-blue-100!` : ``,
                        complete ? `opacity-60` : `font-bold`,
                        getElapsedDaysBorderColor(elapsedDays)
                      )}
                      onClick={() => onRowClick(car)}
                    >
                      <td className={`whitespace-nowrap px-2 py-1.5`}>
                        {complete && <span className={`mr-1 text-green-600`}>&#10003;</span>}
                        {car.NO_CYUMON}
                      </td>
                      <td className={`whitespace-nowrap px-2 py-1.5`}>{car.DD_FR ? formatDate(car.DD_FR) : ''}</td>
                      <td className={`px-2 py-1.5`}>{car.KJ_KURUMAME}</td>
                      <td className={`px-2 py-1.5`}>{car.KJ_KAINMEI1}</td>
                      <td className={`px-2 py-1.5`}>{car.KJ_MEIGIME1}</td>
                      <td className={`px-2 py-1.5 text-center`}>
                        <span className={cl(`inline-block rounded px-2 py-0.5`, getElapsedDaysColor(elapsedDays))}>{elapsedDays}</span>
                      </td>
                      <td className={`whitespace-nowrap px-2 py-1.5`}>
                        {car.m1_toroku_prediction ? formatDate(car.m1_toroku_prediction) : ''}
                      </td>
                      <td className={`max-w-[200px] px-2 py-1.5 text-xs`}>{car.furiate_chien_riyu ?? ''}</td>
                      <td className={`max-w-[200px] px-2 py-1.5 text-xs`}>{car.nouki_mishitei_riyu ?? ''}</td>
                    </tr>
                  )
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
