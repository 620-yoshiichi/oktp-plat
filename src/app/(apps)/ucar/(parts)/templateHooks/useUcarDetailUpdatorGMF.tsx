import {useGlobalModalForm} from '@cm/components/utils/modal/useGlobalModalForm'
import React from 'react'

import UcrDetailUpdater from '@app/(apps)/ucar/(parts)/Ucar/UcrDetailUpdater'
import {getAvailable98NumbersReturn} from '@app/(apps)/ucar/(lib)/num98/getAvailable98Numbers'

export default function useUcarDetailUpdatorGMF() {
  return useGlobalModalForm<{sateiID: string; getAvailable98NumbersReturn: getAvailable98NumbersReturn}>(
    `ucrDetailUpdater`,
    null,
    {
      mainJsx: props => {
        return (
          <UcrDetailUpdater
            {...{
              sateiID: props.GMF_OPEN?.sateiID,
              getAvailable98NumbersReturn: props.GMF_OPEN?.getAvailable98NumbersReturn,
              close: props.close,
            }}
          />
        )
      },
    }
  )
}
