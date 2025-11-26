'use client'

import {ColBuilder} from '@app/(apps)/newCar/class/Colbuilder/ColBuilder'
import {Days} from '@cm/class/Days/Days'

import {Button} from '@cm/components/styles/common-components/Button'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'

export const EditForm = ({application}) => {
  const useGlobalProps = useGlobal()
  const {toggleLoad} = useGlobalProps
  const {BasicForm, latestFormData} = useBasicFormProps({
    formData: application,
    columns: ColBuilder.desiredTorokuDate({useGlobalProps}),
  })

  const onSubmit = async ({data, newCarId}) => {
    const validateUpdate = async props => {
      const {result: theNewCar} = await doStandardPrisma(`newCar`, `findUnique`, {
        where: {id: newCarId ?? 0},
        include: {DesiredTorokuDate: {}},
      })

      const isUpdateMode = !!props.formData.id
      let result = {success: true, message: ``}

      if (isUpdateMode) {
        return result
      } else if (checkIsPendingOnSameDate()) {
        result = {
          success: false,
          message: `すでに同じ日で申請中です。`,
        }
      }

      return result

      function checkIsPendingOnSameDate() {
        const applicationRecordsOnProgress = theNewCar?.DesiredTorokuDate?.filter(d => d.status === `承認` || d.status === null)

        const isPendingOnSameDay = applicationRecordsOnProgress.some(d => {
          return Days.validate.isSameDate(d.date, props.latestFormData.date)
        })

        const isUpdateMode = !!props.formData.id

        if (isUpdateMode) {
          //更新処理はOK
          return false
        } else {
          return isPendingOnSameDay
        }
      }
    }

    const validationRes = await validateUpdate({newCarId, formData: application})

    if (validationRes.success) {
      const {remarks, status, torokuType, date} = data
      const newCarId = application.newCarId
      const payload = {
        newCarId,
        remarks,
        status,
        torokuType,
        date,
      }

      const res = await doStandardPrisma(`desiredTorokuDate`, `upsert`, {
        where: {id: application.id},
        create: payload,
        update: payload,
      })
      toastByResult(res)
    }
  }

  return (
    <BasicForm
      alignMode="col"
      latestFormData={latestFormData}
      onSubmit={async data => {
        toggleLoad(async () => {
          await onSubmit({data, newCarId: application.newCarId})
        })
      }}
    >
      <Button>確定</Button>
    </BasicForm>
  )
}
