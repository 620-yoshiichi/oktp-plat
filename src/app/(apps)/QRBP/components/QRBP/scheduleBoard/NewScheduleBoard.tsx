'use client'

import {DndContext} from '@dnd-kit/core'

import BoardTable from '@app/(apps)/QRBP/components/QRBP/scheduleBoard/BoardTable/BoardTable'
import useGlobal, {useGlobalPropType} from '@cm/hooks/globalHooks/useGlobal'

import useInitDnD from '@cm/components/DnD/useDnDProps'

import useNewMainBoardProps from '@app/(apps)/QRBP/components/QRBP/scheduleBoard/useNewMainBoardProps'
import PopOverBody from '@app/(apps)/QRBP/components/QRBP/scheduleBoard/PopOverBody'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import {Button} from '@cm/components/styles/common-components/Button'

const NewScheduleBoard = (props: any) => {
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
  } = useNewMainBoardProps(props)

  const useGlobalProps: useGlobalPropType = useGlobal()

  const {DragStartCallback, handleDragEndCallback} = useInitDnD()

  return (
    <div className={`relative`}>
      <div>
        <ShadModal {...{open: carOnModal, onOpenChange: setcarOnModal, useGlobalProps}}>
          <PopOverBody
            {...{
              activeCars,
              car: carOnModal,
              setcarOnModal,
              useGlobalProps,
            }}
          />
        </ShadModal>

        <div className={`row-stack relative   w-full max-w-[95vw] flex-nowrap items-stretch   justify-around`}>
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
              <BoardTable
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
      <div className={`position-x-center fixed right-4 bottom-4 `} onClick={updateScheduleBoard}>
        <Button color="red">確定</Button>
      </div>
    </div>
  )
}

export default NewScheduleBoard
