import {actionStatusMaster, checkPoint} from '@app/(apps)/newCar/(constants)/checkpoints/checkpoints'

import {Fields} from '@cm/class/Fields/Fields'
import {UseRecordsReturn} from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'

import {Alert} from '@cm/components/styles/common-components/Alert'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {Paper} from '@cm/components/styles/common-components/paper'
import {LabelValue} from '@cm/components/styles/common-components/ParameterCard'
import MyPopover from '@cm/components/utils/popover/MyPopover'
import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'
import {cl} from '@cm/lib/methods/common'

import React from 'react'
import {ChatBubbleBottomCenterTextIcon} from '@heroicons/react/20/solid'
import {QueryBuilder} from '@app/(apps)/newCar/class/QueryBuilder'

import {atomTypes} from '@cm/hooks/useJotai'
import {useGlobalModalForm} from '@cm/components/utils/modal/useGlobalModalForm'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'

export const CheckPoint = (props: {newCar; cp: checkPoint; HK_USE_RECORDS: UseRecordsReturn}) => {
  const checkPointModalGMF = useGlobalModalForm<atomTypes[`checkPointModalGMF`]>(`checkPointModalGMF`, null, {})
  const {newCar} = props
  const cp = props.cp as checkPoint

  // const [open, setopen] = useState<any>(null)

  const Btn = () => {
    const statusLabel = newCar[cp.alertKey]

    const {color} = actionStatusMaster.find(d => d.label === statusLabel) ?? {}
    const remarks = cp.getRemarks?.({newCar}) as any[]

    const styling = {
      classes: {wrapper: `w-full   items-start`, label: `w-[120px]`, value: `w-[350px]`},
    }

    const required = actionStatusMaster.find(d => d.label === statusLabel && d.required === true)

    const PopOverBtn = () => {
      const onClick = () =>
        checkPointModalGMF.setGMF_OPEN({
          cp,
          newCar,
          UseRecordsReturn: props.HK_USE_RECORDS,
        })

      return (
        <div>
          <R_Stack className={`gap-0.5`}>
            <small className={`  w-[55px]`}>{cp.label}</small>
            <R_Stack>
              <IconBtn
                {...{
                  // vivid={false}
                  color,
                  onClick,

                  className: cl(required ? '' : 'opacity-25', ` py-0  rounded !px-0.5 text-sm w-[85px]`),
                }}
              >
                <center>{statusLabel}</center>
              </IconBtn>
              <section>
                {remarks?.length > 0 && (
                  <MyPopover {...{button: <ChatBubbleBottomCenterTextIcon className={`h-5 `} />}}>
                    <Paper>
                      {remarks?.map((string, i) => {
                        return <div key={i}>{string}</div>
                      })}
                    </Paper>
                  </MyPopover>
                )}
              </section>
            </R_Stack>
          </R_Stack>
        </div>
      )
    }

    const PopOverContent = () => {
      return (
        <Alert className={`p-1`}>
          <C_Stack>
            <LabelValue
              {...{
                styling,
                label: `必要アクション`,
                value: (
                  <div>
                    <strong>{cp.actionName}</strong>
                  </div>
                ),
              }}
            />
            <LabelValue {...{styling, label: `点灯条件`, value: cp.conditions.alert}} />

            <LabelValue
              {...{
                styling,
                label: `消滅条件`,
                value: cp.conditions.complete,
              }}
            />
          </C_Stack>
        </Alert>
      )
    }

    return (
      <R_Stack className={`gap-1 border-b border-dashed py-1 `}>
        <MyPopover {...{button: <PopOverBtn />}}>
          <PopOverContent />
        </MyPopover>
      </R_Stack>
    )
  }

  return (
    <>
      <Btn />
    </>
  )
}

export const CkecnPointForm = ({cp, newCar, setopen, HK_USE_RECORDS}) => {
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
      data: {...payload, ...initialInputPayload},
    })

    toastByResult(res)
    setopen(null)
    // const {result} = await updateActionStatusByCar({newCar: res.result})

    const {result: latestRecord} = await doStandardPrisma(`newCar`, `findUnique`, {
      where: {id: newCar.id},
      include: QueryBuilder.getInclude({}).newCar.include,
    })

    HK_USE_RECORDS?.mutateRecords({record: latestRecord})
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
          alignMode="col"
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
