import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {shorten, superTrim} from '@cm/lib/methods/common'

import Draggable from '@cm/components/DnD/Draggable'

import {Center} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {cn} from '@cm/shadcn/lib/utils'
import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'

const EngineerDraggableCar = ({car, setcarOnModal, lastTouchedCarId, setlastTouchedCarId}) => {
  const id = `${car?.id}_${car.damageNameMasterId}_${formatDate(car.engineerScheduledAt, 'iso')}`
  const Car_Class = new BP_Car(car)

  const isPast = car.engineerScheduledAt && new Date(car.engineerScheduledAt) < new Date()

  const lastProcess = Car_Class.getLastProcess()

  const isStoreAccepted = lastProcess?.ProcessNameMaster?.name === '拠点受取'

  const value = shorten(superTrim(car?.customerName), 10, '..')

  const carProps = {
    bgColor: lastProcess?.ProcessNameMaster?.color,
    style: {
      opacity: isPast && isStoreAccepted ? 0.4 : 1,
    },
  }

  return (
    <div className={`relative flex flex-nowrap items-center text-sm`}>
      <Draggable
        id={id}
        data={car}
        onClick={() => {
          setcarOnModal(car)
        }}
      >
        <div className={`row-stack flex-nowrap text-xs`}>
          <Center className={`h-[35px] w-[90px]`}>
            <div className={cn(car.moved ? 'border-4 scale-120 animate-pulse border-red-500' : '')}>
              <IconBtn
                color={carProps.bgColor}
                style={{
                  ...carProps.style,
                }}
                className={`relative rounded w-[90px] text-[10px]! p-0.5! leading-3`}
              >
                <div className={`absolute-center -z-50 w-full overflow-hidden text-transparent`}>{car.plate}</div>
                <div className={`text-[8px]`}>{car.bpNumber}</div>
                <div>{value}</div>
              </IconBtn>
            </div>
          </Center>
        </div>
      </Draggable>
    </div>
  )
}

export default EngineerDraggableCar
