'use client'

import ProcessViwer from '@app/(apps)/QRBP/components/QRBP/Process/ProcessViwer'
import {columnGetterType} from '@cm/types/types'
import {colType} from '@cm/types/col-types'

import {Fields} from '@cm/class/Fields/Fields'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

export const carListForEngineerCol = (props: columnGetterType) => {
  const colIds: colType[] = [
    {id: 'bpNumber', label: 'BPNo', type: 'text', search: {}, form: {hidden: true}},
    {id: 'carName', label: '車名', search: {}},
    {id: 'customerName', label: `お客様`, search: {}},
    {id: 'plate', label: 'プレート', search: {}},
  ]
  const newData = new Fields([
    ...new Fields([
      {
        id: 'processViwer',
        label: '',
        format: (value, row) => {
          const Info = () => {
            return (
              <R_Stack className={`items-start gap-0 gap-y-0.5`}>
                {colIds.map(d => {
                  const colId = d.id
                  const label = d.label
                  return (
                    <div key={colId} className={`trunca w-1/2  leading-4`}>
                      <small>{label}</small>
                      <div>{row[colId]}</div>
                    </div>
                  )
                })}
              </R_Stack>
            )
          }
          const {subCarsInCurrentCars} = props.ColBuilderExtraProps ?? {}
          return (
            <C_Stack className={`justify-start gap-0.5`}>
              <Info />
              <div className={`mx-auto w-full px-2`}>
                <ProcessViwer {...{car: row, size: 'sm', subCarsInCurrentCars}} />
              </div>
            </C_Stack>
          )
        },
      },
    ]).plain,
    ...new Fields(colIds).customAttributes(({col}) => {
      return {...col, th: {hidden: true}, td: {hidden: true}, form: {}}
    }).plain,
  ])
  const result = newData.transposeColumns()

  return result
}
