'use client'

import { DndContext } from '@dnd-kit/core'

import BoardTable from '@app/(apps)/QRBP/components/QRBP/scheduleBoard/BoardTable/BoardTable'
import useGlobal, { useGlobalPropType } from '@cm/hooks/globalHooks/useGlobal'

import useInitDnD from '@cm/components/DnD/useDnDProps'

import useNewMainBoardProps from '@app/(apps)/QRBP/components/QRBP/scheduleBoard/useNewMainBoardProps'
import PopOverBody from '@app/(apps)/QRBP/components/QRBP/scheduleBoard/PopOverBody'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import { Button } from '@cm/components/styles/common-components/Button'

const NewScheduleBoard = (props: any) => {
  const {
    activeCars,
    carsOnBoard,
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
  const { DragStartCallback, handleDragEndCallback } = useInitDnD()

  const movedCount = (carsOnBoard ?? []).filter((c: any) => c.moved).length

  return (
    <div className={`relative`}>
      <ShadModal {...{ open: carOnModal, onOpenChange: setcarOnModal, useGlobalProps }}>
        <PopOverBody
          {...{
            activeCars,
            car: carOnModal,
            setcarOnModal,
            useGlobalProps,
          }}
        />
      </ShadModal>

      <div className={`relative `}>
        <div className={`rounded-lg bg-white shadow-sm`}>
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

      <div className={`fixed right-5 bottom-5 z-50`}>
        <button
          onClick={updateScheduleBoard}
          disabled={movedCount === 0}
          className={`
            flex items-center gap-2 rounded-full px-5 py-2.5
            text-sm font-medium text-white shadow-lg
            transition-all hover:shadow-xl
            ${movedCount > 0 ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}
          `}
        >
          変更を保存
          {movedCount > 0 && (
            <span className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-xs`}>
              {movedCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export default NewScheduleBoard
