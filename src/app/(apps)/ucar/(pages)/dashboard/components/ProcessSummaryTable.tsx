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

  // 指定年の 01〜12 月キーを生成し、データに存在する月のみ表示
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

  // 全体行の月別LT集計
  const totalMonthlyLT: Record<string, number | null> = {}
  for (const m of visibleMonths) {
    const vals = processes.map(p => p.monthlyLT[m]).filter((v): v is number => v !== null)
    totalMonthlyLT[m] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }

  return (
    <>
      <div className="border rounded-lg bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border border-gray-600 px-2 py-1.5 text-left w-[80px]" rowSpan={2}>
                工程
              </th>
              <th className="border border-gray-600 px-2 py-1.5 text-center w-[50px]" rowSpan={2}>
                現在
                <br />
                台数
              </th>
              <th className="border border-gray-600 px-2 py-1.5 text-center w-[40px]" rowSpan={2}>
                単位
              </th>
              <th className="border border-gray-600 px-2 py-1.5 text-center w-[45px] bg-red-700" rowSpan={2}>
                目標
                <br />
                (日数)
              </th>
              <th className="border border-gray-600 px-2 py-1.5 text-center w-[55px]" rowSpan={2}>
                全期間
              </th>
              {visibleMonths.map(m => (
                <th key={m} className="border border-gray-600 px-2 py-1.5 text-center w-[50px]">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processes.map((proc, i) => (
              <tr key={proc.processKey} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {/* 工程名（クリック可能） */}
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
                    <span className="truncate group-hover:underline">{proc.dashboardLabel}</span>
                  </button>
                </td>

                <td className="border px-2 py-1 text-center font-bold">
                  {proc.currentCount > 0 ? proc.currentCount : '-'}
                </td>

                <td className="border px-2 py-1 text-center text-gray-500">日</td>

                <td className="border px-2 py-1 text-center bg-red-50 text-red-700 font-medium">
                  {proc.targetDays !== null ? proc.targetDays : '-'}
                </td>

                <td className={`border px-2 py-1 text-center font-medium ${getLTBgColor(proc.avgLT)}`}>
                  {fmtNum(proc.avgLT)}
                </td>

                {visibleMonths.map(m => (
                  <td key={m} className={`border px-2 py-1 text-center ${getLTBgColor(proc.monthlyLT[m])}`}>
                    {fmtNum(proc.monthlyLT[m])}
                  </td>
                ))}
              </tr>
            ))}

            {/* 全体行 */}
            <tr className="bg-gray-100 font-bold">
              <td className="border px-2 py-1.5" style={{ borderLeft: '4px solid #333' }}>
                全体
              </td>
              <td className="border px-2 py-1.5 text-center">{totalCount}</td>
              <td className="border px-2 py-1.5 text-center text-gray-500">日</td>
              <td className="border px-2 py-1.5 text-center bg-red-50">-</td>
              <td className={`border px-2 py-1.5 text-center ${getLTBgColor(totalAvgLT)}`}>{fmtNum(totalAvgLT)}</td>
              {visibleMonths.map(m => (
                <td key={m} className={`border px-2 py-1.5 text-center ${getLTBgColor(totalMonthlyLT[m])}`}>
                  {fmtNum(totalMonthlyLT[m])}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
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
