'use client'

type Props = {
  /** YYYY-MM-DD 形式 */
  periodStart: string
  /** YYYY-MM-DD 形式 */
  periodEnd: string
  /** 開始・終了を同時に更新（undefined でクエリから削除 → デフォルトに戻る） */
  onChangePeriod: (start: string | undefined, end: string | undefined) => void
  /** リセットボタンのラベル（デフォルト: "当月に戻す"） */
  resetButtonLabel?: string
  /** コンテナに追加するクラス名 */
  className?: string
}

export function PeriodSelector({
  periodStart,
  periodEnd,
  onChangePeriod,
  resetButtonLabel = '当月に戻す',
  className,
}: Props) {
  return (
    <div className={className ?? 'flex items-center justify-center gap-2 text-xs'}>
      <label className="text-gray-500">開始</label>
      <input
        type="date"
        className="border rounded px-1.5 py-0.5 text-xs bg-white"
        value={periodStart}
        onChange={e => onChangePeriod(e.target.value || undefined, periodEnd)}
      />
      <span className="text-gray-400">〜</span>
      <label className="text-gray-500">終了</label>
      <input
        type="date"
        className="border rounded px-1.5 py-0.5 text-xs bg-white"
        value={periodEnd}
        onChange={e => onChangePeriod(periodStart, e.target.value || undefined)}
      />
      <button
        className="text-xs text-blue-600 hover:text-blue-800 underline"
        onClick={() => onChangePeriod(undefined, undefined)}
      >
        {resetButtonLabel}
      </button>
    </div>
  )
}
