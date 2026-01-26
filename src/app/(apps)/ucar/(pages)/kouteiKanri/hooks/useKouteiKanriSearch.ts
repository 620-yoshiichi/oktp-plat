'use client'

import {useState, useCallback, useTransition, useEffect, useRef} from 'react'
import {useUcarSearchParams} from '@app/(apps)/ucar/hooks/useUcarSearchParams'
import {searchKouteiKanri} from '../server-actions'
import type {UcarSearchValues} from '@app/(apps)/ucar/components/search'

export type UseKouteiKanriSearchReturn = {
  // 検索フォーム（URLパラメータから取得）
  searchValues: Partial<UcarSearchValues>

  // 検索実行（URL更新）
  search: (params?: Partial<UcarSearchValues>) => void
  resetSearch: () => void

  // 検索結果
  results: any[]
  isLoading: boolean
  error: string | null
}

export function useKouteiKanriSearch(): UseKouteiKanriSearchReturn {
  // URLパラメータ管理フックを使用
  const {values, search: updateUrl, reset: resetUrl} = useUcarSearchParams()

  // 検索結果
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // トランジション
  const [isPending, startTransition] = useTransition()

  // 前回の検索パラメータを保持（重複検索防止）
  const prevValuesRef = useRef<string>('')

  // 検索実行
  const executeSearch = useCallback(async (params: Partial<UcarSearchValues>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await searchKouteiKanri(params)
      console.log({response}) //logs

      if (response.success && response.result) {
        setResults(response.result)
      } else {
        setError(response.message || '検索に失敗しました')
        setResults([])
      }
    } catch (err) {
      setError('検索中にエラーが発生しました')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 検索実行（URL更新のみ、データ取得はuseEffectで）
  const search = useCallback(
    (params?: Partial<UcarSearchValues>) => {
      const newParams = params ? {...values, ...params} : values
      updateUrl(newParams)
    },
    [values, updateUrl]
  )

  // 検索リセット
  const resetSearch = useCallback(() => {
    resetUrl()
    setResults([])
    setError(null)
  }, [resetUrl])

  // URLパラメータが変更されたら検索実行
  useEffect(() => {
    const currentValuesStr = JSON.stringify(values)

    // 前回と同じパラメータなら検索しない

    prevValuesRef.current = currentValuesStr

    // 検索条件があれば検索実行
    // const hasSearchParams = Object.values(values).some(v => (typeof v === 'boolean' ? v : v !== ''))

    startTransition(() => {
      executeSearch(values)
    })
  }, [values, executeSearch])

  return {
    searchValues: values,
    search,
    resetSearch,
    results,
    isLoading: isLoading || isPending,
    error,
  }
}
