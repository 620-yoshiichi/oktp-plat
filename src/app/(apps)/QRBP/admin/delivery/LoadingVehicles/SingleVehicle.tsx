'use client'

import CarCard from '@app/(apps)/QRBP/admin/delivery/CarCard'
import {DeliveryContext} from '@app/(apps)/QRBP/admin/delivery/ClientWrapper'
import Tip from '@app/(apps)/QRBP/admin/delivery/Tip'

import {Fields} from '@cm/class/Fields/Fields'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import {MinusIcon, PlusIcon, TrashIcon} from '@heroicons/react/20/solid'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {useContext} from 'react'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {Paper} from '@cm/components/styles/common-components/paper'
const SingleVehicle = ({Vehicle, toggleLoad}) => {
  const {setpickedCar, pickedCar, allCars, updateVehicle, distributeCar, useGlobalProps} = useContext(DeliveryContext)

  const slots = Vehicle.Slot

  const columns = Fields.transposeColumns([
    {
      id: 'areaId',
      label: 'エリア',
      forSelect: {},
    },
  ])

  const {BasicForm, latestFormData} = useBasicFormProps({
    columns,
    formData: Vehicle,
    onFormItemBlur: async props => {
      await updateVehicle({Vehicle: props.newlatestFormData})
    },
  })

  return (
    <Paper className={`mx-auto mb-4 bg-gray-50`}>
      <Config {...{BasicForm, latestFormData, toggleLoad: useGlobalProps?.toggleLoad, Vehicle, slots}} />
      <C_Stack className={`items-start`}>
        <div>
          {slots.map((slot, idx) => {
            const {carId, newCarId} = slot

            const theCar = allCars?.find(car => [carId, newCarId].includes(car.id))

            const CAR_BAISC_INFO = theCar

            return (
              <div key={idx} className={`my-1.5`}>
                <Tip>
                  {CAR_BAISC_INFO ? (
                    <>
                      <CarCard
                        {...{
                          available: !!Vehicle,
                          VehicleToBeAssigned: Vehicle,
                          CAR_BAISC_INFO,
                          pickedCar,
                          setpickedCar,
                        }}
                      />
                    </>
                  ) : (
                    <Button
                      className={`h-full w-full text-lg`}
                      color={'blue'}
                      disabled={!pickedCar}
                      onClick={async () => {
                        distributeCar({
                          pickedCar,
                          slot,
                        })
                      }}
                    >
                      搭載可能
                    </Button>
                  )}
                </Tip>
              </div>
            )
          })}
        </div>

        <R_Stack></R_Stack>
      </C_Stack>
    </Paper>
  )
}
export default SingleVehicle

const Config = ({BasicForm, latestFormData, toggleLoad, Vehicle, slots}) => {
  return (
    <R_Stack className={`gap-4`}>
      <BasicForm
        {...{
          latestFormData,
          alignMode: 'row',
          ControlOptions: {
            ControlStyle: {width: 80},
          },
        }}
      ></BasicForm>

      <IconBtn className={`w-8`} color="yellow">
        <MinusIcon
          className={`w-full`}
          onClick={async () => {
            toggleLoad(async () => {
              const lastSlot = slots[slots.length - 1]
              await doStandardPrisma('slot', 'delete', {
                where: {
                  id: lastSlot.id,
                },
              })
            })
          }}
        />
      </IconBtn>
      <IconBtn className={`w-8`} color="blue">
        <PlusIcon
          className={`w-full`}
          onClick={async () => {
            toggleLoad(async () => {
              await doStandardPrisma('slot', 'create', {
                data: {loadingVehicleId: Vehicle.id},
              })
            })
          }}
        />
      </IconBtn>
      <IconBtn
        className={`w-8`}
        color="red"
        onClick={async () => {
          toggleLoad(async () => {
            await doStandardPrisma('loadingVehicle', 'delete', {
              where: {id: Vehicle.id},
            })
          })
        }}
      >
        <TrashIcon className={`w-full`} />
      </IconBtn>
    </R_Stack>
  )
}
