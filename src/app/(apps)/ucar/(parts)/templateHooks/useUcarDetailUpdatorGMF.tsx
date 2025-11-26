import {useGlobalModalForm} from '@cm/components/utils/modal/useGlobalModalForm'
import React from 'react'

import UcrDetailUpdater from '@app/(apps)/ucar/(parts)/Ucar/UcrDetailUpdater'

export default function useUcarDetailUpdatorGMF() {
  return useGlobalModalForm<{sateiID: string}>(`ucrDetailUpdater`, null, {
    mainJsx: props => {
      return (
        <UcrDetailUpdater
          {...{
            sateiID: props.GMF_OPEN?.sateiID,
            close: props.close,
          }}
        />
      )
    },
  })
}
