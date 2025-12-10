'use client'

import EditModeSelector from '@app/(apps)/ucar/class/DetailPage/ucar/EditModeSelector'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {DocumentDuplicateIcon} from '@heroicons/react/20/solid'
import {toast} from 'react-toastify'

import {Alert} from '@cm/components/styles/common-components/Alert'
import {getAvailable98NumbersReturn} from '@app/(apps)/ucar/(lib)/num98/getAvailable98Numbers'

export const UcarTop = ({getAvailable98NumbersReturn}: {getAvailable98NumbersReturn: getAvailable98NumbersReturn}) => {
  const nextNumber98 = getAvailable98NumbersReturn?.nextNumber98

  const Next98 = () => {
    if (!getAvailable98NumbersReturn?.nextNumber98) {
      return <Alert color="red">98番号がいっぱいです</Alert>
    }
    return (
      <R_Stack
        onClick={e => {
          navigator.clipboard.writeText(String(nextNumber98 ?? ''))
          toast.success('コピーしました', {autoClose: 1000})
        }}
      >
        <span>次98: </span>
        <div className={`icon-btn row-stack gap-0 `}>
          <DocumentDuplicateIcon className={`w-6`} />
          {nextNumber98}
        </div>
      </R_Stack>
    )
  }

  return (
    <C_Stack>
      <section>
        <R_Stack>
          <Next98 />
          <EditModeSelector />
        </R_Stack>
      </section>
    </C_Stack>
  )
}
