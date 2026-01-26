'use client'
import { toast } from 'react-toastify'
import { Button } from '@cm/components/styles/common-components/Button'
import { Text } from '@cm/components/styles/common-components/Alert'
import { Fields } from '@cm/class/Fields/Fields'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import { __shared_get_shiwakeKekkeCol } from '@app/(apps)/ucar/class/ColBuilder/getter/shared_shiwakeKekkeCol'

type Props = {
  UcarData: any
  stores: any
  onComplete: () => void
}

/**
 * CR着プロセス用の仕分け先入力フォーム
 */
export const DestinationForm = ({ UcarData, onComplete }: Props) => {
  const columns = new Fields([__shared_get_shiwakeKekkeCol()]).transposeColumns()
  const { BasicForm, latestFormData } = useBasicFormProps({
    columns,
    formData: {
      destination: UcarData.destination || '',
      runnable: UcarData.runnable,
      remarks: UcarData.remarks || '',
    },
  })

  return (
    <div>
      <Text color="red">仕分け先を入力してください。</Text>
      <BasicForm
        latestFormData={latestFormData}
        onSubmit={async data => {
          await doStandardPrisma(`ucar`, `update`, {
            where: { id: UcarData.id },
            data: {
              destination: data.destination,
              runnable: data.runnable,
              remarks: data.remarks,
            },
          })
          toast.success(`仕分け先を更新しました。そのまま工程登録をしてください。`)
          onComplete()
        }}
      >
        <Button>仕分け先登録</Button>
      </BasicForm>
    </div>
  )
}
