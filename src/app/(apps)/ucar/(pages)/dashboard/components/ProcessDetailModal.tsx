'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { fetchProcessRetentionCars, RetentionCarDetail } from '../server-actions'
import { UcarProcessTable } from './UcarProcessTable'

type Props = {
  processKey: string
  dashboardLabel: string
  color: string
  onClose: () => void
}

export function ProcessDetailModal({ processKey, dashboardLabel, color, onClose }: Props) {
  const [cars, setCars] = useState<RetentionCarDetail[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetchProcessRetentionCars(processKey).then(res => {
      if (res.success && res.result) {
        setCars(res.result)
      }
      setIsLoading(false)
    })
  }, [processKey])

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b shrink-0 bg-white"
        style={{ borderLeftColor: color, borderLeftWidth: 4 }}
      >
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <h2 className="text-base font-bold">{dashboardLabel} - 滞留車両一覧</h2>
          {cars && <span className="text-sm text-gray-500">({cars.length}台)</span>}
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
