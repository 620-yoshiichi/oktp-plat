'use client'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {CircledIcon} from '@cm/components/styles/common-components/IconBtn'
import {TableBordered, TableWrapper} from '@cm/components/styles/common-components/Table'
import {CssString} from '@cm/components/styles/cssString'
import {PlusIcon} from '@heroicons/react/20/solid'
import React, {useState} from 'react'
import {DH__convertDataType} from '@cm/class/DataHandler/type-converter'

type singleRecord = {
  no?: any
  date?: any
  companyName?: any
  carNumber?: any
  name?: any
  phoneNumber?: any
  shipper?: any
  loadUnload?: any
  transportCompany?: any
  entryTime?: any
  entry?: any
  exitTime?: any
  exit?: any
}

const headers = [
  {id: 'no', label: '№', form: {disabled: true}, type: ``},
  {id: 'date', label: '日付', form: {disabled: true}, type: `date`},
  {id: 'companyName', label: '会社名', form: {}, type: ``, required: true},
  {id: 'carNumber', label: '車番', form: {}, type: ``, required: true},
  {id: 'name', label: '氏名', form: {}, type: ``, required: true},
  {id: 'phoneNumber', label: '電話番号', form: {}, type: ``, required: true},
  {id: 'shipper', label: '荷主様', form: {}, type: ``},
  {id: 'loadUnload/卸', label: '積/卸', form: {}, type: ``, required: true},
  {id: 'transportCompany', label: '運送元請会社', form: {}, type: ``},
  {id: 'entryTime', label: '入場時刻', form: {}, type: `datetime`},
  {id: 'entry', label: '入場', form: {}, type: ``},
  {id: 'exitTime', label: '退場時刻', form: {}, type: `datetime`},
  {id: 'exit', label: '退場', form: {}, type: ``},
]

export default function ReceptionCC() {
  const [records, setrecords] = useState([...sampleRecords])
  const [newRecord, setnewRecord] = useState<singleRecord | null>(null)
  const controlStyle: CssString = {
    width: `fit-content`,
    minWidth: 10,
    maxWidth: 150,
    margin: `auto`,
    textAlign: `center`,
  }
  return (
    <div>
      <TableWrapper className={`mx-auto max-h-[80vh] max-w-[90vw]`}>
        <TableBordered>
          <thead>
            {headers.map((h, i) => {
              return <th key={i}>{h.label}</th>
            })}
          </thead>

          <tbody>
            {sampleRecords.map((record, i) => {
              const columns = Object.values(record)
              return (
                <tr key={i}>
                  {headers.map((headerStr, j) => {
                    const value = columns[j]
                    return (
                      <td key={j} style={controlStyle}>
                        {value}
                      </td>
                    )
                  })}
                </tr>
              )
            })}

            {newRecord && (
              <tr>
                {headers.map((col, j) => {
                  const {type, required} = col
                  const value = DH__convertDataType(newRecord[col.id], col.type, `client`)

                  return (
                    <td key={j} style={controlStyle}>
                      <Control {...{newRecord, setnewRecord, id: col.id, type, required, controlStyle}} />
                    </td>
                  )
                })}
              </tr>
            )}
          </tbody>
          <tfoot>
            <div className={`pt-4`}>
              <CircledIcon
                {...{
                  onClick: () =>
                    setnewRecord(prev => {
                      return {
                        no: records.length + 1,
                        date: getMidnight(),
                        entryTime: new Date(),
                      }
                    }),
                  children: <PlusIcon />,
                }}
              />
            </div>
          </tfoot>
        </TableBordered>
      </TableWrapper>
    </div>
  )
}

const Control = ({newRecord, setnewRecord, id, type, required, controlStyle}) => {
  let value = newRecord[id]
  value = DH__convertDataType(value, type, `client`)

  const maxWidth = id === `no` ? 30 : controlStyle.maxWidth - 10

  return (
    <input
      {...{
        required,
        style: {
          height: 50,
          ...controlStyle,
          maxWidth,

          background: `#ffe647`,
        },
        value,
        type,
        onChange: e => setnewRecord({...newRecord, [id]: e.target.value}),
      }}
    />
  )
}

const sampleRecords = [
  {
    no: 1,
    date: '2023-01-01',
    companyName: '会社A',
    carNumber: '1234',
    name: '山田太郎',
    phoneNumber: '090-1234-5678',
    shipper: '荷主A',
    loadUnload: '積',
    transportCompany: '運送会社A',
    entryTime: '08:00',
    entry: '入場',
    exitTime: '10:00',
    exit: '退場',
  },
  {
    no: 2,
    date: '2023-01-02',
    companyName: '会社B',
    carNumber: '5678',
    name: '佐藤花子',
    phoneNumber: '080-8765-4321',
    shipper: '荷主B',
    loadUnload: '卸',
    transportCompany: '運送会社B',
    entryTime: '09:00',
    entry: '入場',
    exitTime: '11:00',
    exit: '退場',
  },
]
