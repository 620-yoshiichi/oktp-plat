import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { BP_Car } from '@app/(apps)/QRBP/class/BP_Car'
import { shorten, superTrim } from '@cm/lib/methods/common'

import Draggable from '@cm/components/DnD/Draggable'
import { NumHandler } from '@cm/class/NumHandler'

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

const DraggableCar = ({ car, setcarOnModal, lastTouchedCarId, setlastTouchedCarId }) => {
  const id = `${car?.id}_${car.damageNameMasterId}_${formatDate(car.crScheduledAt, 'iso')}`
  const diff = new BP_Car(car).calcScheduledDiff()
  const Car_Class = new BP_Car(car)

  const isPast = new Date(car.crScheduledAt) < new Date()
  const isStoreAccepted = Car_Class.findProcessByName('拠点受取')
  const boardStatus = getBoardStatus(car, Car_Class)
  const shouldFade = (isPast && !!isStoreAccepted) || boardStatus === '作業完了'

  const customerName = shorten(superTrim(car?.customerName), 9, '..')
  const statusColor = BOARD_STATUS_COLORS[boardStatus]

  return (
    <Draggable
      id={id}
      data={car}
      onClick={() => {
        setcarOnModal(car)
      }}
    >
      <div
        className={`
          w-[100px] rounded border-l-[3px] bg-white
          shadow-[0_1px_3px_rgba(0,0,0,0.08)]
          hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)]
          transition-shadow cursor-grab
          px-1.5 py-1
          ${shouldFade ? 'opacity-20 grayscale-40' : ''}
          ${car.moved ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
        `}
        style={{ borderLeftColor: statusColor }}
      >
        <div className={`text-[9px] leading-none text-gray-400`}>{car.bpNumber}</div>
        <div className={`mt-0.5 text-[11px] font-medium leading-tight text-gray-800 truncate`}>{customerName}</div>
        {/* {diff !== 0 && (
          <div className={`mt-0.5 text-[9px] leading-none ${diff > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {NumHandler.addPlusMinus(diff)}日
          </div>
        )} */}
      </div>
    </Draggable>
  )
}

export default DraggableCar
