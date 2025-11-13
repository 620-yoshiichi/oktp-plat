import React from 'react'
import {C_Stack} from '@cm/components/styles/common-components/common-components'

import {ParameterCard} from '@cm/components/styles/common-components/ParameterCard'

import {HREF} from '@cm/lib/methods/urls'
import {cl} from '@cm/lib/methods/common'

import {T_LINK} from '@cm/components/styles/common-components/links'
import {Button} from '@cm/components/styles/common-components/Button'
import {Paper} from '@cm/components/styles/common-components/paper'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import useWindowSize from '@cm/hooks/useWindowSize'
import {getColorStyles} from '@cm/lib/methods/colors'

const ListByCalendarDataType = ({data, idx, activeInfoType, query, useGlobalProps}) => {
  const {device} = useWindowSize()
  const isActive = activeInfoType?.includes(data.calendarDataType.value)

  if (!isActive) return null

  const {calendarDataType, before90Days} = data

  const trancateClass = ` mx-auto    overflow-auto `
  const customerPageHref = HREF(`/shinren/admin/config/rentaCustomer/${data.RentaCustomer?.id}`, {}, query)

  const colorProps = getColorStyles(calendarDataType?.color)

  const SummaryContent = () => {
    return (
      <Paper className={cl(trancateClass, `text-responsive  gap-0 overflow-hidden  p-0.5 leading-3`)} style={{...colorProps}}>
        <small>{data?.RentaCustomer?.name}</small>
        <small>{data.item}</small>
      </Paper>
    )
  }

  const customerName = data?.RentaCustomer?.name
  const userName = data?.RentaCustomer?.User?.name.toLowerCase()
  const cstmrLink = (
    <T_LINK className={`w-fit`} href={customerPageHref}>
      {customerName}
    </T_LINK>
  )

  const AllContent = () => {
    return (
      <Paper className={cl(trancateClass, `  gap-0 overflow-hidden`)} style={{...colorProps}}>
        {before90Days && <Button color="red">90日前</Button>}

        <C_Stack className={` gap-0.5  bg-white/70`}>
          <ParameterCard label={'客'} value={cstmrLink} />
          <ParameterCard label={'担当'} value={userName} />
          <ParameterCard label={'内容'} value={data.item} />
        </C_Stack>
      </Paper>
    )
  }

  const CardContent = () => {
    if (device.PC) {
      return <AllContent />
    } else {
      return (
        <ShadModal Trigger={<SummaryContent />}>
          <AllContent />
        </ShadModal>
      )
    }
  }

  return (
    <div key={idx}>
      <CardContent />
    </div>
  )
}

export default ListByCalendarDataType
