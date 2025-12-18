'use client'

import {Fields} from '@cm/class/Fields/Fields'

import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack} from '@cm/components/styles/common-components/common-components'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'
import {UCAR_CONSTANTS} from '@app/(apps)/ucar/(constants)/ucar-constants'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {HREF} from '@cm/lib/methods/urls'
import {useRouter} from 'next/navigation'
import {TextRed} from '@cm/components/styles/common-components/Alert'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

export const DataInitiationForm = ({stores, ucar, toggleLoad, session, sateiID_Input, hasUpassData}) => {
  const {addQuery, query, accessScopes} = useGlobal()
  const scopes = accessScopes()
  const {isHQ, isStoreManager, isSales, carWhere, userId, storeId} = scopes.getUcarProps()
  const router = useRouter()

  // 基本フィールド（店舗、自力走行可否、備考）
  const baseColumns = UCAR_CONSTANTS.columns.getQrSheetIssueInfoCol({stores})

  // UPASSDBにデータがない場合の追加フィールド
  const tmpColumns = hasUpassData ? [] : UCAR_CONSTANTS.columns.getTmpCarInfoCol()
  const allColumns = new Fields([...baseColumns, ...tmpColumns]).transposeColumns()

  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: allColumns,
  })

  const onSubmit = async data => {
    const payload = {
      sateiID: sateiID_Input,
      userId: userId,
      storeId: storeId,
      qrIssuedAt: toUtc(new Date()),
      ...data,
    }

    return
    await toggleLoad(async () => {
      const res = await doStandardPrisma('ucar', 'upsert', {
        where: {
          sateiID: String(sateiID_Input),
        },
        create: payload,
        update: payload,
      })

      toastByResult(res)
      if (res.success) {
        // QRシートページへ遷移
        router.push(HREF(`/ucar/qr`, {sateiID: sateiID_Input}, query))
      }
    })
  }

  if (!stores) {
    return <></>
  }
  return (
    <C_Stack className="gap-4">
      {!hasUpassData && <TextRed className="text-sm  mb-2">UPASSDBにデータがありません。車両情報を入力してください。</TextRed>}
      <BasicForm
        {...{
          alignMode: 'console',
          onSubmit,
          latestFormData,
        }}
      >
        <div className="flex justify-center mt-6">
          <Button color="red">確定</Button>
        </div>
      </BasicForm>
    </C_Stack>
  )
}
