'use client'

import { useCallback, useMemo } from 'react'
import { DashboardResult } from '../lib/calcDashboardData'
import { OtherMetricsDetailModal } from './OtherMetricsDetailModal'
import useModal from '@cm/components/utils/modal/useModal'
import type { FetchOtherMetricsCarsParams } from '../server-actions'
import { getColorStyles } from '@cm/lib/methods/colors'
import Coloring from '@cm/lib/methods/Coloring'

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

type ModalData = {
  label: string
  params: FetchOtherMetricsCarsParams
}

export function OtherMetricsTable({ data, year }: Props) {
  const { retailRatio, retailRatioTotal, shiwakeBreakdown, shiwakeGrandTotal, shiwakeGrandMonthly, number98Stats } = data

  const modal = useModal<ModalData>()

  // 指定年の1〜12月を全て表示（データがない月も含む）
  const yyPrefix = String(year).slice(-2)
  const months = useMemo(() => {
    const all: string[] = []
    for (let m = 1; m <= 12; m++) {
      all.push(`${yyPrefix}-${String(m).padStart(2, '0')}`)
    }
    return all
  }, [yyPrefix])

  /** 選択中の年間合計を算出するヘルパー */
  const sumYear = useCallback((monthly: Record<string, number>) => {
    return months.reduce((sum, m) => sum + (monthly[m] ?? 0), 0)
  }, [months])

  // 選択年の年間集計
  const yearlyStats = useMemo(() => {
    // 仕分け別の年間合計
    const shiwakeYearly = shiwakeBreakdown.map(sw => ({
      key: sw.key,
      yearTotal: sumYear(sw.monthly),
    }))
    const shiwakeGrandYearly = sumYear(shiwakeGrandMonthly)

    // 小売割合（年間）
    const kouriYearly = shiwakeYearly.find(s => s.key === 'KOURI')?.yearTotal ?? 0
    const retailRatioYearly = shiwakeGrandYearly > 0
      ? Math.round((kouriYearly / shiwakeGrandYearly) * 100)
      : null

    // 98番号（年間）
    const qrSheetYearly = sumYear(number98Stats.qrSheetMonthly)
    const num98AttachedYearly = sumYear(number98Stats.num98AttachedMonthly)
    const num98NotAttachedYearly = sumYear(number98Stats.num98NotAttachedMonthly)
    const num98RatioYearly = qrSheetYearly > 0
      ? Math.round((num98AttachedYearly / qrSheetYearly) * 1000) / 10
      : null

    return {
      shiwakeYearly,
      shiwakeGrandYearly,
      retailRatioYearly,
      qrSheetYearly,
      num98AttachedYearly,
      num98NotAttachedYearly,
      num98RatioYearly,
    }
  }, [shiwakeBreakdown, shiwakeGrandMonthly, number98Stats, sumYear, months])

  /** クリック可能な数値セルを生成するヘルパー */
  const ClickableCell = useCallback(
    ({ value, label, params, className }: { value: number | undefined; label: string; params: FetchOtherMetricsCarsParams; className?: string }) => {
      const hasData = value !== undefined && value > 0
      return (
        <td
          className={`border px-2 py-1.5 text-center ${className ?? ''} ${hasData ? 'cursor-pointer hover:opacity-70' : ''}`}
          onClick={() => hasData && modal.handleOpen({ label, params })}
        >
          {fmtCount(value)}
        </td>
      )
    },
    [modal]
  )

  return (
    <>
      <div className="border rounded-lg bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          {/* ============================================================ */}
          {/* ヘッダー */}
          {/* ============================================================ */}
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border px-2 py-1.5 text-left font-bold w-[80px]" rowSpan={2}>
                その他指標
              </th>
              <th className="border px-2 py-1.5 text-left w-[130px]" rowSpan={2} />
              <th className="border px-2 py-1.5 text-center w-[55px]  font-bold" rowSpan={2}>
                全期
              </th>
              <th className="border px-2 py-1.5 text-center w-[55px] font-bold bg-blue-900" rowSpan={2}>
                {year}年
              </th>
              {months.map(m => (
                <th key={m} className="border px-2 py-1.5 text-center w-[50px] ">
                  {m.split('-')[0]}年<br />
                  {Number(m.split('-')[1])}月
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* ============================================================ */}
            {/* 小売割合（%値 → クリック対象外） */}
            {/* ============================================================ */}
            <tr className="bg-yellow-50">
              <td className="border p-1 font-medium bg-gray-800 text-white"
                rowSpan={shiwakeBreakdown.length + 2}>
                仕分け別

              </td>
              <td className="border px-2 py-1.5 font-medium bg-yellow-50">小売割合</td>
              <td
                className={`border px-2 py-1.5 text-center font-bold ${retailRatioTotal !== null ? getRatioBgColor(retailRatioTotal) : ''}`}
              >
                {fmtPercent(retailRatioTotal)}
              </td>
              <td
                className={`border px-2 py-1.5 text-center font-bold ${yearlyStats.retailRatioYearly !== null ? getRatioBgColor(yearlyStats.retailRatioYearly) : ''}`}
              >
                {fmtPercent(yearlyStats.retailRatioYearly)}
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


            {/* 仕分け別行 */}
            {shiwakeBreakdown.map(sw => (
              <tr key={sw.key}>
                <td className="border px-2 py-1.5 font-medium"

                >
                  <div className={` truncate`} >

                    <Coloring mode="text" color={sw.color}>{sw.label}</Coloring>
                  </div>
                </td>
                <ClickableCell
                  value={sw.total}
                  label={`${sw.label} - 全期間`}
                  params={{ type: 'shiwake', destinationCode: shiwakeBreakdown.find(b => b.key === sw.key)?.key === sw.key ? getShiwakeCode(sw.key) : undefined }}
                  className="font-bold"
                />
                <td className="border px-2 py-1.5 text-center font-bold">
                  {fmtCount(yearlyStats.shiwakeYearly.find(s => s.key === sw.key)?.yearTotal)}
                </td>
                {months.map(m => (
                  <ClickableCell
                    key={m}
                    value={sw.monthly[m]}
                    label={`${sw.label} - ${m}`}
                    params={{ type: 'shiwake', month: m, destinationCode: getShiwakeCode(sw.key) }}
                  />
                ))}
              </tr>
            ))}

            {/* 総計行 */}
            <tr className="bg-gray-100 font-bold">
              <td className="border px-2 py-1.5 font-bold">総計</td>
              <ClickableCell
                value={shiwakeGrandTotal}
                label="QR総数 - 全期間"
                params={{ type: 'shiwake' }}
              />
              <td className="border px-2 py-1.5 text-center font-bold">
                {fmtCount(yearlyStats.shiwakeGrandYearly || undefined)}
              </td>
              {months.map(m => (
                <ClickableCell
                  key={m}
                  value={shiwakeGrandMonthly[m]}
                  label={`QR総数 - ${m}`}
                  params={{ type: 'shiwake', month: m }}
                />
              ))}
            </tr>


            {/* ============================================================ */}
            {/* 98番号集計対象 → CR到着済 */}
            {/* ============================================================ */}
            <tr className="bg-gray-50">
              <td className="border p-1 font-medium bg-gray-800 text-white" rowSpan={5}>
                <div className="text-center leading-tight">
                  98番号付帯

                  <br />
                  <span className="text-[10px] text-gray-300">*中古車GでQR発行したものを除く</span>
                </div>
              </td>
            </tr>

            {/* QRシート発行台数 */}
            <tr>
              <td className="border px-2 py-1.5 font-medium">発行台数</td>
              <ClickableCell
                value={number98Stats.qrSheetTotal}
                label="QRシート発行台数 - 全期間"
                params={{ type: 'num98_qr' }}
                className="font-bold"
              />
              <td className="border px-2 py-1.5 text-center font-bold">
                {fmtCount(yearlyStats.qrSheetYearly || undefined)}
              </td>
              {months.map(m => (
                <ClickableCell
                  key={m}
                  value={number98Stats.qrSheetMonthly[m]}
                  label={`QRシート発行台数 - ${m}`}
                  params={{ type: 'num98_qr', month: m }}
                />
              ))}
            </tr>

            {/* 98番号付帯済台数 */}
            <tr>
              <td className="border px-2 py-1.5 font-medium">付帯済</td>
              <ClickableCell
                value={number98Stats.num98AttachedTotal}
                label="98番号付帯済台数 - 全期間"
                params={{ type: 'num98_attached' }}
                className="font-bold"
              />
              <td className="border px-2 py-1.5 text-center font-bold">
                {fmtCount(yearlyStats.num98AttachedYearly || undefined)}
              </td>
              {months.map(m => (
                <ClickableCell
                  key={m}
                  value={number98Stats.num98AttachedMonthly[m]}
                  label={`98番号付帯済台数 - ${m}`}
                  params={{ type: 'num98_attached', month: m }}
                />
              ))}
            </tr>

            {/* 98番号未付帯台数 */}
            <tr>
              <td className="border px-2 py-1.5 font-medium text-red-600">未付帯</td>
              <ClickableCell
                value={number98Stats.num98NotAttachedTotal > 0 ? number98Stats.num98NotAttachedTotal : undefined}
                label="98番号未付帯台数 - 全期間"
                params={{ type: 'num98_not_attached' }}
                className="font-bold text-red-600"
              />
              <td className="border px-2 py-1.5 text-center font-bold text-red-600">
                {fmtCount(yearlyStats.num98NotAttachedYearly > 0 ? yearlyStats.num98NotAttachedYearly : undefined)}
              </td>
              {months.map(m => {
                const v = number98Stats.num98NotAttachedMonthly[m]
                return (
                  <ClickableCell
                    key={m}
                    value={v > 0 ? v : undefined}
                    label={`98番号未付帯台数 - ${m}`}
                    params={{ type: 'num98_not_attached', month: m }}
                    className="text-red-600"
                  />
                )
              })}
            </tr>



            {/* 98番号付帯率（%値 → クリック対象外） */}
            <tr className="bg-yellow-50">
              <td className="border px-2 py-1.5 font-medium bg-yellow-200">98番号付帯率</td>
              <td
                className={`border px-2 py-1.5 text-center font-bold ${number98Stats.num98RatioTotal !== null ? getNum98RatioBgColor(number98Stats.num98RatioTotal) : ''
                  }`}
              >
                {fmtPercent(number98Stats.num98RatioTotal)}
              </td>
              <td
                className={`border px-2 py-1.5 text-center font-bold ${yearlyStats.num98RatioYearly !== null ? getNum98RatioBgColor(yearlyStats.num98RatioYearly) : ''}`}
              >
                {fmtPercent(yearlyStats.num98RatioYearly)}
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

      {/* モーダル */}
      <modal.Modal
        style={{
          maxWidth: '98vw',
          maxHeight: '90vh',
          width: '1600px',
          overflow: 'hidden',
        }}
      >
        {modal.open && (
          <OtherMetricsDetailModal
            label={modal.open.label}
            params={modal.open.params}
            onClose={modal.handleClose}
          />
        )}
      </modal.Modal>
    </>
  )
}

/** 仕分けキーからコードへの変換 */
const SHIWAKE_CODE_MAP: Record<string, string> = {
  KOURI: '02',
  OROSI: '01',
  SCRAP: '03',
  CPO: '04',
  ONLINE: '05',
}

function getShiwakeCode(key: string): string | undefined {
  return SHIWAKE_CODE_MAP[key]
}
