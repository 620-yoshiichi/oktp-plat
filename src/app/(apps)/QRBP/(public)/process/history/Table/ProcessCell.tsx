import {generateColorCodeInRange} from '@cm/lib/methods/common'

import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'

const ProcessCell = ({roundedCount, roundedTime}) => {
  return (
    <R_Stack className={`mx-auto items-center justify-center`}>
      {!!roundedCount && (
        <R_Stack className={`gap-2`}>
          <div>
            <small>{roundedCount}件</small>
          </div>
          <R_Stack>
            <IconBtn color={generateColorCodeInRange(roundedTime, 0, 5)} className={`w-[50px]  font-bold !text-gray-700`}>
              {roundedTime}
            </IconBtn>
            <div>
              <small>時間</small>
            </div>
          </R_Stack>
        </R_Stack>
      )}
    </R_Stack>
  )
}
export default ProcessCell
