'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDashboardData } from './hooks/useDashboardData'
import { TairyuDaisuTable } from './components/TairyuDaisuTable'
import { TairyuPieChart } from './components/TairyuPieChart'
import { LeadTimeBarChart } from './components/LeadTimeBarChart'
import { OtherMetricsTable } from './components/OtherMetricsTable'
import { LTProcessDetailModal } from './components/LTProcessDetailModal'
import { PeriodSelector } from './components/PeriodSelector'
import { UcarProcessCl } from '@app/(apps)/ucar/class/UcarProcessCl'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { Card } from '@cm/shadcn/ui/card'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { Alert } from '@cm/components/styles/common-components/Alert'


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

  const { query } = useGlobal()

  // --- 年フィルタ（テーブル用） ---
  const year = query.year ? Number(query.year) : new Date().getFullYear()

  // --- 期間フィルタ（LTグラフ用、デフォルト: 過去3ヶ月前〜当月末） ---
  const ltPeriodStart = query.ltStart ?? threeMonthsAgoStart()
  const ltPeriodEnd = query.ltEnd ?? thisMonthEnd()

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

  // --- データ取得 ---
  const { dashboardData, isLoading, error, periodLTData, isLTLoading } =
    useDashboardData(ltPeriodStart, ltPeriodEnd)

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

  // --- 期間セレクタのコールバック ---
  const handleChangePeriod = useCallback(
    (start: string | undefined, end: string | undefined) => {
      updateQuery({ ltStart: start, ltEnd: end })
    },
    [updateQuery]
  )

  return (
    <div className="p-4 mx-auto max-w-[1370px]">
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-4">

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

        <Alert color='yellow' className={`leaning-4 text-xs p-1`}>
          ・集計上の「M月」は、「QRシートがその月に発行されたものの中での計算」であることを意味します。<br />
          ・LT / 滞留の算出対象車両は、本QRシステム上で「小売 / CPO / オンライン販売」として仕分けられたものです。<br />
          ・「その他指標」に関しては、全車両（卸 / スクラップ含む）で算出されます。<br />
          ・工程の区分の変更や、旧QRシステムの中で移行不可能なデータがあるため、旧集計ページとは数値にズレがあります。<br />
          ・2026年2月以降のデータは全て新QRシステムで発行されたデータとなり、最も正確な数値・計算と言えます。
        </Alert>
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
          <C_Stack className={`gap-4`} >
            <R_Stack className={` items-stretch`}>
              <Card className={`w-[900px]`}>
                <div><TairyuDaisuTable data={dashboardData} year={year} /></div>
              </Card>

              <Card className={`w-[400px]`}>
                <div>現在台数別グラフ</div>
                <div><TairyuPieChart data={dashboardData} /></div>
              </Card>
            </R_Stack>

            <R_Stack className={` items-stretch`}>
              <Card className={`w-[900px]`}>
                工程別平均LT
                <div><OtherMetricsTable data={dashboardData} year={year} /></div>
              </Card>

              <Card className={`w-[400px]`}>
                <div>LTグラフ</div>
                <div>
                  <PeriodSelector
                    periodStart={ltPeriodStart}
                    periodEnd={ltPeriodEnd}
                    onChangePeriod={handleChangePeriod}
                    resetButtonLabel="直近3ヶ月"
                    className="flex items-center justify-center gap-2 text-xs mb-3"
                  />

                  {isLTLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <LeadTimeBarChart data={periodLTData ?? []} onBarClick={handleLTBarClick} />
                  )}
                </div>
              </Card>
            </R_Stack>
          </C_Stack>
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
