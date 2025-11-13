'use client'
import React, {useState} from 'react'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {LabelValue} from '@cm/components/styles/common-components/ParameterCard'
import {CssString} from '@cm/components/styles/cssString'
import {cl, superTrim} from '@cm/lib/methods/common'
import {Number98} from '@prisma/client'

import {NestHandler} from '@cm/class/NestHandler'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import Number98HistoryChecker from '@app/(apps)/ucar/(pages)/98list/Number98HistoryChecker'
import {Paper} from '@cm/components/styles/common-components/paper'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'

export default function Number98ListCC({next98, used98Numbers, available98Numbers}) {
  const [selectedNumber98, setSelectedNumber98] = useState<Number98 | null>(null)

  return (
    <div className={`p-4`}>
      <ShadModal open={!!selectedNumber98} onOpenChange={setSelectedNumber98}>
        {selectedNumber98 && <Number98HistoryChecker {...{number98: selectedNumber98}} />}
      </ShadModal>
      <LabelValue {...{label: `next 98`, value: next98}} />
      <R_Stack className={`  items-start justify-center gap-10`}>
        <Paper>
          <strong>使用中</strong>
          {CsvTable({
            records: [
              ...used98Numbers
                .sort((a, b) => {
                  return b.Ucar.length - a.Ucar.length
                })
                .map(d => {
                  return {
                    csvTableRow: [
                      {
                        label: '98番号',
                        cellValue: (
                          <button onClick={() => setSelectedNumber98(d)}>
                            <R_Stack className={` w-[150px] justify-between`}>
                              <span>{d.number}</span>
                              <small>({d.Ucar.length})</small>
                            </R_Stack>
                          </button>
                        ),
                      },
                    ],
                  }
                }),
            ],
          }).WithWrapper({className: `max-h-[70vh]`})}
        </Paper>

        <Paper>
          <strong>利用可能</strong>
          {CsvTable({
            records: [
              ...available98Numbers
                .sort((a, b) => {
                  return b.Ucar.length - a.Ucar.length
                })
                .map(d => {
                  return {
                    csvTableRow: [
                      {
                        label: '98番号',
                        cellValue: (
                          <button onClick={() => setSelectedNumber98(d)}>
                            <R_Stack className={` w-[150px] justify-between`}>
                              <span>{d.number}</span>
                              <small>({d.Ucar.length})</small>
                            </R_Stack>
                          </button>
                        ),
                      },
                    ],
                  }
                }),
            ],
          }).WithWrapper({className: `max-h-[70vh]`})}
        </Paper>
      </R_Stack>
    </div>
  )
}

const Table = (props: {label; cols; ucars; next98; available98Numbers?: any}) => {
  const {label, cols, ucars, next98, available98Numbers = null} = props
  if (available98Numbers) {
    return (
      <div>
        <R_Stack>
          <strong>{label}</strong>
          <strong>{ucars.length}台</strong>
        </R_Stack>
        <div className={`table-wrapper max-h-[80vh] w-fit`}>
          <table className={cl(CssString.table.borderCerlls)}>
            <thead>
              <tr>
                <th>使用中</th>
              </tr>
            </thead>
            <tbody>
              {available98Numbers.map((d, i) => {
                return (
                  <tr key={i}>
                    <td>{d.number}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  return (
    <div>
      <R_Stack>
        <strong>{label}</strong>
        <strong>{ucars.length}台</strong>
      </R_Stack>
      <div className={`table-wrapper max-h-[80vh] w-fit`}>
        <table className={cl(CssString.table.borderCerlls)}>
          <thead>
            <tr>
              <th>使用中</th>
              {cols.map((col, i) => {
                return <th key={i}>{col.label}</th>
              })}
            </tr>
          </thead>
          <tbody>
            {ucars.map((ucar, i) => {
              const isNext = Number(superTrim(ucar.Number98.number)) === Number(superTrim(next98))
              const gteNext = Number(superTrim(ucar.Number98.number)) > Number(superTrim(next98))
              let rowColor = ``
              if (ucar.KI_HANKAKA) {
                rowColor = `bg-gray-200`
              } else if (isNext) {
                rowColor = `bg-primary-main`
              } else if (gteNext) {
                rowColor = `bg-yellow-100`
              }

              return (
                <tr key={i} className={rowColor}>
                  <td>{ucar.KI_HANKAKA ? '販売済' : ''}</td>
                  {cols.map((col, j) => {
                    const displayValue = NestHandler.GetNestedValue(col.id, ucar)
                    return (
                      <td className={`!max-w-[100px] truncate`} key={j}>
                        {displayValue}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
