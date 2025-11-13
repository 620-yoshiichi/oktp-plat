'use client'

import {ViewParamBuilderProps} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'

export class ViewParamBuilder {
  static car: ViewParamBuilderProps = props => {
    return {
      myTable: {
        delete: false,
        style: {width: 1200, height: '70vh'},
      },
    }
  }
}
