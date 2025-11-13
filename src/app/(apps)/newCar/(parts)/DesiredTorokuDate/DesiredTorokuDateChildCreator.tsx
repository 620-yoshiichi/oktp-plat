import {ColBuilder} from '@app/(apps)/newCar/class/Colbuilder/ColBuilder'
import {NewCarClass} from '@app/(apps)/newCar/class/NewCarClass/NewCarClass'

import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import {Alert} from '@cm/components/styles/common-components/Alert'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import React from 'react'

export default function DesiredTorokuDateChildCreator({newCar, additionalWhere, settorokuDateApplicationFormOpen}) {
  const useGlobalProps = useGlobal()
  const {roles, accessScopes, toggleLoad} = useGlobalProps
  const {isHQ, isTorokuTanto} = accessScopes().getNewCarProps()

  if (!newCar?.id) {
    return <PlaceHolder />
  }
  return (
    <C_Stack>
      <Alert color="red">
        <h1>申請をすると、本部へメール通知がなされます。</h1>
        <div>以前に申請した内容を変える場合は、必ず備考に理由を記載してください。</div>
      </Alert>
      <ChildCreator
        {...{
          myForm: {
            create: {
              validateUpdate: async props => {
                const {result: theNewCar} = await doStandardPrisma(`newCar`, `findUnique`, {
                  where: {id: newCar?.id ?? 0},
                  include: {DesiredTorokuDate: {}},
                })
                const isUpdateMode = !!props.formData.id
                let result = {success: true, message: ``}

                if (isUpdateMode) {
                  return result
                } else if (await mustInputRemarksWhenInsert({theNewCar})) {
                  result = {
                    success: false,
                    message: `申請日を変更する際は、備考を入力してください。`,
                  }
                }

                return result

                async function mustInputRemarksWhenInsert({theNewCar}) {
                  const {date} = (await new NewCarClass(theNewCar).torokuMethods.getLastApprovedDesiredTorokuDate()) ?? {}

                  return (date ? true : false) && !props.latestFormData.remarks
                }
              },
            },
          },
          myTable: {
            update: isHQ ? true : false,
            delete: isHQ ? {} : false,
          },
          ParentData: newCar,
          models: {parent: `newCar`, children: `desiredTorokuDate`},
          columns: ColBuilder.desiredTorokuDate({
            useGlobalProps,
            ColBuilderExtraProps: {newCarId: newCar.id},
          }),
          useGlobalProps,
          additional: {
            where: additionalWhere,
            include: {
              NewCar: {
                include: {
                  User: {},
                  Store: {},
                },
              },
            },
          },
        }}
      />
    </C_Stack>
  )
}
