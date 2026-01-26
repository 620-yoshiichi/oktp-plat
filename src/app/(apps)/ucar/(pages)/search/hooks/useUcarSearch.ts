'use client'

import {useState, useCallback, useTransition, useEffect, useRef} from 'react'
import useSWR from 'swr'
import {useUcarSearchParams} from '@app/(apps)/ucar/hooks/useUcarSearchParams'
import {searchUcars, getUcarDetail, getStoreList} from '../server-actions'
import type {UcarSearchFormValues, UcarSearchResult, PaginationInfo} from '../types'

// 店舗リスト取得用フェッチャー
const storeListFetcher = async () => {
  const result = await getStoreList()
  return result.result
}

export type UseUcarSearchReturn = {
  // 検索フォーム（URLパラメータから取得）
  searchParams: UcarSearchFormValues

  // 検索実行（URL更新）
  search: (params?: Partial<UcarSearchFormValues>) => void
  resetSearch: () => void

  // 検索結果
  results: UcarSearchResult[]
  pagination: PaginationInfo | null
  isLoading: boolean
  error: string | null

  // ページネーション
  goToPage: (page: number) => void

  // 詳細モーダル
  selectedUcar: UcarSearchResult | null
  isDetailModalOpen: boolean
  openDetailModal: (sateiID: string) => void
  closeDetailModal: () => void
  isDetailLoading: boolean

  // マスターデータ
  storeList: {id: number; name: string; code: number}[]
}

export function useUcarSearch(): UseUcarSearchReturn {
  // URLパラメータ管理フックを使用
  const {values, search: updateUrl, reset: resetUrl} = useUcarSearchParams()

  // ページ管理（URLパラメータに含めても良いが、シンプルにするためstateで管理）
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage] = useState(20)

  // 検索結果
  const [results, setResults] = useState<UcarSearchResult[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 詳細モーダル
  const [selectedUcar, setSelectedUcar] = useState<UcarSearchResult | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  // トランジション
  const [isPending, startTransition] = useTransition()

  // 前回の検索パラメータを保持（重複検索防止）
  const prevValuesRef = useRef<string>('')

  // マスターデータ取得
  const {data: storeList = []} = useSWR('store-list', storeListFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  // URLパラメータから検索フォーム値を生成
  const searchParams: UcarSearchFormValues = {
    keyword: values.keyword || '',
    brandName: values.brandName || '',
    driveType: values.driveType || '',
    latestProcessCode: values.latestProcessCode || '',
    isKei: values.isKei || false,
    includeSold: values.includeSold || false,
    destinationStoreId: values.destinationStoreId || '',
  }

  // 検索実行
  const executeSearch = useCallback(
    async (params: Partial<UcarSearchFormValues>, page: number) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await searchUcars({
          keyword: params.keyword || '',
          brandName: params.brandName || '',
          driveType: params.driveType || '',
          latestProcessCode: params.latestProcessCode || '',
          isKei: params.isKei || false,
          includeSold: params.includeSold || false,
          destinationStoreId: params.destinationStoreId || '',
          page,
          perPage,
        })

        if (response.success && response.result) {
          setResults(response.result.data)
          setPagination(response.result.pagination)
        } else {
          setError(response.message || '検索に失敗しました')
          setResults([])
          setPagination(null)
        }
      } catch (err) {
        setError('検索中にエラーが発生しました')
        setResults([])
        setPagination(null)
      } finally {
        setIsLoading(false)
      }
    },
    [perPage]
  )

  // 検索実行（URL更新のみ、データ取得はuseEffectで）
  const search = useCallback(
    (params?: Partial<UcarSearchFormValues>) => {
      const newParams = params ? {...values, ...params} : values
      setCurrentPage(1)
      updateUrl(newParams)
    },
    [values, updateUrl]
  )

  // 検索リセット
  const resetSearch = useCallback(() => {
    resetUrl()
    setCurrentPage(1)
    setResults([])
    setPagination(null)
    setError(null)
  }, [resetUrl])

  // ページ移動
  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(page)
      startTransition(() => {
        executeSearch(values, page)
      })
    },
    [values, executeSearch]
  )

  // URLパラメータが変更されたら検索実行
  useEffect(() => {
    const currentValuesStr = JSON.stringify(values)

    // 前回と同じパラメータなら検索しない
    if (currentValuesStr === prevValuesRef.current) {
      return
    }
    prevValuesRef.current = currentValuesStr

    // 検索条件があれば検索実行

    setCurrentPage(1)
    startTransition(() => {
      executeSearch(values, 1)
    })
  }, [values, executeSearch])

  // 詳細モーダルを開く
  const openDetailModal = useCallback(async (sateiID: string) => {
    setIsDetailLoading(true)
    setIsDetailModalOpen(true)

    try {
      const response = await getUcarDetail(sateiID)

      if (response.success && response.result) {
        setSelectedUcar(response.result)
      } else {
        setError(response.message || '詳細の取得に失敗しました')
        setSelectedUcar(null)
      }
    } catch (err) {
      setError('詳細取得中にエラーが発生しました')
      setSelectedUcar(null)
    } finally {
      setIsDetailLoading(false)
    }
  }, [])

  // 詳細モーダルを閉じる
  const closeDetailModal = useCallback(() => {
    setIsDetailModalOpen(false)
    setSelectedUcar(null)
  }, [])

  return {
    // 検索フォーム（URLパラメータから取得）
    searchParams,

    // 検索実行
    search,
    resetSearch,

    // 検索結果
    results,
    pagination,
    isLoading: isLoading || isPending,
    error,

    // ページネーション
    goToPage,

    // 詳細モーダル
    selectedUcar,
    isDetailModalOpen,
    openDetailModal,
    closeDetailModal,
    isDetailLoading,

    // マスターデータ
    storeList,
  }
}
