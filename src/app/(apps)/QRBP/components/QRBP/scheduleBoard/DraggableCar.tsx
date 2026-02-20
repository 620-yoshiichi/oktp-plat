import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'
import {shorten, superTrim} from '@cm/lib/methods/common'

import Draggable from '@cm/components/DnD/Draggable'
import type {ScheduleBoardMode} from './scheduleBoardActions'

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

type DraggableCarProps = {
  car: any
  setcarOnModal: any
  lastTouchedCarId: any
  setlastTouchedCarId: any
  mode?: ScheduleBoardMode
}

const DraggableCar = ({car, setcarOnModal, lastTouchedCarId, setlastTouchedCarId, mode = 'cr'}: DraggableCarProps) => {
  const effectiveDate = mode === 'cr' ? car.crScheduledAt : (car.engineerScheduledAt ?? car.crScheduledAt)
  const id = `${car?.id}_${car.damageNameMasterId}_${formatDate(effectiveDate, 'iso')}`
  const Car_Class = new BP_Car(car)

  const isPast = effectiveDate && new Date(effectiveDate) < new Date()
  const isStoreAccepted = Car_Class.findProcessByName('拠点受取')
  const boardStatus = getBoardStatus(car, Car_Class)
  const shouldFade = (isPast && !!isStoreAccepted) || boardStatus === '作業完了'

  const isEngineerSet = mode === 'engineer' && !!car.engineerScheduledAt

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
          relative w-[100px] rounded border-l-[3px] bg-white
          shadow-[0_1px_3px_rgba(0,0,0,0.08)]
          hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)]
          transition-shadow cursor-grab
          px-1.5 py-1
          ${shouldFade ? 'opacity-20 grayscale-40' : ''}
          ${mode === 'engineer' && !isEngineerSet ? 'opacity-60 border-dashed' : ''}
          ${car.moved ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
        `}
        style={{borderLeftColor: statusColor}}
      >
        {mode === 'engineer' && isEngineerSet && (
          <div className={`absolute -top-1 -left-1 z-10 h-2.5 w-2.5 rounded-full bg-blue-500`} title="エンジニア設定済み" />
        )}
        <div className={`flex items-center justify-between`}>
          <span className={`text-[9px] leading-none text-gray-400`}>{car.bpNumber}</span>
          {mode === 'cr' && car.engineerScheduledAt && (
            <span className={`text-[8px] leading-none text-blue-400`} title="エンジニア予定">
              {formatDate(car.engineerScheduledAt, 'MM-DD')}
            </span>
          )}
          {mode === 'engineer' && car.crScheduledAt && (
            <span className={`text-[8px] leading-none text-orange-400`} title="CR予定">
              {formatDate(car.crScheduledAt, 'MM-DD')}
            </span>
          )}
        </div>
        <div className={`mt-0.5 text-[11px] font-medium leading-tight text-gray-800 truncate`}>{customerName}</div>
      </div>
    </Draggable>
  )
}

export default DraggableCar
