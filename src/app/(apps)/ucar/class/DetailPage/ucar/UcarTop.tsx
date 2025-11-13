'use client'

import EditModeSelector from '@app/(apps)/ucar/class/DetailPage/ucar/EditModeSelector'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {DetailPagePropType} from '@cm/types/types'
import {DocumentDuplicateIcon} from '@heroicons/react/20/solid'
import {toast} from 'react-toastify'

import {Alert} from '@cm/components/styles/common-components/Alert'

export const UcarTop = (props: DetailPagePropType) => {
  const {next98NumberModel} = props.PageBuilderExtraProps ?? {}

  const Next98 = () => {
    if (!next98NumberModel.number) {
      return <Alert color="red">98番号がいっぱいです</Alert>
    }
    return (
      <R_Stack
        onClick={e => {
          navigator.clipboard.writeText(next98NumberModel.number)
          toast.success('コピーしました', {autoClose: 1000})
        }}
      >
        <span>次98: </span>
        <div className={`icon-btn row-stack gap-0 `}>
          <DocumentDuplicateIcon className={`w-6`} />
          {next98NumberModel.number}
        </div>
      </R_Stack>
    )
  }

  return (
    <C_Stack>
      <section>
        <R_Stack>
          {/* <Next98 /> */}
          <EditModeSelector {...props} />
        </R_Stack>
      </section>
    </C_Stack>
  )
}
