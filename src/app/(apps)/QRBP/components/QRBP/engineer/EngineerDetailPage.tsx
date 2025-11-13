import {NoData} from '@cm/components/styles/common-components/common-components'
import {Fragment} from 'react'

import {getColorStyles} from '@cm/lib/methods/colors'

import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

export default function EngineerDetailPage({formData: Engineer}) {
  const {Process} = Engineer
  const getProcessByDate = () => {
    const ProcessByDate = {}
    Process?.map(p => {
      let {date} = p

      date = formatDate(date, 'MM-DD(ddd)')
      obj__initializeProperty(ProcessByDate, date, {list: []})
      ProcessByDate[date]['list'].push(p)
    })
    return ProcessByDate
  }

  const ProcessByDate = getProcessByDate()

  const TableByDate = () => {
    return (
      <div className={` space-y-4`}>
        <section className={`PROCESS_LIST p-1  shadow`}>
          {Process?.length === 0 ? (
            <NoData />
          ) : (
            <div className={`table-wrapper `}>
              <table>
                <tbody>
                  {Object.keys(ProcessByDate).map(date => {
                    const {list} = ProcessByDate[date]
                    return (
                      <Fragment key={date}>
                        <tr>
                          <th rowSpan={list.length + 1} className={`w-fit  border-2`}>
                            {date}
                          </th>
                        </tr>
                        {list.map(p => {
                          const {id, createdAt, Car} = p

                          return (
                            <tr key={id}>
                              <td>{Car.bpNumber}</td>
                              <td>
                                <div>
                                  <div>{Car?.carName}</div>
                                  <div>{Car?.plate}</div>
                                  <div>{Car?.customerName}</div>
                                </div>
                              </td>
                              <td
                                className={`text-center  `}
                                style={{
                                  ...getColorStyles(p?.ProcessNameMaster?.color),
                                }}
                              >
                                <div>{p?.ProcessNameMaster?.name}</div>
                              </td>
                              <td>
                                <div>{p?.time}時間</div>
                              </td>
                            </tr>
                          )
                        })}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    )
  }

  return (
    <div>
      <h2>{Engineer.name}</h2>
      <TableByDate />
    </div>
  )
}
