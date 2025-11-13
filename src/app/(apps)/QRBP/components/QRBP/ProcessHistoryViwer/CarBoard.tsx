import React from 'react'
import {Fragment} from 'react'

import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {getColorStyles} from '@cm/lib/methods/colors'
export const CarBoard = ({ProcessByCar, useGlobalProps}) => {
  return (
    <div className={`table-wrapper w-fit `}>
      <table className={`text-center`}>
        <thead>
          <tr>
            <th>車種名</th>
            <th>BP番号</th>
            <th>日時</th>
            <th>登録者</th>
            <th>時間</th>
            <th>工程</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(ProcessByCar).map((key, i) => {
            const {Car, processArrayForCar} = ProcessByCar[key]
            return (
              <Fragment key={key}>
                {processArrayForCar.map((process, j) => {
                  const {ProcessNameMaster} = process
                  return (
                    <Fragment key={j}>
                      <tr>
                        <td>{Car.carName}</td>
                        <td>{Car.bpNumber}</td>
                        <td>
                          <div>{formatDate(process.date, 'YY-MM-DD(ddd)')}</div>
                        </td>
                        <td>{process?.User?.name}</td>
                        <td>{process.time}</td>
                        <td
                          style={{
                            ...getColorStyles(ProcessNameMaster.color),
                          }}
                        >
                          {ProcessNameMaster.name}
                        </td>
                      </tr>
                    </Fragment>
                  )
                })}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default CarBoard
