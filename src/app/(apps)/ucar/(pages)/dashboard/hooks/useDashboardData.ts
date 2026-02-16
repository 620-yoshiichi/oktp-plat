'use client'

import { useEffect, useState } from 'react'
import type { DashboardResult, PeriodLTSummary } from '../lib/calcDashboardData'
import { fetchDashboardData, fetchPeriodLT } from '../server-actions'

type UseDashboardDataReturn = {
  dashboardData: DashboardResult | null
  isLoading: boolean
  error: string | null
  periodLTData: PeriodLTSummary[] | null
  isLTLoading: boolean
}

/**
 * ダッシュボードのデータ取得を管理するフック
 * - メインデータ: 初回マウント時に1回取得
 * - 期間別LTデータ: 期間変更時に再取得
 */
export function useDashboardData(
  ltPeriodStart: string,
  ltPeriodEnd: string,
): UseDashboardDataReturn {
  // --- メインデータ ---
  const [dashboardData, setDashboardData] = useState<DashboardResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    fetchDashboardData().then(res => {
      if (res.success && res.result) {
        setDashboardData(res.result)
      } else {
        setError(res.message ?? 'データの取得に失敗しました')
      }
      setIsLoading(false)
    })
  }, [])

  // --- 期間別LTデータ ---
  const [periodLTData, setPeriodLTData] = useState<PeriodLTSummary[] | null>(null)
  const [isLTLoading, setIsLTLoading] = useState(true)

  useEffect(() => {
    setIsLTLoading(true)
    fetchPeriodLT({
      periodStart: ltPeriodStart,
      periodEnd: ltPeriodEnd,
    }).then(res => {
      if (res.success && res.result) {
        setPeriodLTData(res.result)
      }
      setIsLTLoading(false)
    })
  }, [ltPeriodStart, ltPeriodEnd])

  return { dashboardData, isLoading, error, periodLTData, isLTLoading }
}
