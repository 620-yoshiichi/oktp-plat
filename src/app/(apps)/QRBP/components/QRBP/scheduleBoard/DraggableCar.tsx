import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'
import {shorten, superTrim} from '@cm/lib/methods/common'

import Draggable from '@cm/components/DnD/Draggable'

import {Center} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {NumHandler} from '@cm/class/NumHandler'
import Coloring from '@cm/lib/methods/Coloring'
import {cn} from '@cm/shadcn/lib/utils'

const BOARD_STATUS_COLORS = {
  受付: '#B0B0B0',
  作業中: '#F5A623',
  外注作業: '#E05252',
  作業完了: '#A364C7',
} as const

const getBoardStatus = (car: any, bpCar: BP_Car) => {
  const doneProcessNames = ['最終チェック', '洗車', '作業完了']
  const hasDoneProcess = doneProcessNames.some(name => bpCar.findProcessByName(name))
  if (hasDoneProcess) return '作業完了'

  const lastProcess = bpCar.getLastProcess()
  if (lastProcess?.ProcessNameMaster?.name === '外注') return '外注作業'

  const hasStart = bpCar.findProcessByName('着工指示')
  if (hasStart) return '作業中'

  return '受付'
}

const DraggableCar = ({car, setcarOnModal, lastTouchedCarId, setlastTouchedCarId}) => {
  const id = `${car?.id}_${car.damageNameMasterId}_${formatDate(car.crScheduledAt, 'iso')}`
  const diff = new BP_Car(car).calcScheduledDiff()

  const Car_Class = new BP_Car(car)

  const isPast = new Date(car.crScheduledAt) < new Date()

  const isStoreAccepted = Car_Class.findProcessByName('拠点受取')
  const boardStatus = getBoardStatus(car, Car_Class)
  const shouldFade = (isPast && !!isStoreAccepted) || boardStatus === '作業完了'

  const value = shorten(superTrim(car?.customerName), 10, '..')

  const carProps = {
    bgColor: BOARD_STATUS_COLORS[boardStatus],
    style: {
      opacity: shouldFade ? 0.3 : 1,
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
            <div className={cn(car.moved ? 'border-4  scale-120 animate-pulse   border-red-500' : '')}>
              <IconBtn
                color={carProps.bgColor}
                style={{
                  ...carProps.style,
                  // color: getColorStyles(carProps.bgColor).color,
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
