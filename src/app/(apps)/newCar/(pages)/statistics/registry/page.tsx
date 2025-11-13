'use client'
import {useCallback, useEffect, useMemo, useState} from 'react'
import Link from 'next/link'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {basePath} from '@cm/lib/methods/common'

type Row = {key: string; A: string; H: string; O: string; count: number}

const A_LIST = ['A', 'B', 'C'] as const
const H_LIST = ['H', 'I', 'J', 'K'] as const
const O_LIST = ['O', 'P1', 'P2', 'Q'] as const

const buildKeys = () => {
  const keys: string[] = []
  A_LIST.forEach(a => H_LIST.forEach(h => O_LIST.forEach(o => keys.push(`${a}_${h}_${o}`))))
  return keys
}

export default function RegistryAggregationPage() {
  const {query} = useGlobal()
  const [month, setMonth] = useState<string>(query?.month || new Date().toISOString().slice(0, 10))
  const [storeId, setStoreId] = useState<string>(query?.storeId || 'all')
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<Row[]>([])

  const keys = useMemo(() => buildKeys(), [])

  const fetchAgg = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('keys', keys.join(','))
      params.set('storeId', storeId)
      if (month) params.set('month', month)
      const res = await fetch(`${basePath}/newCar/api/statistics/aggregateByRegistry?${params.toString()}`)

      const data = await res.json()
      const row = (data?.rows?.[0] || {}) as Record<string, number>
      const list: Row[] = keys.map(key => {
        const [A, H, O] = key.split('_')
        return {key, A, H, O, count: Number(row[key] ?? 0)}
      })
      setRows(list)
    } finally {
      setLoading(false)
    }
  }, [keys, storeId, month])

  useEffect(() => {
    fetchAgg()
  }, [fetchAgg])

  return (
    <div style={{padding: 16, margin: 'auto', width: 'fit-content'}}>
      <h2 style={{fontSize: 18, fontWeight: 600}}>新車 集計（A×H×O）</h2>
      <div style={{display: 'flex', gap: 8, alignItems: 'center', margin: '12px 0'}}>
        <label>
          month: <input type="date" value={month} onChange={e => setMonth(e.target.value)} />
        </label>
        <label>
          storeId: <input value={storeId} onChange={e => setStoreId(e.target.value)} placeholder="all or number" />
        </label>
        <button onClick={fetchAgg} disabled={loading} style={{padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6}}>
          {loading ? '更新中...' : '再読込'}
        </button>
      </div>

      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr>
            <th style={{textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd'}}>A</th>
            <th style={{textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd'}}>H</th>
            <th style={{textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd'}}>O</th>
            <th style={{textAlign: 'right', padding: 8, borderBottom: '1px solid #ddd'}}>件数</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.key}>
              <td style={{padding: 8, borderBottom: '1px solid #f0f0f0'}}>{r.A}</td>
              <td style={{padding: 8, borderBottom: '1px solid #f0f0f0'}}>{r.H}</td>
              <td style={{padding: 8, borderBottom: '1px solid #f0f0f0'}}>{r.O}</td>
              <td
                style={{
                  padding: 8,
                  borderBottom: '1px solid #f0f0f0',
                  textAlign: 'right',
                  color: r.count > 0 ? 'blue' : 'darkgray',
                }}
              >
                <Link
                  href={`/newCar/newCar/?filterKey=${encodeURIComponent(r.key)}&storeId=${encodeURIComponent(storeId)}&month=${encodeURIComponent(month)}&showNosya=true`}
                >
                  {r.count.toLocaleString()}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
