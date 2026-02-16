'use client'

import { useMemo } from 'react'
import { DashboardResult } from '../lib/calcDashboardData'

type Props = {
  data: DashboardResult
  /** 表示対象の年（例: 2025） */
  year: number
}

/** パーセント値の背景色 */
function getRatioBgColor(ratio: number): string {
  if (ratio >= 55) return 'bg-green-100 text-green-800'
  if (ratio >= 50) return 'bg-yellow-50 text-yellow-800'
  return 'bg-red-50 text-red-800'
}

/** 98番号付帯率の背景色 */
function getNum98RatioBgColor(ratio: number): string {
  if (ratio >= 99) return 'bg-green-100 text-green-800'
  if (ratio >= 95) return 'bg-yellow-50 text-yellow-800'
  return 'bg-red-50 text-red-800'
}

/** 数値フォーマット */
function fmtCount(n: number | undefined): string {
  if (n === undefined || n === 0) return '-'
  return String(n).toLocaleString()
}

function fmtPercent(n: number | null | undefined): string {
  if (n === null || n === undefined) return '-'
  return `${n}%`
}

export function OtherMetricsTable({ data, year }: Props) {
  const { retailRatio, retailRatioTotal, shiwakeBreakdown, shiwakeGrandTotal, shiwakeGrandMonthly, number98Stats } = data

  // 指定年の1〜12月を全て表示（データがない月も含む）
  const yyPrefix = String(year).slice(-2)
  const months = useMemo(() => {
    const all: string[] = []
    for (let m = 1; m <= 12; m++) {
      all.push(`${yyPrefix}-${String(m).padStart(2, '0')}`)
    }
    return all
  }, [yyPrefix])

  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        {/* ============================================================ */}
        {/* ヘッダー */}
        {/* ============================================================ */}
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1.5 text-left font-bold w-[80px]" rowSpan={2}>
              その他指標
            </th>
            <th className="border px-2 py-1.5 text-left w-[130px]" rowSpan={2} />
            <th className="border px-2 py-1.5 text-center w-[55px] bg-yellow-200 font-bold" rowSpan={2}>
              全期
            </th>
            {months.map(m => (
              <th key={m} className="border px-2 py-1.5 text-center w-[50px] bg-yellow-100">
                {m.split('-')[0]}年<br />
                {Number(m.split('-')[1])}月
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* ============================================================ */}
          {/* 小売割合 */}
          {/* ============================================================ */}
          <tr className="bg-yellow-50">
            <td className="border px-2 py-1.5 font-medium bg-yellow-200" colSpan={2}>
              小売割合
            </td>
            <td
              className={`border px-2 py-1.5 text-center font-bold ${retailRatioTotal !== null ? getRatioBgColor(retailRatioTotal) : ''}`}
            >
              {fmtPercent(retailRatioTotal)}
            </td>
            {months.map(m => {
              const v = retailRatio[m]
              return (
                <td
                  key={m}
                  className={`border px-2 py-1.5 text-center font-medium ${v !== undefined ? getRatioBgColor(v) : ''}`}
                >
                  {fmtPercent(v)}
                </td>
              )
            })}
          </tr>

          {/* ============================================================ */}
          {/* QRシート総数（レンタ除く） */}
          {/* ============================================================ */}
          <tr className="bg-gray-50">
            <td className="border px-2 py-1.5 font-medium bg-gray-200" rowSpan={shiwakeBreakdown.length + 2}>
              <div className="text-center leading-tight">
                QR総数
              </div>
            </td>
          </tr>

          {/* 仕分け別行 */}
          {shiwakeBreakdown.map(sw => (
            <tr key={sw.key}>
              <td className="border px-2 py-1.5 font-medium" style={{ borderLeft: `3px solid ${sw.color}` }}>
                <div className={`w-8 truncate`}>{sw.label}</div>
              </td>
              <td className="border px-2 py-1.5 text-center font-bold">{fmtCount(sw.total)}</td>
              {months.map(m => (
                <td key={m} className="border px-2 py-1.5 text-center">
                  {fmtCount(sw.monthly[m])}
                </td>
              ))}
            </tr>
          ))}

          {/* 総計行 */}
          <tr className="bg-gray-100 font-bold">
            <td className="border px-2 py-1.5 font-bold">総計</td>
            <td className="border px-2 py-1.5 text-center">{fmtCount(shiwakeGrandTotal)}</td>
            {months.map(m => (
              <td key={m} className="border px-2 py-1.5 text-center">
                {fmtCount(shiwakeGrandMonthly[m])}
              </td>
            ))}
          </tr>

          {/* ============================================================ */}
          {/* 98番号集計対象 → CR到着済 */}
          {/* ============================================================ */}
          <tr className="bg-gray-50">
            <td className="border px-2 py-1.5 font-medium bg-gray-200" rowSpan={4}>
              <div className="text-center leading-tight">
                98番号
                <br />
                集計対象
                <br />
                <span className="text-[10px] text-gray-500">→ CR到着済</span>
              </div>
            </td>
          </tr>

          {/* QRシート発行台数 */}
          <tr>
            <td className="border px-2 py-1.5 font-medium">QRシート発行台数</td>
            <td className="border px-2 py-1.5 text-center font-bold">{fmtCount(number98Stats.qrSheetTotal)}</td>
            {months.map(m => (
              <td key={m} className="border px-2 py-1.5 text-center">
                {fmtCount(number98Stats.qrSheetMonthly[m])}
              </td>
            ))}
          </tr>

          {/* 98番号付帯済台数 */}
          <tr>
            <td className="border px-2 py-1.5 font-medium">
              98番号付帯済台数
              <br />
              <span className="text-[10px] text-gray-500">(対象:CR到着済)</span>
            </td>
            <td className="border px-2 py-1.5 text-center font-bold">{fmtCount(number98Stats.num98AttachedTotal)}</td>
            {months.map(m => (
              <td key={m} className="border px-2 py-1.5 text-center">
                {fmtCount(number98Stats.num98AttachedMonthly[m])}
              </td>
            ))}
          </tr>

          {/* 98番号付帯率 */}
          <tr className="bg-yellow-50">
            <td className="border px-2 py-1.5 font-medium bg-yellow-200">98番号付帯率</td>
            <td
              className={`border px-2 py-1.5 text-center font-bold ${number98Stats.num98RatioTotal !== null ? getNum98RatioBgColor(number98Stats.num98RatioTotal) : ''
                }`}
            >
              {fmtPercent(number98Stats.num98RatioTotal)}
            </td>
            {months.map(m => {
              const v = number98Stats.num98RatioMonthly[m]
              return (
                <td
                  key={m}
                  className={`border px-2 py-1.5 text-center font-medium ${v !== null && v !== undefined ? getNum98RatioBgColor(v) : ''}`}
                >
                  {fmtPercent(v)}
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
