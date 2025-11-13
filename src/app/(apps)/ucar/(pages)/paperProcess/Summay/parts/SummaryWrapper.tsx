import {Center} from '@cm/components/styles/common-components/common-components'

import {UCAR_TABLE_ROW_HEIGHT} from '@app/(apps)/ucar/class/ColBuilder/UcarColBuilder'

export const SummaryWrapper = ({children}) => {
  return (
    <Center style={{height: UCAR_TABLE_ROW_HEIGHT}} className={`rounded-sm  bg-white  shadow`}>
      <div className={` flex h-full w-full  items-center p-1`}>
        <>{children}</>
      </div>
    </Center>
  )
}
