'use client'

import { useUcarSearch } from './hooks/useUcarSearch'
import { UcarSearchForm } from '@app/(apps)/ucar/components/search'
import SearchResultTable from './components/SearchResultTable'
import UcarDetailModal from './components/UcarDetailModal'

export default function SearchPage() {
  const {
    // 検索フォーム（URLパラメータから取得）
    searchParams,

    // 検索実行（URL更新）
    search,
    resetSearch,

    // 検索結果
    results,
    pagination,
    isLoading,
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
  } = useUcarSearch()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-emerald-600">&#128663;</span>
            中古車検索
          </h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 検索フォーム */}
        <UcarSearchForm
          values={searchParams}
          onSearch={search}
          onReset={resetSearch}
          fields={{
            keyword: true,
            brandName: true,
            latestProcessCode: true,
            destinationStoreId: true,
            driveType: true,
            isKei: true,
            includeSold: true,
          }}
          storeList={storeList}
          isLoading={isLoading}
        />

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* 検索結果テーブル */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <SearchResultTable
            results={results}
            pagination={pagination}
            isLoading={isLoading}
            onRowClick={openDetailModal}
            onPageChange={goToPage}
          />
        </div>

        {/* 検索ヒント */}
        {results.length === 0 && !isLoading && !error && (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-4xl mb-3">&#128269;</div>
            <p className="text-gray-600 mb-2">検索条件を入力して「検索」ボタンを押してください</p>
            <p className="text-sm text-gray-400">
              キーワード、メーカー、状況などで絞り込みができます
            </p>
          </div>
        )}
      </main>

      {/* 詳細モーダル */}
      <UcarDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        ucar={selectedUcar}
        isLoading={isDetailLoading}
      />
    </div>
  )
}
