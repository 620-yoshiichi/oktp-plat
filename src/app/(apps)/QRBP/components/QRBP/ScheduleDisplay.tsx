import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {addDays} from 'date-fns'

const ScheduleDisplay = ({car, type = 'cr'}) => {
  const {crScheduledAt, scheduledAt} = car ?? {}
  const {displayValue} = (() => {
    const toOrigin = addDays(new Date(scheduledAt), 3)
    const beyondMonth = formatDate(scheduledAt, 'YYYY-MM') !== formatDate(toOrigin, 'YYYY-MM')
    const from: Date = beyondMonth ? new Date(toOrigin.getFullYear(), toOrigin.getMonth(), 1) : scheduledAt

    const to: Date = beyondMonth ? new Date(toOrigin.getFullYear(), toOrigin.getMonth(), 3) : toOrigin

    const displayValue = `${formatDate(from, 'MM-DD(ddd)')}~${formatDate(to, 'MM-DD(ddd)')}`
    return {displayValue}
  })()

  const {showDelivelyScheduld, deliverlyFrom, deliverlyTo} = BP_Car.calcDelivelySchedule(car)
  const StoreDisplay = () => <div className={` w-full justify-center`}>{displayValue}</div>

  const DeliverlyScheduled = () => {
    return (
      <>
        {showDelivelyScheduld && (
          <div className={`text-error-main font-bold`}>
            {data[2]?.label}: {data[2]?.value}
          </div>
        )}
      </>
    )
  }
  const data = [
    {label: '店', value: <StoreDisplay />},
    {label: 'Ｂ', value: formatDate(crScheduledAt, 'MM-DD(ddd)')},
    {
      label: '配',
      value: formatDate(deliverlyFrom, 'MM-DD(ddd)') + '~' + formatDate(deliverlyTo, 'MM-DD(ddd)'),
    },
  ]

  if (type === 'store') {
    if (scheduledAt) {
      return (
        <>
          <StoreDisplay />
          <DeliverlyScheduled />
        </>
      )
    }
    return <></>
  } else if (type === 'cr') {
    return (
      <div className={`text-start  text-[12px]  leading-[13px] `}>
        <R_Stack className={`gap-0 opacity-100 flex-nowrap`}>
          <small>{data[0]?.label}:</small> <span>{data[0].value}</span>
        </R_Stack>
        <R_Stack className={`gap-0 opacity-60 flex-nowrap`}>
          <small>{data[1]?.label}:</small> <span>{data[1].value}</span>
        </R_Stack>

        <DeliverlyScheduled />
      </div>
    )
  }
  return <></>
}

export default ScheduleDisplay
