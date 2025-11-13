'use client'
import {useCallback, useEffect, useMemo, useState} from 'react'

type NewCar = {
  id: number
  userId: number | null
  storeId: number | null
  DD_FR: string | null
  DD_TOUROKU: string | null
}

export default function RegistryDetailPage({searchParams}: any) {
  const filterKey = searchParams?.filterKey || ''
  const month = searchParams?.month || ''
  const storeId = searchParams?.storeId || 'all'
  const userId = searchParams?.userId || 'all'

  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<NewCar[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [take, setTake] = useState(50)

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('filterKey', filterKey)
      params.set('storeId', storeId)
      params.set('userId', userId)
      if (month) params.set('month', month)
      params.set('page', String(page))
      params.set('take', String(take))
      const res = await fetch(`/api/statistics/detailByRegistry?${params.toString()}`, {cache: 'no-store'})
      const data = await res.json()
      setRows(data?.rows || [])
      setTotal(data?.total || 0)
    } finally {
      setLoading(false)
    }
  }, [filterKey, storeId, userId, month, page, take])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / take)), [total, take])

  return (
    <div style={{padding: 16}}>
      <h2 style={{fontSize: 18, fontWeight: 600}}>詳細一覧: {filterKey}</h2>
      <div style={{display: 'flex', gap: 8, alignItems: 'center', margin: '12px 0'}}>
        <span>month: {month || '-'}</span>
        <span>storeId: {storeId}</span>
        <span>userId: {userId}</span>
        <span>件数: {total.toLocaleString()}</span>
      </div>

      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr>
            <th style={{textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd'}}>ID</th>
            <th style={{textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd'}}>storeId</th>
            <th style={{textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd'}}>userId</th>
            <th style={{textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd'}}>DD_FR</th>
            <th style={{textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd'}}>DD_TOUROKU</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td style={{padding: 8, borderBottom: '1px solid #f0f0f0'}}>{r.id}</td>
              <td style={{padding: 8, borderBottom: '1px solid #f0f0f0'}}>{r.storeId ?? ''}</td>
              <td style={{padding: 8, borderBottom: '1px solid #f0f0f0'}}>{r.userId ?? ''}</td>
              <td style={{padding: 8, borderBottom: '1px solid #f0f0f0'}}>{r.DD_FR ?? ''}</td>
              <td style={{padding: 8, borderBottom: '1px solid #f0f0f0'}}>{r.DD_TOUROKU ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{display: 'flex', gap: 8, alignItems: 'center', marginTop: 12}}>
        <button
          disabled={loading || page <= 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          style={{padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6}}
        >
          前へ
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button
          disabled={loading || page >= totalPages}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          style={{padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6}}
        >
          次へ
        </button>
        <label>
          take:{' '}
          <input
            type="number"
            min={1}
            max={500}
            value={take}
            onChange={e => setTake(Math.max(1, Math.min(500, Number(e.target.value) || 50)))}
          />
        </label>
      </div>
    </div>
  )
}
