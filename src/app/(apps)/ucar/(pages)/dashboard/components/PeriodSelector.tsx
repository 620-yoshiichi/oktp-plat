'use client'

type Props = {
  /** YYYY-MM-DD 形式 */
  periodStart: string
  /** YYYY-MM-DD 形式 */
  periodEnd: string
  /** 開始・終了を同時に更新（undefined でクエリから削除 → 当月デフォルトに戻る） */
  onChangePeriod: (start: string | undefined, end: string | undefined) => void
}

export function PeriodSelector({ periodStart, periodEnd, onChangePeriod }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <label className="font-medium text-gray-600">開始</label>
      <input
        type="date"
        className="border rounded px-2 py-1 text-sm bg-white"
        value={periodStart}
        onChange={e => onChangePeriod(e.target.value || undefined, periodEnd)}
      />
      <span className="text-gray-400">〜</span>
      <label className="font-medium text-gray-600">終了</label>
      <input
        type="date"
        className="border rounded px-2 py-1 text-sm bg-white"
        value={periodEnd}
        onChange={e => onChangePeriod(periodStart, e.target.value || undefined)}
      />
      <button
        className="text-xs text-blue-600 hover:text-blue-800 underline ml-1"
        onClick={() => onChangePeriod(undefined, undefined)}
      >
        当月に戻す
      </button>
    </div>
  )
}
