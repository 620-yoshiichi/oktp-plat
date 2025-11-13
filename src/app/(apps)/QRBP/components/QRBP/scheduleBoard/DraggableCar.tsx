import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'
import { shorten, superTrim} from '@cm/lib/methods/common'
import {getColorStyles} from '@cm/lib/methods/colors'

import Draggable from '@cm/components/DnD/Draggable'

import {Center} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {NumHandler} from '@cm/class/NumHandler'
import Coloring from '@cm/lib/methods/Coloring'

const DraggableCar = ({car, setcarOnModal, lastTouchedCarId, setlastTouchedCarId}) => {
  const id = `${car?.id}_${car.damageNameMasterId}_${formatDate(car.crScheduledAt, 'iso')}`
  const diff = new BP_Car(car).calcScheduledDiff()
  const Car_Class = new BP_Car(car)

  // 拠点受取ができていて、今日以前のものは半透明のスタイルを当てる

  const isPast = new Date(car.crScheduledAt) < new Date()

  const lastProcess = Car_Class.getLastProcess()

  const isStoreAccepted = lastProcess?.ProcessNameMaster?.name === '拠点受取'

  const value = shorten(superTrim(car?.customerName), 10, '..')
  const isLastTouched = lastTouchedCarId === car.id

  const carProps = {
    bgColor: isLastTouched ? 'yellow' : lastProcess?.ProcessNameMaster?.color,

    style: {
      opacity: isPast && isStoreAccepted ? 0.4 : 1,
      ...(isLastTouched
        ? {
            border: '2px solid black',
            color: 'red',
            opacity: 1,
          }
        : undefined),
    },
  }

  return (
    <div className={`relative flex flex-nowrap items-center  text-sm`}>
      <Draggable
        id={id}
        data={car}
        onClick={() => {
          setcarOnModal(car)
        }}
      >
        <div className={`row-stack  flex-nowrap text-xs   `}>
          <Center className={`h-[35px]   w-[90px]    `}>
            <div>
              <IconBtn
                color={carProps.bgColor}
                style={{
                  ...carProps.style,
                  color: getColorStyles(carProps.bgColor).color,
                }}
                className={`relative rounded w-[90px] text-[10px]! p-0.5! leading-3`}
              >
                <div className={`absolute-center -z-50 w-full overflow-hidden text-transparent`}>{car.plate}</div>
                <div className={`text-[8px]`}>{car.bpNumber}</div>

                <div>{value}</div>
              </IconBtn>
            </div>
          </Center>

          {diff !== 0 && (
            <Coloring size="sm" color={diff > 0 ? 'red' : 'green'}>
              ({NumHandler.addPlusMinus(diff)})
            </Coloring>
          )}
        </div>
      </Draggable>
    </div>
  )
}

export default DraggableCar
