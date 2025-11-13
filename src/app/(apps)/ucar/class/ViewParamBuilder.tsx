'use client'

import {UcarTop} from '@app/(apps)/ucar/class/DetailPage/ucar/UcarTop'
import {ViewParamBuilderProps} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'

export class ViewParamBuilder {
  static ucar: ViewParamBuilderProps = props => {
    const {accessScopes, toggleLoad, router} = props.ClientProps2.useGlobalProps

    return {
      // myForm: {create: {finalizeUpdate: () => router.refresh()}},

      myTable: {
        create: false,
        update: false,
        delete: false,

        customActions: () => {
          return <UcarTop {...props.ClientProps2} />
        },
        header: false,
        style: {margin: `auto`, maxWidth: `95vw`, maxHeight: `70vh`},
      },
    }
  }
}
