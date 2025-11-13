'use client'

import {DeliveryContext} from '@app/(apps)/QRBP/admin/delivery/ClientWrapper'
import Tip from '@app/(apps)/QRBP/admin/delivery/Tip'

import {Delivery} from '@app/(apps)/QRBP/class/Delivery'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Absolute, C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
IconBtn
import {Button} from '@cm/components/styles/common-components/Button'

import MyPopover from '@cm/components/utils/popover/MyPopover'
import SimpleTable from '@cm/components/utils/SimpleTable'

import {cl, shorten} from '@cm/lib/methods/common'

import {differenceInDays} from 'date-fns'
import {useContext} from 'react'
import {getColorStyles} from '@cm/lib/methods/colors'
type CarCardProps = {
  available: boolean
  CAR_BAISC_INFO: any
  pickedCar: any
  setpickedCar: any
  VehicleToBeAssigned?: any
}
const CarCard = (props: CarCardProps) => {
  const {available, CAR_BAISC_INFO, pickedCar, setpickedCar, VehicleToBeAssigned} = props
  const {id, deliveryId, carName, orderNumber, StoreToDeliver, customerName, katashiki, bodyNumber, deliverScheduledAt} =
    CAR_BAISC_INFO

  const {useGlobalProps, unDistributeCar} = useContext(DeliveryContext)
  const DaysUntilDelivery = differenceInDays(new Date(deliverScheduledAt), new Date())

  const {COLOR_TYPES} = Delivery.constants
  // const bgColor =
  //   DaysUntilDelivery <= -3
  //     ? COLOR_TYPES[0]
  //     : DaysUntilDelivery <= -1
  //     ? COLOR_TYPES[1]
  //     : DaysUntilDelivery === 0
  //     ? COLOR_TYPES[2]
  //     : DaysUntilDelivery >= 3
  //     ? COLOR_TYPES[3]
  //     : COLOR_TYPES[4]
  const bgColor = Delivery.constants.NBC[CAR_BAISC_INFO.type].color

  const isActive = pickedCar?.deliveryId === deliveryId
  const style = isActive
    ? {
        background: 'yellow',
        border: 'solid red 2px',
        color: 'black',
        scale: '150%',
      }
    : {
        ...getColorStyles(bgColor),
      }

  const Area = StoreToDeliver?.Area
  return (
    <div key={deliveryId} className={cl(`${isActive ? 'z-50' : 'z-10'}`)}>
      <MyPopover
        positionFree
        button={
          <Tip
            style={style}
            onClick={e => {
              setpickedCar(prev => (prev?.pickedCar === pickedCar ? null : CAR_BAISC_INFO))
            }}
          >
            {available && (
              <Absolute className={`z-100`}>
                <Button
                  onClick={async e => {
                    const slot = VehicleToBeAssigned.Slot.find(slot => {
                      return [slot.carId, slot.newCarId].includes(CAR_BAISC_INFO.id)
                    })
                    await unDistributeCar(slot)
                  }}
                >
                  解除
                </Button>
              </Absolute>
            )}
            <C_Stack>
              <R_Stack className={`justify-between`}>
                <span>{orderNumber}</span>
                <IconBtn className={` text-error-main  p-0.5 `}>{formatDate(deliverScheduledAt, 'MM-DD(ddd)')}</IconBtn>
              </R_Stack>

              <R_Stack className={`justify-between`}>
                <span>{shorten(carName, 8)}</span>
                <IconBtn style={{...getColorStyles(Area?.color)}}>
                  <div className={`text-right text-[10px]`}>
                    <div> {shorten(StoreToDeliver?.name, 6)}</div>
                    <div>{shorten(Area?.name, 5)}</div>
                  </div>
                </IconBtn>
              </R_Stack>
            </C_Stack>
          </Tip>
        }
      >
        <SimpleTable
          {...{
            style: {width: '700px'},
            headerArr: ['車名', '受注番号', '配送予定日', '拠点', '車台番号', '型式', '購入者'],
            bodyArr: [
              [carName, orderNumber, formatDate(deliverScheduledAt), StoreToDeliver?.name, bodyNumber, katashiki, customerName],
            ],
          }}
        />
      </MyPopover>
    </div>
  )
}

export default CarCard
