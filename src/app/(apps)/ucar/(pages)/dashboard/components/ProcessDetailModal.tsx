'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { UcarProcessCl } from '@app/(apps)/ucar/class/UcarProcessCl'
import { fetchProcessRetentionCars, RetentionCarDetail } from '../server-actions'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { getColorStyles } from '@cm/lib/methods/colors'

type Props = {
  processKey: string
  dashboardLabel: string
  color: string
  onClose: () => void
}

/** メインフロー工程一覧 */
const ALL_PROCESSES = UcarProcessCl.CODE.array?.filter(p => p.list?.includes('main')) ?? []

/** 日付間の日数差を計算 */
function calcDaysDiff(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime()
  return ms / (1000 * 60 * 60 * 24)
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

  const focusCode = UcarProcessCl.CODE.raw[processKey]?.code

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
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && cars && cars.length === 0 && (
          <div className="text-center text-gray-400 py-16">滞留車両はありません</div>
        )}

        {!isLoading && cars && cars.length > 0 && (
          <table className="text-xs border-collapse w-full">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="border px-1.5 py-1 bg-gray-200 text-left" style={{ minWidth: 100 }}>
                  査定ID
                </th>
                <th className="border px-1.5 py-1 bg-gray-200 text-left" style={{ minWidth: 140 }}>
                  車種・グレード
                </th>
                <th className="border px-1.5 py-1 bg-gray-200 text-left" style={{ minWidth: 120 }}>
                  担当店舗・スタッフ
                </th>
                <th className="border px-1.5 py-1 bg-gray-200 text-center" style={{ minWidth: 80 }}>
                  QR発行日
                </th>
                <th className="border px-1.5 py-1 bg-gray-200 text-center" style={{ minWidth: 100 }}>
                  ai21売上
                </th>
                {/* 工程別列 */}
                {ALL_PROCESSES.map(proc => {
                  const colorStyle = getColorStyles(proc.color ?? '')
                  return (
                    <th key={proc.code} className="border px-1 py-1 text-center" style={{ ...colorStyle, minWidth: 110 }}>
                      {proc.label}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {cars.map(car => {
                // 完了済み工程の配列（順序通り）
                const completedProcesses: { code: string; date: Date }[] = []
                for (const proc of ALL_PROCESSES) {
                  const dateIso = car.processMap[proc.code]
                  if (dateIso) {
                    completedProcesses.push({ code: proc.code, date: new Date(dateIso) })
                  }
                }

                // 各工程からの LT を計算
                const ltMap: Record<string, number | null> = {}
                for (let i = 0; i < completedProcesses.length - 1; i++) {
                  const from = completedProcesses[i]
                  const to = completedProcesses[i + 1]
                  ltMap[from.code] = calcDaysDiff(from.date, to.date)
                }

                // 最新完了工程
                const lastProcessCode = completedProcesses[completedProcesses.length - 1]?.code

                return (
                  <tr key={car.sateiID} className="hover:bg-blue-50/30">
                    <td className="border px-1.5 py-0.5">
                      <a
                        href={`/ucar/ucar?sateiID=${car.sateiID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-blue-600 hover:text-blue-800 underline"
                      >
                        {car.sateiID}
                      </a>
                    </td>
                    <td className="border px-1.5 py-0.5">
                      <div>{[car.tmpBrandName, car.tmpModelName].filter(Boolean).join(' ') || '-'}</div>
                      {car.tmpGrade && <div className="text-gray-500">{car.tmpGrade}</div>}
                    </td>
                    <td className="border px-1.5 py-0.5">
                      <div>{car.storeName ?? '-'}</div>
                      {car.userName && <div className="text-gray-500">{car.userName}</div>}
                    </td>
                    <td className="border px-1.5 py-0.5 text-center">{formatDate(new Date(car.qrIssuedAt), 'YY/MM/DD')}</td>
                    <td className="border px-1.5 py-0.5 text-center">
                      {car.ai21.DD_URIAGE && <div>{formatDate(car.ai21.DD_URIAGE, 'YY/MM/DD')}</div>}
                      {car.ai21.CD_ZAIKOTEN && <div className="text-gray-500 text-[10px]">{car.ai21.CD_ZAIKOTEN}</div>}
                      {car.ai21.KI_HANKAKA != null && (
                        <div className="font-bold">{(car.ai21.KI_HANKAKA / 10000).toFixed(1)}万円</div>
                      )}
                    </td>

                    {/* 工程別完了日時 + LT差分表示 */}
                    {ALL_PROCESSES.map(proc => {
                      const dateIso = car.processMap[proc.code]
                      const isCurrentProcess = proc.code === lastProcessCode
                      const isFocusProcess = proc.code === focusCode
                      const lt = ltMap[proc.code]

                      return (
                        <td
                          key={proc.code}
                          className="border px-1 py-0.5 text-center align-middle relative"
                          style={{
                            ...(dateIso
                              ? isCurrentProcess
                                ? { backgroundColor: '#ffff00' }
                                : {}
                              : { backgroundColor: '#00000070' }),
                            ...(isFocusProcess && dateIso ? { outline: '2px solid ' + color, outlineOffset: -2 } : {}),
                          }}
                        >
                          {dateIso && (
                            <>
                              <div>{formatDate(new Date(dateIso), 'YY/MM/DD(ddd)')}</div>
                              <div>{formatDate(new Date(dateIso), 'HH:mm')}</div>

                              {/* LT差分（赤丸バッジ） */}
                              {lt !== null && lt !== undefined && (
                                <div className="absolute -bottom-1 right-1 bg-red-600 text-white text-[9px] font-bold rounded-full w-7 h-4 flex items-center justify-center shadow">
                                  +{lt.toFixed(1)}
                                </div>
                              )}
                            </>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
