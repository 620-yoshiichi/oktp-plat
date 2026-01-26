'use client'

import { UcarSearchForm } from '@app/(apps)/ucar/components/search'
import { useKouteiKanriSearch } from './hooks/useKouteiKanriSearch'
import { KouteiKanriTable } from './components/KouteiKanriTable'
import { useEffect, useState, useMemo } from 'react'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@cm/shadcn/lib/utils'

const ITEMS_PER_PAGE = 100

export default function KouteiKanriPage() {
  const {
    searchValues,
    search,
    resetSearch,
    results,
    isLoading,
    error,
  } = useKouteiKanriSearch()

  const [currentPage, setCurrentPage] = useState(1)

  // 検索条件が変わったらページをリセット
  useEffect(() => {
    setCurrentPage(1)
  }, [results])

  useEffect(() => {
    search(searchValues)
  }, [])

  // ページネーション計算
  const totalCount = results.length
  const pageCount = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const from = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const to = Math.min(currentPage * ITEMS_PER_PAGE, totalCount)

  // 現在のページに表示する結果
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return results.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [results, currentPage])

  const changePage = (page: number) => {
    if (page >= 1 && page <= pageCount) {
      setCurrentPage(page)
    }
  }

  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === pageCount || pageCount === 0

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

      {/* ページネーション（上部） */}
      {totalCount > 0 && (
        <Pagination
          from={from}
          to={to}
          totalCount={totalCount}
          pageCount={pageCount}
          currentPage={currentPage}
          isFirstPage={isFirstPage}
          isLastPage={isLastPage}
          onChangePage={changePage}
        />
      )}

      {/* テーブル */}
      <KouteiKanriTable results={paginatedResults} isLoading={isLoading} />

      {/* ページネーション（下部） */}
      {totalCount > ITEMS_PER_PAGE && (
        <Pagination
          from={from}
          to={to}
          totalCount={totalCount}
          pageCount={pageCount}
          currentPage={currentPage}
          isFirstPage={isFirstPage}
          isLastPage={isLastPage}
          onChangePage={changePage}
        />
      )}
    </div>
  )
}

type PaginationProps = {
  from: number
  to: number
  totalCount: number
  pageCount: number
  currentPage: number
  isFirstPage: boolean
  isLastPage: boolean
  onChangePage: (page: number) => void
}

function Pagination({
  from,
  to,
  totalCount,
  pageCount,
  currentPage,
  isFirstPage,
  isLastPage,
  onChangePage,
}: PaginationProps) {
  const chevronClass = 'h-5 w-5 cursor-pointer hover:text-blue-600'

  return (
    <div className="flex items-center justify-center gap-2 py-2 text-sm">
      {/* カウント表示 */}
      <span className="font-bold">
        {from} 〜 {to}
      </span>
      <span>/</span>
      <span>{totalCount}件</span>

      {/* ページ移動 */}
      {pageCount > 1 && (
        <div className="flex items-center gap-1 ml-2">
          <ChevronsLeft
            className={cn(chevronClass, isFirstPage && 'pointer-events-none opacity-30')}
            onClick={() => onChangePage(currentPage - 1)}
          />
          <select
            className="border rounded px-1 py-0.5 bg-gray-100"
            value={currentPage}
            onChange={(e) => onChangePage(Number(e.target.value))}
          >
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
          <span>/ {pageCount}p</span>
          <ChevronsRight
            className={cn(chevronClass, isLastPage && 'pointer-events-none opacity-30')}
            onClick={() => onChangePage(currentPage + 1)}
          />
        </div>
      )}
    </div>
  )
}
