'use client'

import {useState} from 'react'
import {toast} from 'react-toastify'
import {C_Stack, FitMargin} from '@cm/components/styles/common-components/common-components'
import {Button} from '@cm/components/styles/common-components/Button'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Fields} from '@cm/class/Fields/Fields'
import {Card} from '@cm/shadcn/ui/card'
import {__shared_get_shiwakeKekkeCol} from '@app/(apps)/ucar/class/ColBuilder/getter/shared_shiwakeKekkeCol'
import {ucarData} from '@app/(apps)/ucar/class/UcarCL'
import {colType} from '@cm/types/col-types'

type EditInfoFormProps = {
  ucar: ucarData
  stores: any[]
}

const EditInfoForm = ({ucar, stores}: EditInfoFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const columns: colType[] = [
    __shared_get_shiwakeKekkeCol(),
    {
      id: 'destinationStoreId',
      label: '配布店舗',
      form: {},
      forSelect: {
        config: {
          modelName: 'store',
          orderBy: [{code: 'asc'}],
        },
      },
    },
  ]

  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: new Fields(columns).transposeColumns(),
    formData: {
      destination: ucar.destination || '',
      destinationStoreId: ucar.destinationStoreId || null,
    },
  })

  const handleSubmit = async (data: any) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const {result} = await doStandardPrisma('ucar', 'update', {
        where: {id: ucar.id},
        data: {
          destination: data.destination || null,
          destinationStoreId: data.destinationStoreId || null,
        },
      })

      if (result) {
        toast.success('仕分結果と配布店舗を更新しました。')
      } else {
        toast.error('更新に失敗しました。')
      }
    } catch (error) {
      console.error('更新エラー:', error)
      toast.error('更新中にエラーが発生しました。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FitMargin className="p-4">
      <C_Stack className="mx-auto w-fit gap-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold mb-2">情報変更</h1>
          <p className="text-gray-600">査定No: {ucar.sateiID}</p>
        </div>

        <Card>
          <FitMargin className="p-6">
            <BasicForm latestFormData={latestFormData} onSubmit={handleSubmit}>
              <C_Stack className="gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '更新中...' : '更新'}
                </Button>
              </C_Stack>
            </BasicForm>
          </FitMargin>
        </Card>
      </C_Stack>
    </FitMargin>
  )
}

export default EditInfoForm
