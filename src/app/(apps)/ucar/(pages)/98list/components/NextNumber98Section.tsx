'use client'

import React, { useState, useTransition } from 'react'
import { R_Stack } from '@cm/components/styles/common-components/common-components'
import { Button } from '@cm/components/styles/common-components/Button'
import { setLastUsedNumber98 } from '@app/(apps)/ucar/(lib)/num98/search98Number'
import { cl } from '@cm/lib/methods/common'

type Props = {
  nextNumber98Info: {
    nextNumber98: string | null
    lastIssuedNumber: string | null
  }
  onRefresh: () => void
  onNumberClick: (number: string) => void
  isPending: boolean
}

export function NextNumber98Section({
  nextNumber98Info,
  onRefresh,
  onNumberClick,
  isPending,
}: Props) {
  const [lastUsedInput, setLastUsedInput] = useState('')
  const [isSettingPending, startSettingTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSetLastUsed = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lastUsedInput.trim()) return

    startSettingTransition(async () => {
      const result = await setLastUsedNumber98(lastUsedInput)
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.success && result.nextNumber98
          ? `${result.message}（次の番号: ${result.nextNumber98}）`
          : result.message,
      })
      if (result.success) {
        setLastUsedInput('')
        onRefresh()
      }
    })
  }

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
      <R_Stack className="gap-8 items-start flex-wrap">
        {/* 次の98番号表示 */}
        <div>
          <h2 className="text-sm font-semibold text-blue-800 mb-1">次の98番号</h2>
          <div className="flex items-center gap-2">
            {nextNumber98Info.nextNumber98 ? (
              <button
                className="text-2xl font-bold text-blue-600 hover:underline"
                onClick={() => onNumberClick(nextNumber98Info.nextNumber98!)}
              >
                {nextNumber98Info.nextNumber98}
              </button>
            ) : (
              <span className="text-lg text-gray-500">設定なし</span>
            )}
            <Button size="sm" onClick={onRefresh} disabled={isPending}>
              更新
            </Button>
          </div>
          {nextNumber98Info.lastIssuedNumber && (
            <p className="text-xs text-blue-600 mt-1">最後に使用: {nextNumber98Info.lastIssuedNumber}</p>
          )}
        </div>

        {/* 最後に使用した98番号を入力 */}
        <div>
          <h2 className="text-sm font-semibold text-blue-800 mb-1">最後に使用した98番号を入力</h2>
          <form onSubmit={handleSetLastUsed}>
            <R_Stack className="gap-2">
              <input
                type="text"
                value={lastUsedInput}
                onChange={(e) => setLastUsedInput(e.target.value)}
                placeholder="98番号（例: 9800100）"
                className="border rounded px-2 py-1 w-[180px] text-sm"
              />
              <Button type="submit" size="sm" disabled={isSettingPending || !lastUsedInput.trim()}>
                {isSettingPending ? '設定中...' : '設定'}
              </Button>
            </R_Stack>
          </form>
          <p className="text-xs text-gray-500 mt-1">入力した番号の次が「次の98番号」になります</p>
        </div>
      </R_Stack>

      {/* メッセージ表示 */}
      {message && (
        <div
          className={cl(
            'mt-3 p-2 rounded text-sm',
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          )}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}
