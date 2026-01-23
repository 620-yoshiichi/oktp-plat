'use client'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from '@cm/components/styles/common-components/Button'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { UCAR_CODE } from '@app/(apps)/ucar/class/UCAR_CODE'
import { ucarData, UcarCL } from '@app/(apps)/ucar/class/UcarCL'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { knockEmailApi } from '@cm/lib/methods/knockEmailApi'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { UseRecordsReturn } from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'

type UcarRequestFormProps = {
  UcarData: ucarData
  session: any
  onClose: () => void
  UseRecordsReturn?: UseRecordsReturn
}

export default function UcarRequestForm(props: UcarRequestFormProps) {
  const { UcarData, session, onClose, UseRecordsReturn } = props
  const [requestType, setRequestType] = useState(UCAR_CODE.REQUEST_TYPES.raw.HIDE.code)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('申請理由を入力してください')
      return
    }

    setIsSubmitting(true)
    try {
      // 申請データを作成
      const { result: ucarRequest } = await doStandardPrisma('ucarRequest', 'create', {
        data: {
          sateiID: UcarData.sateiID,
          requestType,
          reason,
          status: 'pending',
          userId: session?.id,
          ucarId: UcarData.id,
        },
      })

      // システム管理者（role=管理者）を取得
      const { result: adminUsers } = await doStandardPrisma('user', 'findMany', {
        where: { role: '管理者' },
      })

      // メール送信
      if (adminUsers && adminUsers.length > 0) {
        const ucarInst = new UcarCL(UcarData)
        const requestTypeLabel = UCAR_CODE.REQUEST_TYPES.byCode(requestType)?.label || ''

        const text = [
          `【Ucar申請通知】`,
          ``,
          `以下の申請が提出されました。`,
          ``,
          `■ 申請情報`,
          `申請区分: ${requestTypeLabel}`,
          `申請理由: ${reason}`,
          `申請者: ${session?.name ?? ''}`,
          `申請日時: ${formatDate(new Date(), 'YYYY/MM/DD HH:mm')}`,
          ``,
          `■ 車両情報`,
          `査定番号: ${ucarInst.notation.sateiID ?? ''}`,
          `店舗名: ${ucarInst.notation.storeName ?? ''}`,
          `スタッフ名: ${ucarInst.notation.staffName ?? ''}`,
          `車名: ${ucarInst.notation.modelName ?? ''}`,
          `プレート: ${ucarInst.notation.plate ?? ''}`,
          ``,
          `※申請管理ページで確認・承諾してください。`,
        ].join('\n')

        const adminEmails = adminUsers.filter(u => u.email).map(u => u.email as string)

        if (adminEmails.length > 0) {
          await knockEmailApi({
            subject: `【Ucar申請】${requestTypeLabel} - ${UcarData.sateiID}`,
            text,
            to: [],
          })
        }
      }

      toast.success('申請を送信しました')
      onClose()

      // リスト更新
      if (UseRecordsReturn?.refreshSingleRecord) {
        await UseRecordsReturn.refreshSingleRecord({
          findUniqueWhereArgs: { sateiID: UcarData.sateiID },
        })
      }
    } catch (error) {
      console.error('申請エラー:', error)
      toast.error('申請の送信に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const ucarInst = new UcarCL(UcarData)

  return (
    <C_Stack className="gap-6 min-w-[400px]">
      <h2 className="text-lg font-bold">申請</h2>

      {/* 車両情報 */}
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">対象車両</h3>
        <div className="text-sm space-y-1">
          <div>査定番号: {ucarInst.notation.sateiID}</div>
          <div>車名: {ucarInst.notation.modelName}</div>
          <div>プレート: {ucarInst.notation.plate}</div>
          <div>店舗: {ucarInst.notation.storeName}</div>
        </div>
      </div>

      {/* 申請区分 */}
      <div>
        <label className="block font-semibold mb-2">申請区分</label>
        <select
          className="w-full border rounded p-2"
          value={requestType}
          onChange={e => setRequestType(e.target.value)}
        >
          {UCAR_CODE.REQUEST_TYPES.array.map(item => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* 申請理由 */}
      <div>
        <label className="block font-semibold mb-2">
          申請理由 <span className="text-red-500">*</span>
        </label>
        <textarea
          className="w-full border rounded p-2 min-h-[100px]"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="申請理由を入力してください"
        />
      </div>

      {/* ボタン */}
      <R_Stack className="justify-end gap-2">
        <Button color="gray" onClick={onClose} disabled={isSubmitting}>
          キャンセル
        </Button>
        <Button color="blue" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '送信中...' : '申請する'}
        </Button>
      </R_Stack>
    </C_Stack>
  )
}
