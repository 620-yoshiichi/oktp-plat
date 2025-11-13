import {ColBuilder} from '@app/(apps)/ucar/class/ColBuilder/ColBuilder'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import {Button} from '@cm/components/styles/common-components/Button'

import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {CircledIcon} from '@cm/components/styles/common-components/IconBtn'
import {PlusIcon} from '@heroicons/react/20/solid'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'
import React from 'react'

export const BankUpsertModal = ({formData, bankMasterId}) => {
  const useGlobalProps = useGlobal()
  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: ColBuilder.bankBranchMaster({useGlobalProps}),
    formData,
  })

  const isNew = !formData?.id

  const handleDelete = async () => {
    if (confirm(`削除してもよろしいですか？`)) {
      if (confirm(`本当に削除しますか？`)) {
        await useGlobalProps.toggleLoad(async () => {
          const res = await doStandardPrisma(`bankBranchMaster`, `delete`, {
            where: {id: formData.id},
          })
          toastByResult(res)
        })
      }
    }
  }

  return (
    <C_Stack className={` `}>
      <ShadModal
        {...{
          Trigger: isNew ? (
            <>
              <CircledIcon {...{icon: <PlusIcon />}}></CircledIcon>
            </>
          ) : (
            <C_Stack className={`flex-row gap-1`}>
              <Button color={`blue`} className={` rounded p-0 px-0.5 text-sm`}>
                変更
              </Button>
              <Button color={`red`} className={` rounded p-0 px-0.5 text-sm`} onClick={handleDelete}>
                削除
                {/* <TrashIcon className={`w-3 h-3`} /> */}
              </Button>
            </C_Stack>
          ),
        }}
      >
        <BasicForm
          {...{
            latestFormData,
            onSubmit: async data => {
              await useGlobalProps.toggleLoad(async () => {
                const payload = {
                  code: data.code,
                  name: data.name,
                  bankMasterId,
                }
                const res = await doStandardPrisma(`bankBranchMaster`, `upsert`, {
                  where: {id: data.id ?? 0},
                  create: payload,
                  update: payload,
                })
                toastByResult(res)
              })
            },
          }}
        >
          <Button>確定</Button>
        </BasicForm>
      </ShadModal>
    </C_Stack>
  )
}
