'use client'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'

export const RentaCustomDateSwithcer = (props: {pathname: string; children?: any}) => {
  const {pathname, children} = props
  const monthOnly = ['admin/aggregation', '/admin/calendar'].some(path => pathname.includes(path))
  const showDateSwitcher = ['/admin/aggregation', '/admin/calendar', '/rentaDailyReport'].some(path => pathname.includes(path))

  const DateSwitcherProps: any = monthOnly
    ? {monthOnly: true}
    : {
        selectPeriod: true,
        selectMonth: true,
        monthOnly: false,
      }

  if (showDateSwitcher) {
    return (
      <div>
        <NewDateSwitcher {...{...DateSwitcherProps}} />
        {children}
      </div>
    )
  } else {
    return <></>
  }
}

export const AccordionLabel = ({query, selectedUsers}) => {
  const from = formatDate(query.from)
  const to = formatDate(query.to)

  const selectedPeriodDisplayValue = (
    <R_Stack>
      {from && <IconBtn color="red">{from}</IconBtn>}
      {to && (
        <>
          <span>~</span>
          <IconBtn color="red">{to}</IconBtn>
        </>
      )}
    </R_Stack>
  )

  const userCount = selectedUsers.length
  const maxDisplayCount = 3
  const rest = userCount - maxDisplayCount
  const selectedUsersDisplayValue = selectedUsers.slice(0, 3).map((d, i) => {
    return (
      <div key={i} className={` h-[16px]  w-[30px]  overflow-hidden `}>
        {d.name}
      </div>
    )
  })

  return (
    <R_Stack>
      <span className={`text-[15px]`}>絞り込み</span>
      <span>{selectedPeriodDisplayValue}</span>
      <R_Stack className={`gap-0.5 text-xs `}>
        {selectedUsersDisplayValue}
        {rest > 0 && <span>...他{rest}人</span>}
      </R_Stack>
    </R_Stack>
  )
}
