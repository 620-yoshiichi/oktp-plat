'use client'
import {useState, useEffect} from 'react'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {anyObject} from '@cm/types/utility-types'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {eachDayOfInterval} from 'date-fns'
import {toast} from 'react-toastify'

import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'
import {DragEndEvent} from '@dnd-kit/core'

import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

const useEngineerBoardProps = props => {
  const {targetCars, damageNameMaster, query} = props
  const {toggleLoad} = useGlobal()

  const [lastTouchedCarId, setlastTouchedCarId] = useState<any>(null)
  const selectedCar: any = {}
  const days = eachDayOfInterval({
    start: toUtc(query.from),
    end: toUtc(query.to),
  })

  const Damages = damageNameMaster?.map(damage => {
    return {
      id: damage?.id,
      name: damage?.name,
      color: damage?.color,
    }
  })

  const [carsOnBoard, setcarsOnBoard] = useState<any[]>(targetCars)

  const [pickedCar, setpickedCar] = useState<any>(null)
  useEffect(() => {
    const data = document.getElementById(selectedCar?.id)
    if (data) {
      setpickedCar(data)
    }
  }, [selectedCar])

  const activeCars = carsOnBoard.filter(car => car.engineerScheduledAt)
  const floatingCars = carsOnBoard.filter(car => !car.engineerScheduledAt)

  const targetDays = [...days]

  const handleDragEnd: (event: DragEndEvent) => void = (event: anyObject) => {
    const {active, over} = event

    const overId = over?.id
    const activeId = active.id

    if (activeId && overId) {
      const picked = {
        id: Number(activeId.split('_')[0]),
        damageNameMasterId: Number(activeId.split('_')[1]),
        engineerScheduledAt: activeId.split('_')[2],
      }

      setlastTouchedCarId(picked.id)

      const current = {
        id: undefined,
        damageNameMasterId: Number(over?.id?.split('_')[0]),
        engineerScheduledAt: over?.id?.split('_')[1],
      }

      setcarsOnBoard((prev: any[]) => {
        const newCars: anyObject[] = [...prev]
        const carIndex = newCars.findIndex((c: anyObject) => c.id === picked.id)
        if (carIndex === -1) {
          newCars.push({
            ...selectedCar,
            damageNameMasterId: current.damageNameMasterId,
            engineerScheduledAt: current.engineerScheduledAt,
            moved: true,
          })
        } else {
          newCars[carIndex]['damageNameMasterId'] = current.damageNameMasterId
          newCars[carIndex]['engineerScheduledAt'] =
            current.engineerScheduledAt == 'unscheduled' ? null : current.engineerScheduledAt
          newCars[carIndex]['moved'] = true
        }

        return newCars
      })
    }
  }

  /**更新関数: engineerScheduledAt のみ更新（crScheduledAt, scheduledAt は変更しない） */
  const updateScheduleBoard = async () => {
    await toggleLoad(async () => {
      const targetCarList = carsOnBoard.filter(car => car.moved === true)
      const transactionQueryList: transactionQuery<'car', 'update'>[] = targetCarList.map((car: anyObject) => {
        return {
          model: 'car',
          method: 'update',
          queryObject: {
            where: {id: car?.id},
            data: {
              engineerScheduledAt: car?.engineerScheduledAt ? formatDate(car?.engineerScheduledAt, 'iso') : null,
            },
          },
        }
      })
      const res = await doTransaction({transactionQueryList})
      return res
    })
    toast.success('エンジニアスケジュールを更新しました')
  }

  const cars_groupedBy_Damage_Date: anyObject = create_cars_groupedBy_Damage_Date_Engineer({
    carsOnBoard,
  })

  const [carOnModal, setcarOnModal] = useState(false)

  const result = {
    cars_groupedBy_Damage_Date,
    Damages,
    targetDays,
    pickedCar,

    handleDragEnd,
    updateScheduleBoard,
    carsOnBoard,
    activeCars,
    floatingCars,
    setcarsOnBoard,

    selectedCar,
    carOnModal,
    setcarOnModal,

    lastTouchedCarId,
    setlastTouchedCarId,
  }

  return result
}

export default useEngineerBoardProps

export const create_cars_groupedBy_Damage_Date_Engineer = (props: anyObject) => {
  const {carsOnBoard} = props
  const cars_groupedBy_Damage_Date: anyObject = {}
  carsOnBoard?.forEach(car => {
    const damageNameMasterId = car?.damageNameMasterId
    obj__initializeProperty(cars_groupedBy_Damage_Date, damageNameMasterId, {})
    const engineerScheduledAt = car.engineerScheduledAt ? formatDate(car.engineerScheduledAt) : 'unscheduled'
    obj__initializeProperty(cars_groupedBy_Damage_Date[damageNameMasterId], engineerScheduledAt, [])
    cars_groupedBy_Damage_Date[damageNameMasterId][engineerScheduledAt].push(car)
  })
  return cars_groupedBy_Damage_Date
}
