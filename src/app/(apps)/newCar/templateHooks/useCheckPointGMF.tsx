import {checkPoint} from '@app/(apps)/newCar/(constants)/checkpoints/checkpoints'

import {Fields} from '@cm/class/Fields/Fields'

import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'

import React from 'react'
import {QueryBuilder} from '@app/(apps)/newCar/class/QueryBuilder'

import {atomTypes} from '@cm/hooks/useJotai'
import {useGlobalModalForm} from '@cm/components/utils/modal/useGlobalModalForm'

export default function useCheckPointGMF() {
  const checkPointModalGMF = useGlobalModalForm<atomTypes[`checkPointModalGMF`]>(`checkPointModalGMF`, null, {
    mainJsx: props => {
      const {cp, newCar, UseRecordsReturn} = props?.GMF_OPEN
      return (
        <CkecnPointForm
          {...{
            cp,
            newCar,
            UseRecordsReturn,
            setopen: props.setGMF_OPEN,
          }}
        />
      )
    },
  })

  return checkPointModalGMF
}

export const CkecnPointForm = ({cp, newCar, setopen, UseRecordsReturn}) => {
  const {label, actionName, description, getColumns} = cp as checkPoint

  const columns = new Fields(getColumns({newCar})).transposeColumns()

  const currentValue = Object.fromEntries(columns.flat().map(d => [d.id, newCar[d.id]]))

  const {BasicForm, latestFormData} = useBasicFormProps({columns, formData: currentValue})

  const onSubmit = async data => {
    const initialInputKeys = Object.keys(newCar).filter(d => d.includes(`initial_`))

    const initialInputPayload = Object.fromEntries(
      initialInputKeys.map(k => {
        //すでにデータがあればそれを使う。なければ、入力項目
        const value = newCar[k] ?? data[String(k).replace(`initial_`, ``)]
        return [k, value]
      })
    )

    const payload = Object.fromEntries(Object.keys(data).map(k => [k, data[k]]))

    const res = await doStandardPrisma(`newCar`, `update`, {
      where: {id: newCar.id},
      data: {
        ...payload,
        ...initialInputPayload,
      },
    })

    toastByResult(res)
    setopen(null)
    // const {result} = await updateActionStatusByCar({newCar: res.result})

    const {result: latestRecord} = await doStandardPrisma(`newCar`, `findUnique`, {
      where: {id: newCar.id},
      include: QueryBuilder.getInclude({}).newCar.include,
    })

    UseRecordsReturn?.mutateRecords({record: latestRecord})
  }

  const width = 700
  return (
    <C_Stack className={`gap-1`} style={{width: width}}>
      <R_Stack>
        <div>{label}</div>
        <span className={`font-bold`}>{actionName}</span>
      </R_Stack>

      <div className={`text-error-main  `}>
        <MarkDownDisplay>{description}</MarkDownDisplay>
      </div>

      <div className={` mx-auto  w-fit`}>
        <BasicForm
          latestFormData={latestFormData}
          onSubmit={onSubmit}
          {...{
            ControlOptions: {ControlStyle: {width: 500}},
          }}
        >
          <Button>報告</Button>
        </BasicForm>
      </div>
    </C_Stack>
  )
}
