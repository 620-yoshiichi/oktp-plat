'use client'

import React, { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { Button } from '@cm/components/styles/common-components/Button'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { NumHandler } from '@cm/class/NumHandler'
import type { Search98NumberResult } from '@app/(apps)/ucar/(lib)/num98/search98Number'
import { setLastUsedNumber98 } from '@app/(apps)/ucar/(lib)/num98/search98Number'
import { cl } from '@cm/lib/methods/common'

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ucar履歴 */}


              {/* OldCars_Base履歴 */}
              <C_Stack className={`items-start w-fit`}>
                <h2 className="text-lg font-semibold mb-2">古物(OldCars)履歴 ({searchResult.oldCarsHistory.length}件)</h2>
                <OldCarsHistoryTable oldCarsHistory={searchResult.oldCarsHistory} />
              </C_Stack>

              {/* ZAIKO履歴 */}
              <C_Stack className={`items-start w-fit`}>
                <h2 className="text-lg font-semibold mb-2">在庫履歴 ({searchResult.zaikoHistory.length}件)</h2>
                <ZaikoHistoryTable zaikoHistory={searchResult.zaikoHistory} />
              </C_Stack>

              <C_Stack className={`items-start w-fit`}>
                <h2 className="text-lg font-semibold mb-2">Ucar履歴 ({searchResult.ucarHistory.length}件)</h2>
                <UcarHistoryTable ucarHistory={searchResult.ucarHistory} />
              </C_Stack>
            </div>
          )}
        </C_Stack>
      )}

      {/* 検索前の説明 */}
      {!searchResult && !initialQuery && (
        <div className="text-gray-500 bg-gray-50 p-6 rounded">
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

/** 次の98番号セクション */
function NextNumber98Section({
  nextNumber98Info,
  onRefresh,
  onNumberClick,
  isPending,
}: {
  nextNumber98Info: Props['nextNumber98Info']
  onRefresh: () => void
  onNumberClick: (number: string) => void
  isPending: boolean
}) {
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

/** 98番号情報と利用可否表示 */
function Number98Info({ searchResult }: { searchResult: Search98NumberResult }) {
  const { number98, isAvailable, unavailableReasons } = searchResult

  if (!number98) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <p className="text-yellow-800 font-semibold">{unavailableReasons[0]?.detail}</p>
      </div>
    )
  }

  return (
    <div className={cl('border rounded p-4', isAvailable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')}>
      <R_Stack className="gap-8 items-start flex-wrap">
        {/* 98番号基本情報 */}
        <div>
          <h2 className="text-lg font-semibold mb-2">98番号: {number98.number}</h2>
          <div className="text-sm space-y-1">
            <p>ソート番号: {number98.sortNumber ?? '-'}</p>
            <p>作成日: {formatDate(number98.createdAt, 'YYYY/MM/DD HH:mm')}</p>
            {number98.updatedAt && <p>更新日: {formatDate(number98.updatedAt, 'YYYY/MM/DD HH:mm')}</p>}
          </div>
        </div>

        {/* 利用可否判定 */}
        <div>
          <div
            className={cl(
              'inline-block px-4 py-2 rounded text-lg font-bold mb-3',
              isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            )}
          >
            {isAvailable ? '✓ 利用可能' : '✗ 利用不可'}
          </div>

          {/* 条件チェック結果一覧 */}
          <div className="space-y-1">
            {unavailableReasons.map((reason, i) => (
              <div
                key={i}
                className={cl(
                  'text-sm flex items-start gap-2 p-1.5 rounded',
                  reason.matched ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                )}
              >
                <span className="font-bold shrink-0">{reason.matched ? '✗' : '✓'}</span>
                <span>
                  <span className="font-semibold">{reason.condition}:</span> {reason.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      </R_Stack>
    </div>
  )
}

/** 部分一致リスト */
function PartialMatchList({
  searchList,
  onNumberClick,
}: {
  searchList: Props['searchList']
  onNumberClick: (number: string) => void
}) {
  return CsvTable({
    records: searchList.map((item) => ({
      className: item.occupied ? '[&_td]:!bg-yellow-50' : '',
      csvTableRow: [
        {
          label: '98番号',
          cellValue: (
            <button className="t-link text-left" onClick={() => onNumberClick(item.number)}>
              {item.number}
            </button>
          ),
        },
        { label: 'ソート番号', cellValue: item.sortNumber ?? '-' },
        { label: '占有', cellValue: item.occupied ? 'ON' : 'OFF' },
        { label: 'Ucar数', cellValue: item.ucarCount },
        { label: '古物数', cellValue: item.oldCarsCount },
      ],
    })),
  }).WithWrapper({ className: 'max-h-[300px] ' })
}

/** Ucar履歴テーブル */
function UcarHistoryTable({ ucarHistory }: { ucarHistory: Search98NumberResult['ucarHistory'] }) {
  if (ucarHistory.length === 0) {
    return <p className="text-gray-500 text-sm">データなし</p>
  }

  return CsvTable({
    records: ucarHistory.map((ucar) => ({
      csvTableRow: [
        { label: '査定ID', cellValue: ucar.sateiID },
        { label: 'プレート', cellValue: ucar.plate ?? '-' },
        { label: '行先', cellValue: ucar.destination ?? '-' },
        { label: '仕入伝票', cellValue: ucar.NO_SIRETYUM ?? '-' },
        { label: '仕入日', cellValue: ucar.DD_SIIRE ? formatDate(ucar.DD_SIIRE, 'YYYY/MM/DD') : '-' },
        { label: '登録日', cellValue: formatDate(ucar.createdAt, 'YYYY/MM/DD') },
      ],
    })),
  }).WithWrapper({ className: 'max-h-[400px] ' })
}

/** OldCars履歴テーブル */
function OldCarsHistoryTable({ oldCarsHistory }: { oldCarsHistory: Search98NumberResult['oldCarsHistory'] }) {
  if (oldCarsHistory.length === 0) {
    return <p className="text-gray-500 text-sm">データなし</p>
  }

  return CsvTable({
    records: oldCarsHistory.map((oldCar) => {
      const price = oldCar.KI_HANKAKA ? Number(oldCar.KI_HANKAKA) : 0
      const isPriceZero = price === 0

      return {
        className: isPriceZero ? '[&_td]:!bg-red-100' : '',
        csvTableRow: [
          { label: '仕入伝票', cellValue: oldCar.NO_SIRETYUM ?? '-' },
          { label: '車名', cellValue: oldCar.MJ_SYAMEI ?? '-' },
          { label: '車台番号', cellValue: oldCar.NO_SYADAIBA ?? '-' },
          { label: '仕入日', cellValue: oldCar.DD_SIIRE ? formatDate(oldCar.DD_SIIRE, 'YYYY/MM/DD') : '-' },
          { label: '仕入金額', cellValue: oldCar.KI_SIIREKA ? NumHandler.WithUnit(Number(oldCar.KI_SIIREKA), '円') : '-' },
          {
            label: '売上金額',
            cellValue: (
              <span className={isPriceZero ? 'text-red-600 font-bold' : ''}>
                {isPriceZero ? '未設定(0)' : NumHandler.WithUnit(price, '円')}
              </span>
            ),
          },
          { label: '売上日', cellValue: oldCar.DD_URIAGE ? formatDate(oldCar.DD_URIAGE, 'YYYY/MM/DD') : '-' },
          { label: '売上区分', cellValue: oldCar.KB_URIAGE ?? '-' },
        ],
      }
    }),
  }).WithWrapper({ className: 'max-h-[400px] ' })
}

/** 在庫履歴テーブル */
function ZaikoHistoryTable({ zaikoHistory }: { zaikoHistory: Search98NumberResult['zaikoHistory'] }) {
  if (zaikoHistory.length === 0) {
    return <p className="text-gray-500 text-sm">データなし</p>
  }

  return CsvTable({
    records: zaikoHistory.map((zaiko) => ({
      csvTableRow: [
        { label: '車名', cellValue: zaiko.MJ_FURUSYAM ?? '-' },
        { label: '車台番号', cellValue: zaiko.NO_SYADAIBA ?? '-' },
        { label: '仕入日', cellValue: zaiko.DD_SIIRE ? formatDate(zaiko.DD_SIIRE, 'YYYY/MM/DD') : '-' },
        { label: '在庫状態', cellValue: zaiko.MJ_ZAIKOST ?? '-' },
        { label: '在庫店舗', cellValue: zaiko.CD_ZAIKOTEN ?? '-' },
      ],
    })),
  }).WithWrapper({ className: 'max-h-[400px] ' })
}
