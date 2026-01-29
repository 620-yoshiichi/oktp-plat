import { actionStatusMaster, checkPoint } from '@app/(apps)/newCar/(constants)/checkpoints/checkpoints'

import { UseRecordsReturn } from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'

import { Alert } from '@cm/components/styles/common-components/Alert'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { Paper } from '@cm/components/styles/common-components/paper'
import { LabelValue } from '@cm/components/styles/common-components/ParameterCard'
import MyPopover from '@cm/components/utils/popover/MyPopover'

import { cl } from '@cm/lib/methods/common'

import React from 'react'
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/20/solid'

import { IconBtn } from '@cm/components/styles/common-components/IconBtn'
import useCheckPointGMF from '@app/(apps)/newCar/templateHooks/useCheckPointGMF'

export const CheckPoint = (props: { newCar; cp: checkPoint; UseRecordsReturn: UseRecordsReturn }) => {
  const checkPointModalGMF = useCheckPointGMF()
  const { newCar } = props
  const cp = props.cp as checkPoint

  // const [open, setopen] = useState<any>(null)

  const Btn = () => {
    const statusLabel = newCar[cp.alertKey]

    const { color } = actionStatusMaster.find(d => d.label === statusLabel) ?? {}
    const remarks = cp.getRemarks?.({ newCar }) as any[]

    const styling = {
      classes: { wrapper: `w-full   items-start`, label: `w-[120px]`, value: `w-[350px]` },
    }

    const required = actionStatusMaster.find(d => d.label === statusLabel && d.required === true)

    const PopOverBtn = () => {
      const onClick = () =>
        checkPointModalGMF.setGMF_OPEN({
          cp,
          newCar,
          UseRecordsReturn: props.UseRecordsReturn,
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
                  <MyPopover {...{ button: <ChatBubbleBottomCenterTextIcon className={`h-5 `} /> }}>
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
            <LabelValue {...{ styling, label: `点灯条件`, value: cp.conditions.alert }} />

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
        <MyPopover {...{ button: <PopOverBtn /> }}>
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
