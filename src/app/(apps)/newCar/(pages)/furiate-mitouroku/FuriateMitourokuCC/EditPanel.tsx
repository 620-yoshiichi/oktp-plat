'use client'

import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { Fields } from '@cm/class/Fields/Fields'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { Button } from '@cm/components/styles/common-components/Button'
import { Paper } from '@cm/components/styles/common-components/paper'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { toastByResult } from '@cm/lib/ui/notifications'
import { differenceInDays } from 'date-fns'

import React from 'react'

const ReadOnlyField = ({ label, value }: { label: string; value: any }) => (
  <R_Stack className={`items-start gap-2 border-b border-gray-100 py-1.5`}>
    <span className={`w-[120px] shrink-0 text-xs text-gray-500`}>{label}</span>
    <span className={`text-sm font-medium`}>{value ?? '-'}</span>
  </R_Stack>
)

export const EditPanel = ({ car, onClose }: { car: any; onClose: () => void }) => {
  const { toggleLoad } = useGlobal()

  const elapsedDays = car.DD_FR ? differenceInDays(new Date(), new Date(car.DD_FR)) : 0

  const torokuYotei = car.m1_toroku_prediction ? new Date(car.m1_toroku_prediction) : null
  const isOverdue = torokuYotei ? torokuYotei < new Date() : false

  const { BasicForm, latestFormData } = useBasicFormProps({
    formData: {
      m1_toroku_prediction: car.m1_toroku_prediction,
      furiate_chien_riyu: car.furiate_chien_riyu ?? '',
      nouki_mishitei_riyu: car.nouki_mishitei_riyu ?? '',
    },
    columns: new Fields([
      { id: `m1_toroku_prediction`, label: `登録予定`, type: `date`, form: {} },
      { id: `furiate_chien_riyu`, label: `遅延理由`, form: {} },
      { id: `nouki_mishitei_riyu`, label: `納期を指定しなかった理由`, form: {} },
    ]).transposeColumns(),
  })

  const onSubmit = async (data: any) => {
    await toggleLoad(async () => {
      const res = await doStandardPrisma(`newCar`, `update`, {
        where: { id: car.id },
        data: {
          m1_toroku_prediction: data.m1_toroku_prediction || null,
          furiate_chien_riyu: data.furiate_chien_riyu || null,
          nouki_mishitei_riyu: data.nouki_mishitei_riyu || null,
        },
      })
      toastByResult(res)
    })
  }

  return (
    <Paper className={`col-stack gap-0`}>
      <R_Stack className={`mb-3 items-center justify-between`}>
        <span className={`text-sm font-bold`}>確認修正</span>
        <button className={`text-xs text-gray-400 hover:text-gray-600`} onClick={onClose}>
          ✕ 閉じる
        </button>
      </R_Stack>

      <C_Stack className={`gap-0`}>
        <div className={`mb-2 border-b border-gray-300 pb-1 text-xs font-bold text-gray-600`}>DB情報</div>

        <ReadOnlyField label="ID" value={car.APPINDEX} />
        <ReadOnlyField label="注文番号" value={car.NO_CYUMON} />
        <ReadOnlyField label="振り当て日" value={car.DD_FR ? formatDate(car.DD_FR) : null} />
        <ReadOnlyField label="受注日" value={car.DD_JUCYU ? formatDate(car.DD_JUCYU) : null} />
        <ReadOnlyField label="車名" value={car.KJ_KURUMAME} />
        <ReadOnlyField label="買主名" value={car.KJ_KAINMEI1} />
        <ReadOnlyField label="名義人名" value={car.KJ_MEIGIME1} />
        <ReadOnlyField label="拠点名" value={car.Store?.name} />
        <ReadOnlyField label="スタッフ名" value={car.User?.name} />
        <ReadOnlyField
          label="経過日数"
          value={
            <span className={`font-bold ${elapsedDays >= 100 ? 'text-red-600' : elapsedDays >= 50 ? 'text-orange-600' : ''}`}>
              {elapsedDays}
            </span>
          }
        />
        <ReadOnlyField
          label="注文番号（経過）"
          value={
            <span>
              {car.NO_CYUMON} ({elapsedDays}日)
            </span>
          }
        />
      </C_Stack>

      <div className={`mb-2 mt-4 border-b border-red-300 pb-1 text-xs font-bold text-red-600`}>編集項目</div>

      <BasicForm
        alignMode="col"
        latestFormData={latestFormData}
        onSubmit={async data => {
          await onSubmit(data)
        }}
      >
        <C_Stack className={`gap-2`}>
          {/* <ReadOnlyField
            label="登録希望日超過"
            value={
              isOverdue ? (
                <span className={`rounded bg-red-100 px-2 py-0.5 font-bold text-red-600`}>超過</span>
              ) : torokuYotei ? (
                <span className={`text-green-600`}>未超過</span>
              ) : (
                '-'
              )
            }
          /> */}
          <Button>確定</Button>
        </C_Stack>
      </BasicForm>
    </Paper>
  )
}
