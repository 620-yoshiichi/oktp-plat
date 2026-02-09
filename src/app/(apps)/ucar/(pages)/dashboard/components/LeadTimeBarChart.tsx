'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { PeriodLTSummary } from '../lib/calcDashboardData'

type Props = {
  data: PeriodLTSummary[]
  /** 棒クリック時のコールバック（processKey を返す） */
  onBarClick?: (processKey: string) => void
}

export function LeadTimeBarChart({ data, onBarClick }: Props) {
  const chartData = data
    .filter(p => p.avgLT !== null && p.avgLT > 0)
    .map(p => ({
      name: `${p.dashboardLabel} LT`,
      processKey: p.processKey,
      value: Math.round((p.avgLT ?? 0) * 100) / 100,
      color: p.color,
      dashboardLabel: p.dashboardLabel,
    }))

  if (chartData.length === 0) {
    return <div className="text-center text-gray-400 py-8">LTデータがありません</div>
  }

  const maxValue = Math.ceil(Math.max(...chartData.map(d => d.value)) + 1)

  return (
    <ResponsiveContainer width="100%" height={Math.max(280, chartData.length * 30 + 40)}>
      <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 50, left: 10, bottom: 5 }} barSize={18}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, maxValue]}
          fontSize={11}
          tickCount={maxValue + 1}
          label={{ value: '日', position: 'insideBottomRight', offset: -5, fontSize: 11 }}
        />
        <YAxis type="category" dataKey="name" width={100} fontSize={11} interval={0} />
        <Tooltip formatter={(value: number) => [`${value.toFixed(2)} 日`, 'LT']} contentStyle={{ fontSize: 12 }} />
        <Bar
          dataKey="value"
          radius={[0, 4, 4, 0]}
          cursor={onBarClick ? 'pointer' : undefined}
          onClick={(barData: any) => {
            if (onBarClick && barData?.processKey) {
              onBarClick(barData.processKey)
            }
          }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
          <LabelList dataKey="value" position="right" fontSize={11} formatter={(v: number) => v.toFixed(2)} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
