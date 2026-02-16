'use client'

import {DndContext} from '@dnd-kit/core'

import EngineerBoardTable from '@app/(apps)/QRBP/components/QRBP/scheduleBoard/BoardTable/EngineerBoardTable'
import useGlobal, {useGlobalPropType} from '@cm/hooks/globalHooks/useGlobal'

import useInitDnD from '@cm/components/DnD/useDnDProps'

import useEngineerBoardProps from '@app/(apps)/QRBP/components/QRBP/scheduleBoard/useEngineerBoardProps'
import EngineerPopOverBody from '@app/(apps)/QRBP/components/QRBP/scheduleBoard/EngineerPopOverBody'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import {Button} from '@cm/components/styles/common-components/Button'

const EngineerScheduleBoard = (props: any) => {
  const {
    activeCars,
    targetDays,
    Damages,
    cars_groupedBy_Damage_Date,
    handleDragEnd,
    updateScheduleBoard,
    carOnModal,
    setcarOnModal,
    lastTouchedCarId,
    setlastTouchedCarId,
  } = useEngineerBoardProps(props)

  const useGlobalProps: useGlobalPropType = useGlobal()

  const {DragStartCallback, handleDragEndCallback} = useInitDnD()

  return (
    <div className={`relative`}>
      <div>
        <ShadModal {...{open: carOnModal, onOpenChange: setcarOnModal, useGlobalProps}}>
          <EngineerPopOverBody
            {...{
              activeCars,
              car: carOnModal,
              setcarOnModal,
              useGlobalProps,
            }}
          />
        </ShadModal>

        <div className={`row-stack relative w-full max-w-[95vw] flex-nowrap items-stretch justify-around`}>
          <div className={`t-paper relative w-full p-1`}>
            <DndContext
              {...{
                onDragStart: e => {
                  DragStartCallback(e)
                },
                onDragEnd: e =>
                  handleDragEndCallback(e, {
                    cb: handleDragEnd,
                    onClick: (event, DraggableItemPayload) => {
                      setcarOnModal(DraggableItemPayload)
                    },
                  }),
              }}
            >
              <EngineerBoardTable
                {...{
                  activeCars,
                  targetDays,
                  Damages,
                  cars_groupedBy_Damage_Date,
                  useGlobalProps,
                  setcarOnModal,
                  lastTouchedCarId,
                  setlastTouchedCarId,
                }}
              />
            </DndContext>
          </div>
        </div>
      </div>
      <div className={`position-x-center fixed right-4 bottom-4`} onClick={updateScheduleBoard}>
        <Button color="red">確定</Button>
      </div>
    </div>
  )
}

export default EngineerScheduleBoard
