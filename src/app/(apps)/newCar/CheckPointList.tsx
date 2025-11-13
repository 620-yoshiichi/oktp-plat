import {CHECK_POINTS, newCarModel} from '@app/(apps)/newCar/(constants)/checkpoints/checkpoints'
import {CheckPoint} from '@app/(apps)/newCar/orders/CheckPoint'

import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {UseRecordsReturn} from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'

import React from 'react'

export default function CheckPointList(props: {newCar; HK_USE_RECORDS: UseRecordsReturn; width}) {
  const newCar = props.newCar as newCarModel
  const {HK_USE_RECORDS, width} = props

  return (
    <C_Stack className={`gap-1 gsakjglas`}>
      {CHECK_POINTS.map((cp, i) => {
        return (
          <div key={i} style={{width}}>
            <CheckPoint {...{newCar, cp, HK_USE_RECORDS}} />
          </div>
        )
      })}
    </C_Stack>
  )
}
