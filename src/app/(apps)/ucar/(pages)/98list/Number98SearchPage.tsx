'use client'

import React, { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { Button } from '@cm/components/styles/common-components/Button'
import type { getNumber98IssueHistory, Search98NumberResult } from '@app/(apps)/ucar/(lib)/num98/search98Number'
import { Card } from '@cm/shadcn/ui/card'
import {
  NextNumber98Section,
  Number98Info,
  PartialMatchList,
  UcarHistoryTable,
  OldCarsHistoryTable,
  ZaikoHistoryTable,
} from './components'

type Props = {
  initialQuery: string
  searchResult: Search98NumberResult | null
  searchList: {
    number: string
    sortNumber: number | null
    occupied: boolean | null
    ucarCount: number
    oldCarsCount: number
  }[]
  nextNumber98Info: {
    nextNumber98: string | null
    lastIssuedNumber: string | null
  }
  issueHistory: Awaited<ReturnType<typeof getNumber98IssueHistory>>
  assignmentHistory: {
    sateiID: string
    number98: string | null
    updatedAt: Date | null
    plate: string | null
    destination: string | null
  }[]
}

export default function Number98SearchPage({ initialQuery, searchResult, searchList, nextNumber98Info }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [inputValue, setInputValue] = useState(initialQuery)

  const handleSearch = useCallback(
    (query: string) => {
      startTransition(() => {
        const params = new URLSearchParams()
        if (query.trim()) {
          params.set('q', query.trim())
        }
        router.push(`/ucar/98list?${params.toString()}`)
      })
    },
    [router]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(inputValue)
  }

  const handleNumberClick = (number: string) => {
    setInputValue(number)
    handleSearch(number)
  }

  const refreshPage = useCallback(() => {
    startTransition(() => {
      router.refresh()
    })
  }, [router])

  return (
    <div className="p-4 max-w-[1400px] mx-auto">
      <h1 className="text-xl font-bold mb-4">98番号検索・履歴確認</h1>

      {/* 次の98番号セクション */}
      <NextNumber98Section
        nextNumber98Info={nextNumber98Info}
        onRefresh={refreshPage}
        onNumberClick={handleNumberClick}
        isPending={isPending}
      />

      {/* 検索フォーム */}
      <form onSubmit={handleSubmit} className="mb-6">
        <R_Stack className="gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="98番号を入力（例: 98-0001）"
            className="border rounded px-3 py-2 w-[300px] text-base"
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? '検索中...' : '検索'}
          </Button>
        </R_Stack>
      </form>

      {/* 検索結果 */}
      {searchResult && (
        <C_Stack className="gap-6">
          {/* 98番号情報と利用可否 */}
          <Number98Info searchResult={searchResult} />

          {/* 部分一致リスト（複数ある場合） */}
          {searchList.length > 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">部分一致する98番号一覧 ({searchList.length}件)</h2>
              <PartialMatchList searchList={searchList} onNumberClick={handleNumberClick} />
            </div>
          )}

          {/* 履歴データ */}
          {searchResult.number98 && (
            <div className="flex flex-col gap-12">

              {/* Ucar履歴 */}
              <Card>
                <C_Stack className={`items-start w-fit`}>
                  <h2 className="text-lg font-semibold mb-2">Ucar履歴 ({searchResult.ucarHistory.length}件)</h2>
                  <UcarHistoryTable ucarHistory={searchResult.ucarHistory} />
                </C_Stack>
              </Card>

              {/* ZAIKO履歴 */}
              <Card>
                <C_Stack className={`items-start w-fit`}>
                  <h2 className="text-lg font-semibold mb-2">在庫履歴 ({searchResult.zaikoHistory.length}件)</h2>
                  <ZaikoHistoryTable zaikoHistory={searchResult.zaikoHistory} />
                </C_Stack>
              </Card>


              {/* OldCars_Base履歴 */}
              <Card>
                <C_Stack className={`items-start w-fit`}>
                  <h2 className="text-lg font-semibold mb-2">古物(OldCars)履歴 ({searchResult.oldCarsHistory.length}件)</h2>
                  <OldCarsHistoryTable oldCarsHistory={searchResult.oldCarsHistory} />
                </C_Stack>
              </Card>
            </div>
          )}
        </C_Stack>
      )}

      {/* 検索前の説明 */}
      {!searchResult && !initialQuery && (
        <div className="text-gray-500 bg-gray-50 p-6 rounded mb-6">
          <p className="mb-2">98番号を検索して、以下の情報を確認できます：</p>
          <ul className="list-disc list-inside space-y-1">
            <li>98番号が利用可能かどうか</li>
            <li>利用不可の場合、その理由</li>
            <li>紐づくUcar（査定データ）の履歴</li>
            <li>紐づく古物データの履歴</li>
            <li>紐づく在庫データの履歴</li>
          </ul>
        </div>
      )}
    </div>
  )
}
