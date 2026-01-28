import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { BP_Car } from '@app/(apps)/QRBP/class/BP_Car'
import { R_Stack } from '@cm/components/styles/common-components/common-components'
import { addDays } from 'date-fns'

const ScheduleDisplay = ({ car, type = 'cr' }) => {
  const { crScheduledAt, scheduledAt } = car ?? {}
  // 【業務軸での説明】
  // 「scheduledAt」は車両の予定日付（たとえば入庫予定日）を表す。
  // 「toOrigin」はscheduledAtから3日後の日付。予定区間の終了日候補となる。
  // ただし、「scheduledAt」と「toOrigin」の月が異なる場合（=beyondMonth）には、
  // 一連の納期区間を翌月の1日から3日までの固定範囲として表示する必要がある。
  // これは、月跨ぎ（日付が翌月にまたがる）場合の表示仕様・業務ルール。
  // 逆に、同じ月内で収まる場合は、scheduledAtから3日間の区間をそのまま表示する。

  const { displayValue } = (() => {
    const toOrigin = addDays(new Date(scheduledAt), 3) // 予定開始日から3日後を算出

    // 月を跨ぐかどうか判定
    const beyondMonth = formatDate(scheduledAt, 'YYYY-MM') !== formatDate(toOrigin, 'YYYY-MM')

    // 月跨ぎ時は翌月1～3日、それ以外は予定日から3日間を表示区間とする
    const from: Date = beyondMonth
      ? new Date(toOrigin.getFullYear(), toOrigin.getMonth(), 1)
      : scheduledAt
    const to: Date = beyondMonth
      ? new Date(toOrigin.getFullYear(), toOrigin.getMonth(), 3)
      : toOrigin

    console.log({ scheduledAt, toOrigin, from, to })  // 業務ルールに基づく区間表示用のログ

    const displayValue = `${formatDate(from, 'MM-DD(ddd)')}~${formatDate(to, 'MM-DD(ddd)')}`
    return { displayValue }
  })()

  const { showDelivelyScheduld, deliverlyFrom, deliverlyTo } = BP_Car.calcDelivelySchedule(car)
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
    { label: '店', value: <StoreDisplay /> },
    { label: 'Ｂ', value: formatDate(crScheduledAt, 'MM-DD(ddd)') },
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
