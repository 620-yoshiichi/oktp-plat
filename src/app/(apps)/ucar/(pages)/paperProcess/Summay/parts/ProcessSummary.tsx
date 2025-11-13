import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import React from 'react'
import UcarProcessHistory from '@app/(apps)/ucar/(parts)/UcarProcessHistory'
import {SummaryWrapper} from '@app/(apps)/ucar/(pages)/paperProcess/Summay/parts/SummaryWrapper'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'

export default function ProcessSummary({className, ucar, mainProcessMasters, subProcessMasters, query}) {
  return (
    <SummaryWrapper>
      <C_Stack className={`gap-1 justify-between h-full  `}>
        <R_Stack className={` flex-nowrap gap-0   `}>
          {/* <div className={`inline-block w-[18px]`}>営業</div> */}
          <div className={`w-[300px]`}>
            <UcarProcessHistory
              {...{
                className,
                ucar,
                processMasters: UcarProcessCl.CODE.array.filter(p => p.list.includes(`main`)),
                query,
              }}
            ></UcarProcessHistory>
          </div>
        </R_Stack>

        <hr />
        <R_Stack className={` flex-nowrap gap-0   `}>
          {/* <div className={`inline-block w-[18px]`}>店長</div> */}
          <div className={`w-[300px]`}>
            <UcarProcessHistory
              {...{
                className,
                ucar,
                processMasters: [...UcarProcessCl.CODE.array.filter(p => p.list.includes(`sub`))],
                query,
              }}
            ></UcarProcessHistory>
          </div>
        </R_Stack>
      </C_Stack>
    </SummaryWrapper>
  )
}
