'use client'
import { RefObject } from 'react'
import { Button } from '@cm/components/styles/common-components/Button'
import { Text } from '@cm/components/styles/common-components/Alert'
import { cn } from '@cm/shadcn/lib/utils'
import { toastByResult } from '@cm/lib/ui/notifications'
import { createProcessWithPostHandler } from '@app/(apps)/ucar/(lib)/server-actions/Ucar-server-actions'

type Props = {
  ProcessRegisterForm: any
  latestFormData: any
  ProcessCodeItem: any
  UcarData: any
  session: any
  toggleLoad: (fn: () => Promise<void>) => void
  setopenClearnUp: (value: boolean) => void
  disabled: boolean
  formRef: RefObject<HTMLDivElement | null>
}

/**
 * プロセス登録フォーム
 */
export const ProcessRegistrationForm = ({
  ProcessRegisterForm,
  latestFormData,
  ProcessCodeItem,
  UcarData,
  session,
  toggleLoad,
  setopenClearnUp,
  disabled,
  formRef,
}: Props) => {
  return (
    <div ref={formRef} >
      <div>
        <Text color="red">工程を登録してください。</Text>
        <ProcessRegisterForm
          latestFormData={latestFormData}
          onSubmit={async () => {
            toggleLoad(async () => {
              if (ProcessCodeItem) {
                const postHandler = ProcessCodeItem?.postHandler
                const confirmMsg = postHandler?.buildConfirmMsg?.() ?? `工程を登録よろしてもよろしいですか？`

                if (!confirm(`${confirmMsg}`)) {
                  return
                }

                const res = await createProcessWithPostHandler({
                  session,
                  processCode: ProcessCodeItem?.code ?? '',
                  sateiID: UcarData.sateiID,
                })

                toastByResult(res)
                setopenClearnUp(true)
              }
            })
          }}
        >
          <Button>登録</Button>
        </ProcessRegisterForm>
      </div>
    </div>
  )
}
