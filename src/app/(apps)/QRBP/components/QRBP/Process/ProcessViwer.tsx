import {DoubledBP} from '@app/(apps)/QRBP/class/doubledBpNumber'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import React from 'react'
import ProcessBadge from './ProcessBadge'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'

export default function ProcessViwer({
  seteditModalOpen,
  car,
  onClickFunction = () => undefined,
  size = 'md',
  subCarsInCurrentCars,
}: {
  seteditModalOpen?: any
  car: any
  onClickFunction?: any
  size?: any
  subCarsInCurrentCars?: any
}) {
  const {bpNumber, orderedAt} = car
  const ThisCarProcess = car.Process ?? []

  const SubCarProcess =
    subCarsInCurrentCars
      ?.filter(car => {
        const goodbyCode = DoubledBP.goodbyCode.split(car)

        const hit1 = bpNumber === goodbyCode.bpNumber
        const hit2 = formatDate(orderedAt) === goodbyCode.ordereAtString

        return hit1 && hit2
      })
      .map(car => {
        const {Process} = car

        return Process.map(p => {
          return {...p, Car: car}
        }).flat()
      })
      .flat() ?? []

  const AllProcesses = [...(ThisCarProcess ?? []), ...(SubCarProcess ?? [])].sort((a, b) => {
    const bDate = getMidnight(new Date(b.date))
    const aDate = getMidnight(new Date(a.date))
    return aDate.getTime() - bDate.getTime() || (a.id || 0) - (b.id || 0)
  })
  // const [editModalOpen, seteditModalOpen] = useState(null)

  return (
    <>
      <C_Stack>
        <div className={` z-10 flex  w-full   flex-wrap items-center gap-1`}>
          {AllProcesses?.map(process => {
            const {name, color} = process.ProcessNameMaster ?? {}
            const displayName = name === '調色' ? '下処理' : name

            const thisProcessIsSub = process.Car?.representativeCarBpNumber
            const subProcessStyle = thisProcessIsSub
              ? {
                  opacity: 0.5,
                  transform: 'scale(0.8)',
                }
              : {}
            return (
              <div key={process.id}>
                <ProcessBadge {...{car, process, onClickFunction, size}}>
                  <IconBtn
                    {...{
                      size: 'sm',
                      onClick: () => seteditModalOpen?.(process),
                      vivid: true,
                      style: subProcessStyle,
                      color,
                      className: 'p-0.5',
                    }}
                  >
                    <div className={`w-[45px] truncate text-[10px]`}>{displayName}</div>
                  </IconBtn>
                </ProcessBadge>
              </div>
            )
          })}
        </div>
      </C_Stack>
    </>
  )
}
