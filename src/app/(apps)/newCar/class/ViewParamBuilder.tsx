'use client'

import {ViewParamBuilderProps} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

import {useState} from 'react'

export class ViewParamBuilder {
  static desiredTorokuDate: ViewParamBuilderProps = props => {
    const {session, roles, accessScopes} = props.ClientProps2.useGlobalProps
    const {admin} = accessScopes()

    return {
      additional: {
        orderBy: [{NewCar: {lastApprovedDesiredTorokuDate: 'asc'}}, {date: `asc`}, {id: `desc`}],
      },
      myTable: {
        update: accessScopes().getNewCarProps().isHQ ? true : false,
        delete: admin,
      },
    }
  }

  static newCar: ViewParamBuilderProps = props => {
    const [open, setopen] = useState(false)

    return {
      myTable: {
        customActions: props => {
          return (
            <>
              <R_Stack>
                <small className={`text-xs`}>
                  【登録日が、2024年7月31日以前の受注】は表示されません。納車後もデータが表示されます
                </small>
              </R_Stack>
            </>
          )
        },
      },
    }
  }
}
