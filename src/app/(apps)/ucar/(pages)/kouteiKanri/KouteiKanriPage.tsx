'use client'

import { UcarSearchForm } from '@app/(apps)/ucar/components/search'
import { useKouteiKanriSearch } from './hooks/useKouteiKanriSearch'
import { KouteiKanriTable } from './components/KouteiKanriTable'
import { useEffect } from 'react'

export default function KouteiKanriPage() {
  const {
    searchValues,
    search,
    resetSearch,
    results,
    isLoading,
    error,
  } = useKouteiKanriSearch()

  useEffect(() => {
    search(searchValues)
  }, [])

  return (
    <div className="p-2 mx-auto w-fit">
      {/* 検索フォーム */}
      <UcarSearchForm
        values={searchValues}
        onSearch={search}
        onReset={resetSearch}
        fields={{
          sateiID: true,
          modelName: true,
          color: true,
          frame: true,
          latestProcessCode: true,
        }}
        className="mb-2"
        isLoading={isLoading}
      />

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-2">
          {error}
        </div>
      )}

      {/* テーブル */}
      <KouteiKanriTable results={results} isLoading={isLoading} />
    </div>
  )
}
