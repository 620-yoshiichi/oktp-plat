import {NEW_CAR_CONST} from '@app/(apps)/newCar/(constants)/newCar-constants'
import {ColoredText} from '@cm/components/styles/common-components/colors'

import React from 'react'

export default function StatusButton({status}) {
  const master = NEW_CAR_CONST.CR_OPERATION.STATUS_COLORS.find(s => s.value === status) ?? {}
  const {value, color} = master as any

  return (
    <ColoredText
      {...{
        bgColor: color,
        className: `!text-[10px] !p-0 !px-1    leading-[16px]`,
      }}
    >
      {value}
    </ColoredText>
  )
}
