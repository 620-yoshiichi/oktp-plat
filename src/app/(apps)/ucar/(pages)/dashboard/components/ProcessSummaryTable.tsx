'use client'

import { useMemo } from 'react'
import { DashboardResult } from '../lib/calcDashboardData'
import { ProcessDetailModal } from './ProcessDetailModal'
import useModal from '@cm/components/utils/modal/useModal'

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
function fmtNum(n: number | null): string {
  if (n === null || n === undefined) return '-'
  return n.toFixed(1)
}

/** 指定月の平均LTを算出 */
function calcYearAvgLT(monthlyLT: Record<string, number | null>, months: string[]): number | null {
  const vals = months.map(m => monthlyLT[m]).filter((v): v is number => v !== null)
  if (vals.length === 0) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export function ProcessSummaryTable({ data, year }: Props) {
  const { processes, totalCount, totalAvgLT } = data

  // モーダル（useModal）
  const modal = useModal<{
    processKey: string
    dashboardLabel: string
    color: string
  }>()

  // 指定年の YY プレフィックス
  const yyPrefix = String(year).slice(-2)

  // 指定年の月キー一覧
  const visibleMonths = useMemo(() => {
    const all: string[] = []
    for (let m = 1; m <= 12; m++) {
      const mk = `${yyPrefix}-${String(m).padStart(2, '0')}`
      if (data.months.includes(mk)) {
        all.push(mk)
      }
    }
    return all
  }, [data.months, yyPrefix])

  // 全体行の月別LT・当年平均
  const totalMonthlyLT: Record<string, number | null> = {}
  for (const m of visibleMonths) {
    const vals = processes.map(p => p.monthlyLT[m]).filter((v): v is number => v !== null)
    totalMonthlyLT[m] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }
  const totalYearAvgLT = calcYearAvgLT(totalMonthlyLT, visibleMonths)

  // --- 工程ラベルセル ---
  const ProcessLabel = ({ proc }: { proc: (typeof processes)[0] }) => (
    <td className="border px-2 py-1 font-medium" style={{ borderLeft: `4px solid ${proc.color}` }}>
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
          <span className="truncate group-hover:underline">{proc.dashboardLabel}</span>
          <div className="hidden group-hover/popover:block absolute left-full top-1/2 mt-1 z-10 bg-white border border-gray-300 rounded shadow-lg p-2 text-xs text-gray-700 min-w-[200px] max-w-xs whitespace-pre-line">
            【{proc.dashboardLabel}】を実施後、次の工程が登録されていないものです。
          </div>
        </div>
      </button>
    </td>
  )

  return (
    <>
      <div className="flex gap-4">
        {/* ============================================================ */}
        {/* テーブル1: 現在台数（滞留状況） */}
        {/* ============================================================ */}
        <div className="border rounded-lg bg-white shadow-sm overflow-x-auto shrink-0">
          <table className="text-xs border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border border-gray-600 px-2 py-1.5 text-left w-[120px]">工程</th>
                <th className="border border-gray-600 px-2 py-1.5 text-center w-[70px]">
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

        {/* ============================================================ */}
        {/* テーブル2: 工程別リードタイム（LT） */}
        {/* ============================================================ */}
        <div className="border rounded-lg bg-white shadow-sm overflow-x-auto min-w-0 flex-1 w-fit">
          <table className="w-full text-xs border-collapse">
            <thead>
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
                {visibleMonths.map(m => (
                  <th key={m} className="border border-gray-600 px-2 py-1.5 text-center w-[50px]">
                    {m}
                  </th>
                ))}
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
                    <td className={`border px-2 py-1 text-center font-medium ${getLTBgColor(proc.avgLT)}`}>
                      {fmtNum(proc.avgLT)}
                    </td>
                    <td className={`border px-2 py-1 text-center font-bold ${getLTBgColor(yearAvg)}`}>
                      {fmtNum(yearAvg)}
                    </td>
                    {visibleMonths.map(m => (
                      <td key={m} className={`border px-2 py-1 text-center ${getLTBgColor(proc.monthlyLT[m])}`}>
                        {fmtNum(proc.monthlyLT[m])}
                      </td>
                    ))}
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
    </>
  )
}
