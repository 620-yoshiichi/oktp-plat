'use client'
import CarCard from '@app/(apps)/QRBP/admin/delivery/CarCard'
import {DeliveryContext} from '@app/(apps)/QRBP/admin/delivery/ClientWrapper'
import {DELIVERY_CAR_OBJ_TYPE} from '@app/(apps)/QRBP/admin/delivery/getter'

import {Delivery, NBC_TYPE} from '@app/(apps)/QRBP/class/Delivery'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
IconBtn
import {Paper, PaperLarge} from '@cm/components/styles/common-components/paper'

import {cl} from '@cm/lib/methods/common'

import {Fragment, useContext} from 'react'
const CarContainer = (props: {carsByDate: any; NBC_TYPE: NBC_TYPE; stores: any[]}) => {
  const {pickedCar, setpickedCar, allSlots} = useContext(DeliveryContext)

  const {carsByDate, NBC_TYPE} = props

  const {color: wrapperColor, label} = Delivery.constants.NBC[NBC_TYPE]

  return (
    <PaperLarge style={{background: wrapperColor + '40'}}>
      <h2 className={`text-2xl`} style={{color: wrapperColor}}>
        {label}
      </h2>

      <C_Stack className={`gap-4 `}>
        {Object.keys(carsByDate).map((key, idx) => {
          const cars = carsByDate[key]

          return (
            <Paper className={`bg-opacity-70 p-2`} key={idx}>
              <h3>{key} 配送予定</h3>
              <R_Stack className={'items-start'}>
                {cars.map((CAR_BAISC_INFO: DELIVERY_CAR_OBJ_TYPE, idx2) => {
                  const {carKey} = Delivery.constants.NBC[NBC_TYPE]

                  const available = allSlots?.find(s => s[carKey] === CAR_BAISC_INFO.id)

                  return (
                    <Fragment key={idx2}>
                      <div className={cl(available ? ' disabled opacity-20' : '')}>
                        <CarCard
                          {...{
                            available: available,
                            NBC_TYPE,
                            CAR_BAISC_INFO,
                            pickedCar,
                            setpickedCar,
                          }}
                        />
                      </div>
                    </Fragment>
                  )
                })}
              </R_Stack>
            </Paper>
          )
        })}
      </C_Stack>
    </PaperLarge>
  )
}

export default CarContainer
