'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DashboardResult, PeriodLTSummary } from './lib/calcDashboardData'
import { fetchDashboardData, fetchPeriodLT } from './server-actions'
import { ProcessSummaryTable } from './components/ProcessSummaryTable'
import { CurrentCountPieChart } from './components/CurrentCountPieChart'
import { LeadTimeBarChart } from './components/LeadTimeBarChart'
import { OtherMetricsTable } from './components/OtherMetricsTable'
import { LTProcessDetailModal } from './components/LTProcessDetailModal'
import { UcarProcessCl } from '@app/(apps)/ucar/class/UcarProcessCl'
import useModal from '@cm/components/utils/modal/useModal'

// ============================================================
// ヘルパー
// ============================================================

/** 3ヶ月前の1日の YYYY-MM-DD */
function threeMonthsAgoStart(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 3)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

/** 当月末日の YYYY-MM-DD */
function thisMonthEnd(): string {
  const d = new Date()
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`
}

// ============================================================
// メインコンポーネント
// ============================================================

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // --- 年フィルタ（テーブル用） ---
  const year = useMemo(() => {
    const raw = searchParams?.get('year')
    return raw ? Number(raw) : new Date().getFullYear()
  }, [searchParams])

  // --- 期間フィルタ（LTグラフ用、デフォルト: 過去3ヶ月前〜当月末） ---
  const ltPeriodStart = useMemo(() => {
    return searchParams?.get('ltStart') ?? threeMonthsAgoStart()
  }, [searchParams])

  const ltPeriodEnd = useMemo(() => {
    return searchParams?.get('ltEnd') ?? thisMonthEnd()
  }, [searchParams])

  // --- クエリ更新 ---
  const updateQuery = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '')
      for (const [key, val] of Object.entries(updates)) {
        if (val !== undefined) {
          params.set(key, val)
        } else {
          params.delete(key)
        }
      }
      const qs = params.toString()
      router.push(qs ? `?${qs}` : window.location.pathname, { scroll: false })
    },
    [router, searchParams]
  )

  // --- メインデータ取得（1回のみ） ---
  const [dashboardData, setDashboardData] = useState<DashboardResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    fetchDashboardData().then(res => {
      if (res.success && res.result) {
        setDashboardData(res.result)
      } else {
        setError(res.message ?? 'データの取得に失敗しました')
      }
      setIsLoading(false)
    })
  }, [])

  // --- 期間別LTデータ取得（期間変更時に再取得） ---
  const [periodLTData, setPeriodLTData] = useState<PeriodLTSummary[] | null>(null)
  const [isLTLoading, setIsLTLoading] = useState(true)

  useEffect(() => {
    setIsLTLoading(true)
    fetchPeriodLT({
      periodStart: ltPeriodStart,
      periodEnd: ltPeriodEnd,
    }).then(res => {
      if (res.success && res.result) {
        setPeriodLTData(res.result)
      }
      setIsLTLoading(false)
    })
  }, [ltPeriodStart, ltPeriodEnd])

  // --- LTモーダル（useModal使用） ---
  const ltModal = useModal<{
    processKey: string
    dashboardLabel: string
    color: string
  }>()

  const handleLTBarClick = useCallback(
    (processKey: string) => {
      const item = UcarProcessCl.CODE.raw[processKey]
      const dashProc = UcarProcessCl.getDashboardProcesses().find(p => p.key === processKey)
      if (item && dashProc) {
        ltModal.handleOpen({
          processKey,
          dashboardLabel: dashProc.dashboardLabel,
          color: item.color ?? '#888',
        })
      }
    },
    [ltModal]
  )

  // --- 利用可能な年リスト ---
  const availableYears = useMemo(() => {
    if (!dashboardData) return []
    const yrs = new Set<number>()
    for (const mk of dashboardData.months) {
      const yy = Number(mk.split('-')[0])
      yrs.add(yy < 50 ? 2000 + yy : 1900 + yy)
    }
    return Array.from(yrs).sort((a, b) => b - a)
  }, [dashboardData])

  return (
    <div className="p-4 mx-auto max-w-[1800px]">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">QRプロジェクト リードタイム概況</h1>

        {availableYears.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <label className="font-medium text-gray-600">表示年</label>
            <select
              className="border rounded px-2 py-1 text-sm bg-white"
              value={year}
              onChange={e => updateQuery({ year: e.target.value })}
            >
              {availableYears.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">{error}</div>}

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm text-gray-500">データを読み込み中...</span>
          </div>
        </div>
      )}

      {!isLoading && dashboardData && (
        <>
          <div className="flex gap-4">
            <div className="flex-2 flex flex-col gap-4 min-w-[850px]">

              <div>
                現在の滞留台数
                <ProcessSummaryTable data={dashboardData} year={year} /></div>

              <div>
                工程別平均LT
                <OtherMetricsTable data={dashboardData} year={year} />
              </div>
            </div>



            <div className="flex-2 flex flex-col gap-4 min-w-[380px]">
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="text-sm font-semibold mb-2 text-center">現在台数別グラフ</h3>
                <CurrentCountPieChart data={dashboardData} />
              </div>

              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="text-sm font-semibold mb-2 text-center">LTグラフ</h3>
                <div className="flex items-center justify-center gap-2 text-xs mb-3">
                  <label className="text-gray-500">開始</label>
                  <input
                    type="date"
                    className="border rounded px-1.5 py-0.5 text-xs bg-white"
                    value={ltPeriodStart}
                    onChange={e => updateQuery({ ltStart: e.target.value || undefined })}
                  />
                  <span className="text-gray-400">〜</span>
                  <label className="text-gray-500">終了</label>
                  <input
                    type="date"
                    className="border rounded px-1.5 py-0.5 text-xs bg-white"
                    value={ltPeriodEnd}
                    onChange={e => updateQuery({ ltEnd: e.target.value || undefined })}
                  />
                  <button
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                    onClick={() => updateQuery({ ltStart: undefined, ltEnd: undefined })}
                  >
                    直近3ヶ月
                  </button>
                </div>

                {isLTLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                ) : (
                  <LeadTimeBarChart data={periodLTData ?? []} onBarClick={handleLTBarClick} />
                )}
              </div>
            </div>
          </div>


        </>
      )}

      {/* LTグラフ用モーダル */}
      <ltModal.Modal
        style={{
          maxWidth: '98vw',
          maxHeight: '90vh',
          width: '1600px',
          overflow: 'hidden',
        }}
      >
        {ltModal.open && (
          <LTProcessDetailModal
            processKey={ltModal.open.processKey}
            dashboardLabel={ltModal.open.dashboardLabel}
            color={ltModal.open.color}
            periodStart={ltPeriodStart}
            periodEnd={ltPeriodEnd}
            onClose={ltModal.handleClose}
          />
        )}
      </ltModal.Modal>
    </div>
  )
}
