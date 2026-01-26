'use client'

import { Fields } from '@cm/class/Fields/Fields'

import { Button } from '@cm/components/styles/common-components/Button'
import { C_Stack } from '@cm/components/styles/common-components/common-components'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { toastByResult } from '@cm/lib/ui/notifications'
import { UCAR_CONSTANTS } from '@app/(apps)/ucar/(constants)/ucar-constants'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { HREF } from '@cm/lib/methods/urls'
import { useRouter } from 'next/navigation'
import { TextRed, TextGreen } from '@cm/components/styles/common-components/Alert'
import { toUtc } from '@cm/class/Days/date-utils/calculations'
import { useEffect, useEffectEvent } from 'react'

export const DataInitiationForm = ({ stores, ucar, toggleLoad, session, sateiID_Input, hasUpassData }) => {
  const { addQuery, query, accessScopes } = useGlobal()
  const scopes = accessScopes()
  const { isHQ, userId, storeId } = scopes.getUcarProps()
  const router = useRouter()

  // 発行済み判定
  const isQrIssued = !!ucar?.qrIssuedAt

  // 基本フィールド（店舗、自力走行可否、備考）
  const baseColumns = UCAR_CONSTANTS.columns.getQrSheetIssueInfoCol({ stores })

  // UPASSDBにデータがない場合の追加フィールド
  const tmpColumns = hasUpassData ? [] : UCAR_CONSTANTS.columns.getTmpCarInfoCol()
  const allColumns = new Fields([...baseColumns, ...tmpColumns]).transposeColumns()

  const { BasicForm, latestFormData, ReactHookForm } = useBasicFormProps({
    columns: allColumns,
    formData: ucar,
  })

  useEffect(() => {
    if (ucar) {
      allColumns.flat().forEach(column => {
        ReactHookForm.setValue(column.id, ucar[column.id])
      })
      // ReactHookForm.setValue('sateiID', ucar.sateiID)
      // ReactHookForm.setValue('userId', ucar.userId)
      // ReactHookForm.setValue('storeId', ucar.storeId)
      // ReactHookForm.setValue('qrIssuedAt', ucar.qrIssuedAt)
      // ReactHookForm.setValue('remarks', ucar.remarks)
    }
  }, [ucar])

  const onSubmit = async data => {
    const payload = {

    }

    await toggleLoad(async () => {
      const res = await doStandardPrisma('ucar', 'upsert', {
        where: {
          sateiID: String(sateiID_Input),
        },
        create: {
          sateiID: sateiID_Input,
          userId: userId,
          storeId: storeId,
          qrIssuedAt: toUtc(new Date()),
          ...data,
        },
        update: {
          userId: userId,
          storeId: storeId,
          ...data,
        },
      })

      toastByResult(res)
      if (res.success) {
        // QRシートページへ遷移
        router.push(HREF(`/ucar/qr`, { sateiID: sateiID_Input }, query))
      }
    })
  }

  if (!stores) {
    return <></>
  }

  return (
    <C_Stack className="gap-4">
      {isQrIssued && <TextGreen className="text-sm mb-2">QRシート発行済みです。データを更新できます。</TextGreen>}
      {!hasUpassData && <TextRed className="text-sm mb-2">UPASSDBにデータがありません。車両情報を入力してください。</TextRed>}
      <BasicForm
        {...{
          alignMode: 'console',
          onSubmit,
          latestFormData,
        }}
      >
        <div className="flex justify-center mt-6">
          <Button color="red">{isQrIssued ? 'データ更新 / 再発行' : 'QRシート発行'}</Button>
        </div>
      </BasicForm>
    </C_Stack>
  )
}
