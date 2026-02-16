'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { DashboardResult } from '../lib/calcDashboardData'

type Props = {
  data: DashboardResult
}

const RADIAN = Math.PI / 180

/** 円グラフ内のラベル描画 */
function renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) {
  if (value === 0) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="bold">
      {value}
    </text>
  )
}

export function TairyuPieChart({ data }: Props) {
  const chartData = data.processes
    .filter(p => p.currentCount > 0)
    .map(p => ({
      name: p.dashboardLabel,
      value: p.currentCount,
      color: p.color,
    }))

  if (chartData.length === 0) {
    return <div className="text-center text-gray-400 py-8">滞留データがありません</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="45%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={140}
          dataKey="value"
          strokeWidth={1}
          stroke="#fff"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number, name: string) => [`${value} 台`, name]} contentStyle={{ fontSize: 12 }} />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={10}
          wrapperStyle={{ fontSize: 12, paddingLeft: 8 }}
          formatter={(value: string) => {
            const item = chartData.find(d => d.name === value)
            return `${value} ${item?.value ?? 0}台`
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
