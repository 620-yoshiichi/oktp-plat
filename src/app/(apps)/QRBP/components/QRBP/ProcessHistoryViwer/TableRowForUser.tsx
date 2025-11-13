'use client'
import React, {Fragment} from 'react'

import {useState} from 'react'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

const TableRowForUser = ({User, processArrayForUser, processMaster}) => {
  const [showDetails, setshowDetails] = useState(false)

  const colSpan = 2
  return (
    <Fragment>
      <tr className={`${showDetails ? 'border-t-4 border-black ' : ''}`}>
        <td className={` ${showDetails ? ' bg-sub-main text-white' : ''}`}>
          <button
            onClick={() => {
              setshowDetails(prev => !prev)
            }}
          >
            {User?.name}
          </button>
        </td>
        {processMaster.map(data => {
          const processByType = processArrayForUser?.filter(p => p.processNameMasterId === data.id)
          const processCount = processByType.length
          const processTime = processByType.reduce((acc, cur) => {
            return acc + cur.time
          }, 0)

          return (
            <Fragment key={data.id}>
              <td>{processCount}</td>
              <td> {Math.round(processTime * 10) / 10}</td>
            </Fragment>
          )
        })}
      </tr>
      {showDetails && (
        <Fragment>
          {processArrayForUser.map((p, i) => {
            return (
              <tr key={i} className={`${showDetails && i === processArrayForUser.length - 1 ? 'border-b-4 border-black' : ''}`}>
                {i === 0 && (
                  <th rowSpan={processArrayForUser.length} className={` ${showDetails ? ' bg-sub-main text-white' : ''}`}>
                    工程詳細
                  </th>
                )}
                <td colSpan={colSpan}>{p.Car.carName}</td>
                <td colSpan={colSpan}>{p.ProcessNameMaster.name}</td>
                <td colSpan={colSpan}>{p.time}</td>
                <td colSpan={colSpan}>{formatDate(p.createdAt)}</td>
              </tr>
            )
          })}
        </Fragment>
      )}
    </Fragment>
  )
}

export default TableRowForUser
