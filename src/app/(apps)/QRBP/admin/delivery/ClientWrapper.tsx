'use client'
import CarContainer from '@app/(apps)/QRBP/admin/delivery/CarContainer'
import {DELIVERY_CAR_OBJ_TYPE} from '@app/(apps)/QRBP/admin/delivery/getter'
import LoadingVehicles from '@app/(apps)/QRBP/admin/delivery/LoadingVehicles/LoadingVehicles'
import {Delivery} from '@app/(apps)/QRBP/class/Delivery'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

import {Paper} from '@cm/components/styles/common-components/paper'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import {createContext, useCallback, useEffect, useState} from 'react'
import {useGlobalPropType} from '@cm/hooks/globalHooks/useGlobalOrigin'
import {createUpdate} from '@cm/lib/methods/createUpdate'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'

type DeliveryContext = {
  pickedCar?: any
  setpickedCar?: any
  selectedDate?: Date
  allCars?: (any & {DELIVERY_CAR_OBJ_TYPE})[]
  DeliverSchedule?: any
  useGlobalProps?: useGlobalPropType
  allSlots?: any[]
  unDistributeCar?: any
  updateVehicle?: any
  distributeCar?: any
}
export const DeliveryContext = createContext<DeliveryContext>({})
const ClientWrapper = ({CAR_DATA, stores, DeliverSchedule}) => {
  const useGlobalProps = useGlobal()
  const {query, toggleLoad} = useGlobalProps

  const selectedDate = toUtc(query.from)
  const [pickedCar, setpickedCar] = useState(null)
  const [newCarsByDate, setnewCarsByDate] = useState<any>([])
  const [bpCarsByDate, setbpCarsByDate] = useState<any>([])

  useEffect(() => {
    setnewCarsByDate(CAR_DATA.newCar_DATA?.carsByDate)
    setbpCarsByDate(CAR_DATA.bpCar_DATA?.carsByDate)
  }, [JSON.stringify(CAR_DATA)])

  const allCars: DELIVERY_CAR_OBJ_TYPE[] = [...CAR_DATA.newCar_DATA?.cars, ...CAR_DATA.bpCar_DATA?.cars]

  const unDistributeCar = useCallback(
    async Slot => {
      await toggleLoad(async () => {
        await doStandardPrisma('slot', 'update', {
          where: {id: Slot.id},
          data: {carId: null, newCarId: null},
        })
        setpickedCar(null)
      })
    },
    [pickedCar]
  )
  const distributeCar = useCallback(async ({pickedCar, slot}) => {
    const updatePayload = Delivery.Slot.getSlotUpdatePayload({
      theCar: pickedCar,
    })
    if (pickedCar.Slot.length > 0) return alert('すでに配車されています')

    toggleLoad(async () => {
      await doStandardPrisma('slot', 'update', {
        where: {id: slot.id},
        data: updatePayload,
      })
      setpickedCar(null)
    })
  }, [])

  const updateVehicle = useCallback(async ({Vehicle}) => {
    const {areaId} = Vehicle
    toggleLoad(async () => {
      const res = await doStandardPrisma('loadingVehicle', 'upsert', {
        where: {id: Vehicle.id},
        ...createUpdate({areaId}),
      })

      toastByResult(res)
    })
  }, [])
  const allSlots = DeliverSchedule?.LoadingVehicle?.map(v => v.Slot.flat()).flat()
  const ctxValue: DeliveryContext = {
    allSlots,
    allCars,
    pickedCar,
    setpickedCar,
    selectedDate,
    DeliverSchedule,
    useGlobalProps,
    unDistributeCar,
    updateVehicle,
    distributeCar,
  }

  return (
    <DeliveryContext.Provider value={ctxValue}>
      <R_Stack className={`flex-nowrap  items-start`}>
        <Paper>
          <CarContainer {...{carsByDate: newCarsByDate, NBC_TYPE: 'newCar', stores}} />
          <CarContainer {...{carsByDate: bpCarsByDate, NBC_TYPE: 'bpCar', stores}} />
        </Paper>
        <Paper className={`w-[400px]`}>
          <LoadingVehicles />
        </Paper>
      </R_Stack>
    </DeliveryContext.Provider>
  )
}

export default ClientWrapper
