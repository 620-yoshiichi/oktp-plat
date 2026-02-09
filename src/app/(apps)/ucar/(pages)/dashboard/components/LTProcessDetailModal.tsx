'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { fetchLTProcessCars, RetentionCarDetail } from '../server-actions'
import { UcarProcessTable } from './UcarProcessTable'

type Props = {
  processKey: string
  dashboardLabel: string
  color: string
  periodStart: string
  periodEnd: string
  onClose: () => void
}

export function LTProcessDetailModal({ processKey, dashboardLabel, color, periodStart, periodEnd, onClose }: Props) {
  const [cars, setCars] = useState<RetentionCarDetail[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetchLTProcessCars({ processKey, periodStart, periodEnd }).then(res => {
      if (res.success && res.result) {
        setCars(res.result)
      }
      setIsLoading(false)
    })
  }, [processKey, periodStart, periodEnd])

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b shrink-0 bg-white"
        style={{ borderLeftColor: color, borderLeftWidth: 4 }}
      >
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <h2 className="text-base font-bold">{dashboardLabel} LT - 対象車両一覧</h2>
          {cars && <span className="text-sm text-gray-500">({cars.length}台)</span>}
          <span className="text-xs text-gray-400 ml-2">
            期間: {periodStart} 〜 {periodEnd}
          </span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* コンテンツ */}
      <div className="overflow-auto flex-1">
        <UcarProcessTable
          cars={cars ?? []}
          isLoading={isLoading}
          options={{
            showLTBadge: true,
            focusProcessCode: processKey,
            focusColor: color,
          }}
        />
      </div>
    </div>
  )
}
