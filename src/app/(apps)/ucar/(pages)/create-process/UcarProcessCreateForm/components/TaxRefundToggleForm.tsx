'use client'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from '@cm/components/styles/common-components/Button'
import { cn } from '@cm/shadcn/lib/utils'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

type Props = {
  UcarData: {
    id: number
    henkinRequired: boolean | null
  }
  onUpdate: (henkinRequired: boolean) => void
}

/**
 * 自動車税返金有無の切り替えフォーム（常に表示）
 */
export const TaxRefundToggleForm = ({ UcarData, onUpdate }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currentValue = UcarData.henkinRequired

  const handleToggle = async (henkinRequired: boolean) => {
    // 同じ値の場合は何もしない
    if (currentValue === henkinRequired) return

    setIsSubmitting(true)
    try {
      await doStandardPrisma(`ucar`, `update`, {
        where: { id: UcarData.id },
        data: { henkinRequired },
      })
      const message = henkinRequired ? '返金ありに変更しました。' : '返金なしに変更しました。'
      toast.success(message)
      onUpdate(henkinRequired)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <span className="font-bold">自動車税返金:</span>
      <div className="flex gap-2">
        <Button
          color={currentValue === true ? 'sub' : 'gray'}
          onClick={() => handleToggle(true)}
          disabled={isSubmitting}
          className={cn('min-w-[80px]', currentValue === true ? 'ring-2 ring-blue-500' : 'opacity-60')}
        >
          返金あり
        </Button>
        <Button
          color={currentValue === false ? 'sub' : 'gray'}
          onClick={() => handleToggle(false)}
          disabled={isSubmitting}
          className={cn('min-w-[80px]', currentValue === false ? 'ring-2 ring-blue-500' : 'opacity-60')}
        >
          返金なし
        </Button>
      </div>
      {currentValue === null && <span className="text-red-500 text-sm">※選択してください</span>}
    </div>
  )
}
