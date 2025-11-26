'use client'
import {DeliveryContext} from '@app/(apps)/QRBP/admin/delivery/ClientWrapper'
import SingleVehicle from '@app/(apps)/QRBP/admin/delivery/LoadingVehicles/SingleVehicle'

import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'

import {PlusIcon} from '@heroicons/react/20/solid'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import {useContext} from 'react'
import {Alert} from '@cm/components/styles/common-components/Alert'
import {Button} from '@cm/components/styles/common-components/Button'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {createUpdate} from '@cm/lib/methods/createUpdate'

const LoadingVehicles = () => {
  const {query, toggleLoad} = useGlobal()
  const {DeliverSchedule, selectedDate, pickedCar, setpickedCar} = useContext(DeliveryContext)

  const LoadingVehicle = DeliverSchedule?.LoadingVehicle ?? []

  if (!LoadingVehicle) return null
  const initLoadingVehicles = async () => {
    toggleLoad(async () => {
      const makeLoadingVehilceQuery: transactionQuery<'loadingVehicle', 'create'>[] = []
      const {result: areas} = await doStandardPrisma('area', 'findMany', {})

      areas.forEach(area => {
        const defaultSlotCount = 6

        makeLoadingVehilceQuery.push({
          model: `loadingVehicle`,
          method: 'create',
          queryObject: {
            data: {
              areaId: area?.id,
              deliverScheduleId: DeliverSchedule?.id,
              Slot: {
                create: new Array(defaultSlotCount).fill('').map((_, idx) => {
                  return {}
                }),
              },
            },
          },
        })
      })

      const res = await doTransaction({transactionQueryList: makeLoadingVehilceQuery})
      return res
    })
  }

  return (
    <div>
      <h3>配送（積載車枠）</h3>
      <C_Stack className={`   w-[21.875rem]  `}>
        {LoadingVehicle.length > 0 ? (
          <>
            {LoadingVehicle.map(vehicle => {
              return (
                <div key={vehicle.id}>
                  <SingleVehicle Vehicle={vehicle} toggleLoad={toggleLoad} />
                </div>
              )
            })}
            <IconBtn className={`w-8 `} color="blue">
              <PlusIcon
                className={`w-full`}
                onClick={async () => {
                  toggleLoad(async () => {
                    const {result: DeliverSchedule} = await doStandardPrisma(`deliverSchedule`, 'upsert', {
                      where: {
                        date: formatDate(selectedDate, 'iso'),
                      },
                      ...createUpdate({date: formatDate(selectedDate, 'iso')}),
                    })

                    await doStandardPrisma('loadingVehicle', 'create', {
                      data: {deliverScheduleId: DeliverSchedule?.id ?? 0},
                    })
                  })
                }}
              />
            </IconBtn>
          </>
        ) : (
          <Alert color="red">
            <Button type="button" onClick={initLoadingVehicles}>
              積載車設定を始める
            </Button>
          </Alert>
        )}
      </C_Stack>
    </div>
  )
}

export default LoadingVehicles
