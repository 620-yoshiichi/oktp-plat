'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { fetchOtherMetricsCars, type FetchOtherMetricsCarsParams, type RetentionCarDetail } from '../server-actions'
import { UcarProcessTable } from './UcarProcessTable'

type Props = {
  label: string
  params: FetchOtherMetricsCarsParams
  onClose: () => void
}

export function OtherMetricsDetailModal({ label, params, onClose }: Props) {
  const [cars, setCars] = useState<RetentionCarDetail[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetchOtherMetricsCars(params).then(res => {
      if (res.success && res.result) {
        setCars(res.result)
      }
      setIsLoading(false)
    })
  }, [params.type, params.month, params.destinationCode])

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-5 py-3 border-b shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold">{label}</h2>
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
        />
      </div>
    </div>
  )
}
