'use client'
import { useState, useMemo, useTransition, useCallback } from 'react'
import { toUtc } from '@cm/class/Days/date-utils/calculations'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

import { anyObject } from '@cm/types/utility-types'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { eachDayOfInterval } from 'date-fns'
import { toast } from 'react-toastify'

import { obj__initializeProperty } from '@cm/class/ObjHandler/transformers'
import { DragEndEvent } from '@dnd-kit/core'

import { saveScheduleBoard, saveEngineerScheduleBoard } from './scheduleBoardActions'
import type { ScheduleBoardMode } from './scheduleBoardActions'

type PendingMove = {
  damageNameMasterId: number
  dateValue: string | null
}

const useScheduleBoardProps = (props: any, mode: ScheduleBoardMode) => {
  const { targetCars, damageNameMaster, query } = props
  const { router } = useGlobal()

  const [lastTouchedCarId, setlastTouchedCarId] = useState<any>(null)
  const [pendingMoves, setPendingMoves] = useState<Map<number, PendingMove>>(new Map())
  const [isPending, startTransition] = useTransition()

  const days = eachDayOfInterval({
    start: toUtc(query.from),
    end: toUtc(query.to),
  })

  const Damages = damageNameMaster?.map(damage => ({
    id: damage?.id,
    name: damage?.name,
    color: damage?.color,
  }))

  const dateField = mode === 'cr' ? 'crScheduledAt' : 'engineerScheduledAt'

  // mode に応じた effective date を取得する関数
  const getEffectiveDate = useCallback(
    (car: any) => {
      if (mode === 'cr') return car.crScheduledAt
      return car.engineerScheduledAt ?? car.crScheduledAt
    },
    [mode]
  )

  // targetCars (server props) + pendingMoves (local changes) をマージして表示用データを生成
  const displayedCars = useMemo(() => {
    return (targetCars ?? []).map(car => {
      const pending = pendingMoves.get(car.id)
      if (pending) {
        return {
          ...car,
          damageNameMasterId: pending.damageNameMasterId,
          [dateField]: pending.dateValue,
          moved: true,
        }
      }
      return car
    })
  }, [targetCars, pendingMoves, dateField])

  const activeCars = useMemo(() => {
    return displayedCars.filter(car => {
      if (mode === 'cr') return car.crScheduledAt
      return car.engineerScheduledAt || car.crScheduledAt
    })
  }, [displayedCars, mode])

  const targetDays = [...days]

  const movedCount = pendingMoves.size

  // ドラッグ後の挙動
  const handleDragEnd: (event: DragEndEvent) => void = useCallback(
    (event: anyObject) => {
      const { active, over } = event
      const overId = over?.id
      const activeId = active.id

      if (activeId && overId) {
        const carId = Number(String(activeId).split('_')[0])
        const newDamageNameMasterId = Number(String(overId).split('_')[0])
        const newDateValue = String(overId).split('_')[1]

        setlastTouchedCarId(carId)

        setPendingMoves(prev => {
          const next = new Map(prev)
          next.set(carId, {
            damageNameMasterId: newDamageNameMasterId,
            dateValue: newDateValue === 'unscheduled' ? null : newDateValue,
          })
          return next
        })
      }
    },
    []
  )

  /** 更新関数: Server Action で一括保存 + revalidation */
  const updateScheduleBoard = useCallback(() => {
    startTransition(async () => {
      let result

      if (mode === 'cr') {
        const changes = Array.from(pendingMoves.entries()).map(([id, move]) => ({
          id,
          damageNameMasterId: move.damageNameMasterId,
          crScheduledAt: move.dateValue,
        }))
        result = await saveScheduleBoard(changes)
      } else {
        const changes = Array.from(pendingMoves.entries()).map(([id, move]) => ({
          id,
          engineerScheduledAt: move.dateValue,
        }))
        result = await saveEngineerScheduleBoard(changes)
      }

      if (result.success) {
        setPendingMoves(new Map())
        router.refresh()
        toast.success(mode === 'cr' ? 'スケジュールを更新しました' : 'エンジニアスケジュールを更新しました')
      } else {
        toast.error(`保存に失敗しました: ${result.message}`)
      }
    })
  }, [pendingMoves, router, startTransition, mode])

  const cars_groupedBy_Damage_Date: anyObject = useMemo(
    () =>
      groupCarsByDamageAndDate({
        carsOnBoard: displayedCars,
        getEffectiveDate,
      }),
    [displayedCars, getEffectiveDate]
  )

  const [carOnModal, setcarOnModal] = useState(false)

  return {
    cars_groupedBy_Damage_Date,
    Damages,
    targetDays,
    mode,

    handleDragEnd,
    updateScheduleBoard,
    activeCars,
    movedCount,
    isPending,

    carOnModal,
    setcarOnModal,

    lastTouchedCarId,
    setlastTouchedCarId,
  }
}

export default useScheduleBoardProps

/** 車両をダメージ区分 × 日付でグルーピングする汎用関数 */
export const groupCarsByDamageAndDate = (props: { carsOnBoard: any[]; getEffectiveDate: (car: any) => any }) => {
  const { carsOnBoard, getEffectiveDate } = props
  const grouped: anyObject = {}
  carsOnBoard?.forEach(car => {
    const damageNameMasterId = car?.damageNameMasterId
    obj__initializeProperty(grouped, damageNameMasterId, {})
    const effectiveDate = getEffectiveDate(car)
    const dateKey = effectiveDate ? formatDate(effectiveDate) : 'unscheduled'
    obj__initializeProperty(grouped[damageNameMasterId], dateKey, [])
    grouped[damageNameMasterId][dateKey].push(car)
  })
  return grouped
}
