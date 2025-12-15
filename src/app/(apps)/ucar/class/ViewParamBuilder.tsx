'use client'

import {ViewParamBuilderProps} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'
import {UcarTop} from '@app/(apps)/ucar/class/DetailPage/ucar/UcarTop'

export class ViewParamBuilder {
  static ucar: ViewParamBuilderProps = props => {
    const {isHQ, isStoreManager, isSales, carWhere} = props.useGlobalProps.accessScopes().getUcarProps()
    console.log({isHQ, isStoreManager, isSales, carWhere}) //logs
    return {
      // myForm: {create: {finalizeUpdate: () => router.refresh()}},

      myTable: {
        create: isHQ ? true : false,
        update: false,
        delete: false,
        pagination: {countPerPage: 10},
        customActions: () => {
          return (
            <UcarTop
              {...{
                getAvailable98NumbersReturn: props?.ClientProps?.PageBuilderExtraProps?.getAvailable98NumbersReturn,
              }}
            />
          )
        },
        header: false,
        style: {margin: `auto`, maxWidth: `95vw`, maxHeight: `70vh`},
      },
    }
  }
}
