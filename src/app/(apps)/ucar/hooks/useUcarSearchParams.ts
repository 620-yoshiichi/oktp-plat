'use client'

import {useCallback, useMemo} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import type {Prisma} from '@prisma/generated/prisma/client'
import {type UcarSearchValues, URL_PARAM_KEYS, DEFAULT_SEARCH_VALUES} from '../components/search/types'
import {buildWhereConditions} from '../components/search/buildWhereConditions'
import useSWR from 'swr'

/**
 * フックの戻り値型
 */
export type UseUcarSearchParamsReturn = {
  // 現在の検索値
  values: UcarSearchValues

  // 個別フィールドの値更新（URLは更新しない）
  setField: (field: keyof UcarSearchValues, value: string | boolean) => void

  // 検索実行（URL更新）
  search: (newValues?: Partial<UcarSearchValues>) => void

  // リセット
  reset: () => void

  // URLにboolean初期値が未セットの場合にセットする
  ensureUrlParams: () => void

  // Prisma WHERE 条件
  whereConditions: Prisma.UcarWhereInput[]

  // URLパラメータ文字列を生成（外部での使用用）
  buildSearchUrl: (newValues?: Partial<UcarSearchValues>) => string
}

/**
 * URLパラメータを使用したUcar検索状態管理フック
 *
 * 特徴:
 * - URLパラメータから検索条件を読み取り
 * - 検索条件をURLパラメータに書き込み
 * - Prisma の WHERE 条件を生成して返却
 *
 * 注意: latestProcessCodeの条件はサーバーサイドで別途処理が必要
 */
export function useUcarSearchParams(): UseUcarSearchParamsReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URLパラメータから検索値を読み取り
  const values = useMemo<UcarSearchValues>(() => {
    const getValue = (field: keyof UcarSearchValues): string => {
      return searchParams?.get(URL_PARAM_KEYS[field]) ?? ''
    }

    const getBoolValue = (field: keyof UcarSearchValues, defaultValue = false): boolean => {
      const raw = searchParams?.get(URL_PARAM_KEYS[field])
      if (raw === null) return defaultValue
      return raw === 'true'
    }

    return {
      keyword: getValue('keyword'),
      brandName: getValue('brandName'),
      driveType: getValue('driveType'),
      latestProcessCode: getValue('latestProcessCode'),
      destinationStoreId: getValue('destinationStoreId'),
      showRegular: getBoolValue('showRegular', true),
      showKei: getBoolValue('showKei', true),
      showSold: getBoolValue('showSold'),
      showUnsold: getBoolValue('showUnsold', true),
      modelName: getValue('modelName'),
      color: getValue('color'),
      frame: getValue('frame'),
      sateiID: getValue('sateiID'),
    }
  }, [searchParams])

  const {data: whereConditions = []} = useSWR<Prisma.UcarWhereInput[]>(['useUcarSearchParams', values], async () => {
    return await buildWhereConditions(values)
  })

  // URLパラメータ文字列を生成
  const buildSearchUrl = useCallback(
    (newValues?: Partial<UcarSearchValues>): string => {
      const mergedValues = newValues ? {...values, ...newValues} : values
      const params = new URLSearchParams()

      Object.entries(URL_PARAM_KEYS).forEach(([field, paramKey]) => {
        const value = mergedValues[field as keyof UcarSearchValues]

        if (typeof value === 'boolean') {
          params.set(paramKey, String(value))
        } else if (typeof value === 'string' && value.trim() !== '') {
          params.set(paramKey, value.trim())
        }
      })

      const paramString = params.toString()
      return paramString ? `?${paramString}` : ''
    },
    [values]
  )

  // 個別フィールドの値更新（この時点ではURLは更新しない）
  // 注: この関数は実際にはURLを更新しないが、
  // フォームコンポーネントが内部状態を持つ場合に使用
  const setField = useCallback(
    (field: keyof UcarSearchValues, value: string | boolean) => {
      // この実装ではURLベースの状態管理のため、
      // 直接URLを更新する形で実装
      const newValues = {...values, [field]: value}
      const url = buildSearchUrl(newValues)
      router.push(url, {scroll: false})
    },
    [values, buildSearchUrl, router]
  )

  // 検索実行（URL更新）
  const search = useCallback(
    (newValues?: Partial<UcarSearchValues>) => {
      const url = buildSearchUrl(newValues)
      router.push(url, {scroll: false})
    },
    [buildSearchUrl, router]
  )

  // URLにboolean初期値が未セットの場合にセットする
  const ensureUrlParams = useCallback(() => {
    const url = buildSearchUrl(values)
    const currentSearch = searchParams?.toString() ?? ''
    const newSearch = url.replace('?', '')
    if (currentSearch !== newSearch) {
      router.replace(url, {scroll: false})
    }
  }, [buildSearchUrl, values, searchParams, router])

  // リセット
  const reset = useCallback(() => {
    const url = buildSearchUrl(DEFAULT_SEARCH_VALUES)
    router.push(url, {scroll: false})
  }, [buildSearchUrl, router])

  return {
    values,
    setField,
    search,
    reset,
    ensureUrlParams,
    whereConditions: whereConditions ?? [],
    buildSearchUrl,
  }
}

// サーバーコンポーネント用関数は別ファイルから再エクスポート
export {getSearchValuesFromParams} from '../components/search/getSearchValuesFromParams'
