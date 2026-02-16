'use client'

import { useCallback, useMemo } from 'react'
import { DashboardResult } from '../lib/calcDashboardData'
import { ProcessDetailModal } from './ProcessDetailModal'
import { LTProcessDetailModal } from './LTProcessDetailModal'
import useModal from '@cm/components/utils/modal/useModal'
import { UcarProcessCl } from '@app/(apps)/ucar/class/UcarProcessCl'

type Props = {
  data: DashboardResult
  /** 表示対象の年（例: 2025） */
  year: number
}

/** LT値の背景色（ヒートマップ風） */
function getLTBgColor(lt: number | null): string {
  if (lt === null) return ''
  if (lt <= 1) return 'bg-green-100'
  if (lt <= 3) return 'bg-yellow-50'
  if (lt <= 5) return 'bg-yellow-100'
  if (lt <= 7) return 'bg-orange-100'
  return 'bg-red-100'
}

/** 数値を小数1桁でフォーマット */
function fmtNum(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '-'
  return n.toFixed(1)
}

/** 指定月の平均LTを算出（undefined/NaNを除外） */
function calcYearAvgLT(monthlyLT: Record<string, number | null>, months: string[]): number | null {
  const vals = months.map(m => monthlyLT[m]).filter((v): v is number => v != null && Number.isFinite(v))
  if (vals.length === 0) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

/** YY-MM形式の月キーから期間（YYYY-MM-DD）を算出 */
function monthKeyToPeriod(monthKey: string): { start: string; end: string } {
  const [yy, mm] = monthKey.split('-').map(Number)
  const yyyy = yy < 50 ? 2000 + yy : 1900 + yy
  const lastDay = new Date(yyyy, mm, 0).getDate()
  return {
    start: `${yyyy}-${String(mm).padStart(2, '0')}-01`,
    end: `${yyyy}-${String(mm).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
  }
}

export function TairyuDaisuTable({ data, year }: Props) {
  const { processes, totalCount, totalAvgLT } = data









  // モーダル（滞留台数テーブル用）
  const modal = useModal<{
    processKey: string
    dashboardLabel: string
    color: string
  }>()

  // モーダル（LTセルクリック用）
  const ltModal = useModal<{
    processKey: string
    dashboardLabel: string
    color: string
    periodStart: string
    periodEnd: string
  }>()

  /** LTセルクリック時のハンドラ */
  const handleLTCellClick = useCallback(
    (proc: (typeof processes)[0], periodStart: string, periodEnd: string) => {
      ltModal.handleOpen({
        processKey: proc.processKey,
        dashboardLabel: proc.dashboardLabel,
        color: proc.color,
        periodStart,
        periodEnd,
      })
    },
    [ltModal]
  )

  // 指定年の YY プレフィックス
  const yyPrefix = String(year).slice(-2)

  // 指定年の1〜12月を全て表示（データがない月も含む）
  const visibleMonths = useMemo(() => {
    const all: string[] = []
    for (let m = 1; m <= 12; m++) {
      all.push(`${yyPrefix}-${String(m).padStart(2, '0')}`)
    }
    return all
  }, [yyPrefix])

  // 全体行の月別LT・当年平均
  const totalMonthlyLT: Record<string, number | null> = {}
  for (const m of visibleMonths) {
    const vals = processes.map(p => p.monthlyLT[m]).filter((v): v is number => v != null && Number.isFinite(v))
    totalMonthlyLT[m] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }
  const totalYearAvgLT = calcYearAvgLT(totalMonthlyLT, visibleMonths)

  // --- 工程ラベルセル ---
  const ProcessLabel = ({ proc }: { proc: (typeof processes)[0] }) => {
    const retentionDesc = UcarProcessCl.CODE.raw[proc.processKey]?.dashboardProp?.retentionDescription


    return <td className="border px-2 py-1 font-medium" style={{ borderLeft: `4px solid ${proc.color}` }}>
      <button
        className="flex items-center gap-1 w-full text-left hover:text-blue-700 cursor-pointer group"
        onClick={() =>
          modal.handleOpen({
            processKey: proc.processKey,
            dashboardLabel: proc.dashboardLabel,
            color: proc.color,
          })
        }
      >
        <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: proc.color }} />
        <div className="relative group/popover">
          <span className="truncate group-hover:underline">{proc.dashboardLabel} 後</span>
          {retentionDesc && (
            <div className="hidden group-hover/popover:block absolute -left-8 top-1/2 mt-1 z-10 bg-white border border-gray-300 rounded shadow-lg p-2 text-xs text-gray-700 min-w-[170px] max-w-xs whitespace-pre-line">
              {retentionDesc}
            </div>
          )}
        </div>
      </button>
    </td>
  }

  return (
    <>
      <div className="flex gap-4 ">
        {/* ============================================================ */}
        {/* テーブル1: 現在台数（滞留状況） */}
        {/* ============================================================ */}


        <div>
          現在の滞留台数
          <div className="border rounded-lg bg-white shadow-sm overflow-x-auto shrink-0 ">

            <table className="text-xs border-collapse">
              <thead className={`h-[45px]`}>
                <tr className="bg-gray-800 text-white">
                  <th className="border border-gray-600 px-2 py-1.5 text-left w-[140px]">工程</th>
                  <th className="border border-gray-600 px-2 py-1.5 text-center w-[80px]">
                    現在台数
                  </th>
                </tr>
              </thead>
              <tbody>
                {processes.map((proc, i) => (
                  <tr key={proc.processKey} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <ProcessLabel proc={proc} />
                    <td className="border px-2 py-1 text-center font-bold ">
                      {proc.currentCount > 0 ? proc.currentCount : '-'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td className="border px-2 py-1.5" style={{ borderLeft: '4px solid #333' }}>
                    全体
                  </td>
                  <td className="border px-2 py-1.5 text-center ">{totalCount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================ */}
        {/* テーブル2: 工程別リードタイム（LT） */}
        {/* ============================================================ */}
        <div>
          期間別の平均LT
          <div className="border rounded-lg bg-white shadow-sm overflow-x-auto min-w-0 flex-1 w-fit">
            <table className="w-full text-xs border-collapse">
              <thead className={`h-[45px]`}>
                <tr className="bg-gray-800 text-white">
                  {/* <th className="border border-gray-600 px-2 py-1.5 text-left w-[120px]">
                    CR LT
                  </th> */}

                  {/* <th className="border border-gray-600 px-2 py-1.5 text-center w-[45px] bg-red-700">
                    目標
                  </th> */}
                  <th className="border border-gray-600 px-2 py-1.5 text-center w-[55px]">全期間</th>
                  <th className="border border-gray-600 px-2 py-1.5 text-center w-[55px] bg-blue-700">
                    {year}年
                  </th>
                  {visibleMonths.map(m => {
                    const month = m.split('-')[1]
                    return <th key={m} className="border border-gray-600 px-2 py-1.5 text-center w-[60px]">
                      {m.split('-')[0]}年<br />
                      {Number(m.split('-')[1])}月
                    </th>
                  })}
                </tr>
              </thead>
              <tbody>
                {processes.map((proc, i) => {
                  const yearAvg = calcYearAvgLT(proc.monthlyLT, visibleMonths)
                  return (
                    <tr key={proc.processKey} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {/* <ProcessLabel proc={proc} /> */}

                      {/* <td className="border px-2 py-1 text-center bg-red-50 text-red-700 font-medium">
                        {proc.targetDays !== null ? proc.targetDays : '-'}
                      </td> */}
                      <td
                        className={`border px-2 py-1 text-center font-medium ${getLTBgColor(proc.avgLT)} ${proc.avgLT != null ? 'cursor-pointer hover:opacity-70' : ''}`}
                        onClick={() => proc.avgLT != null && handleLTCellClick(proc, '2000-01-01', '2099-12-31')}
                      >
                        {fmtNum(proc.avgLT)}
                      </td>
                      <td
                        className={`border px-2 py-1 text-center font-bold ${getLTBgColor(yearAvg)} ${yearAvg != null ? 'cursor-pointer hover:opacity-70' : ''}`}
                        onClick={() => yearAvg != null && handleLTCellClick(proc, `${year}-01-01`, `${year}-12-31`)}
                      >
                        {fmtNum(yearAvg)}
                      </td>
                      {visibleMonths.map(m => {
                        const val = proc.monthlyLT[m]
                        const hasData = val != null && Number.isFinite(val)
                        return (
                          <td
                            key={m}
                            className={`border px-2 py-1 text-center ${getLTBgColor(val)} ${hasData ? 'cursor-pointer hover:opacity-70' : ''}`}
                            onClick={() => {
                              if (!hasData) return
                              const period = monthKeyToPeriod(m)
                              handleLTCellClick(proc, period.start, period.end)
                            }}
                          >
                            {fmtNum(val)}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
                <tr className="bg-gray-100 font-bold">
                  {/* <td className="border px-2 py-1.5" style={{ borderLeft: '4px solid #333' }}>
                    全体
                  </td> */}

                  {/* <td className="border px-2 py-1.5 text-center bg-red-50">-</td> */}
                  <td className={`border px-2 py-1.5 text-center ${getLTBgColor(totalAvgLT)}`}>{fmtNum(totalAvgLT)}</td>
                  <td className={`border px-2 py-1.5 text-center ${getLTBgColor(totalYearAvgLT)}`}>
                    {fmtNum(totalYearAvgLT)}
                  </td>
                  {visibleMonths.map(m => (
                    <td key={m} className={`border px-2 py-1.5 text-center ${getLTBgColor(totalMonthlyLT[m])}`}>
                      {fmtNum(totalMonthlyLT[m])}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 工程別滞留モーダル */}
      <modal.Modal
        style={{
          maxWidth: '95vw',
          maxHeight: '85vh',
          width: '1200px',
          overflow: 'hidden',
        }}
      >
        {modal.open && (
          <ProcessDetailModal
            processKey={modal.open.processKey}
            dashboardLabel={modal.open.dashboardLabel}
            color={modal.open.color}
            onClose={modal.handleClose}
          />
        )}
      </modal.Modal>

      {/* LTセルクリック用モーダル */}
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
            periodStart={ltModal.open.periodStart}
            periodEnd={ltModal.open.periodEnd}
            onClose={ltModal.handleClose}
          />
        )}
      </ltModal.Modal>
    </>
  )
}
