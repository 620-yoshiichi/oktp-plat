'use client'
import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'
import {getColorStyles} from '@cm/lib/methods/colors'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'

import React from 'react'

export default function ProcessNameSelector({col, ReactHookForm, field}) {
  const {register, formState, handleSubmit, watch, setValue} = ReactHookForm
  const currentValue = Number(watch(col?.id))

  const {data} = useDoStandardPrisma(
    'processNameMaster',
    'findMany',
    {
      where: {
        onEnginerProcess: true,
        name: {not: '作業完了'},
      },
    },
    {deps: []}
  )
  const processes = data ?? []

  const FILTERED_CHOICES_FOR_PROCESS_BY_GROUP = {}
  processes.forEach(pNameMaster => {
    obj__initializeProperty(FILTERED_CHOICES_FOR_PROCESS_BY_GROUP, pNameMaster.type, [])
    FILTERED_CHOICES_FOR_PROCESS_BY_GROUP[pNameMaster.type].push(pNameMaster)
  })

  const currentDisplayValue = processes.find(pNameMaster => {
    return pNameMaster.id === currentValue
  })?.name

  return (
    <div>
      {/* <Label {...{...OPTIONS, col, ReactHookForm, Register}} /> */}
      <input type="hidden" {...register} defaultValue={currentDisplayValue} />
      {/* <p className={`text-error-main`}>{formState.errors?.['processNameMasterId']?.message}</p> */}
      <div className={` row-stack  items-start justify-around  gap-1 `}>
        {Object.keys(FILTERED_CHOICES_FOR_PROCESS_BY_GROUP).map((groupColor, i) => {
          const processNameMasters = FILTERED_CHOICES_FOR_PROCESS_BY_GROUP[groupColor]
          return (
            <div key={i} className={`col-stack  `}>
              {processNameMasters.map((pNameMaster, i) => {
                const {color} = pNameMaster

                return (
                  <button
                    onClick={e => {
                      setValue(col?.id, pNameMaster?.id)
                      field.onBlur()
                    }}
                    type="button"
                    key={i}
                    className={`
                                 ${currentValue === pNameMaster.id ? '' : 'opacity-20'}
                                  w-full rounded p-1 text-center text-xs`}
                    style={{...getColorStyles(color)}}
                  >
                    {pNameMaster.name}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
