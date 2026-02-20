'use client'

import React from 'react'
import type { UcarSearchResult, PaginationInfo } from '../types'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { UcarProcessCl } from '@app/(apps)/ucar/class/UcarProcessCl'
import { UcarCL } from '@app/(apps)/ucar/class/UcarCL'
import { TextRed } from '@cm/components/styles/common-components/Alert'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import { C_Stack } from '@cm/components/styles/common-components/common-components'
import { NumHandler } from '@cm/class/NumHandler'
import Coloring from '@cm/lib/methods/Coloring'

type SearchResultTableProps = {
  results: UcarSearchResult[]
  pagination: PaginationInfo | null
  isLoading: boolean
  onRowClick: (sateiID: string) => void
  onPageChange: (page: number) => void
}

// ナンバープレート表示用ヘルパー
function formatPlate(ucar: UcarSearchResult): string {
  const upass = ucar.UPASS

  if (upass) {
    const parts = [
      upass.landAffairsName || '',
      upass.registrationClassNumber || '',
      upass.registrationKana || '',
      upass.registrationSerialNumber || '',
    ].filter(Boolean)
    return parts.join(' ')
  }

  // UPASSがない場合はtmpフィールドを使用
  return ucar.tmpPlate || ucar.plate || '-'
}



export default function SearchResultTable({
  results,
  pagination,
  isLoading,
  onRowClick,
  onPageChange,
}: SearchResultTableProps) {
  const { data: storeList } = useDoStandardPrisma('store', 'findMany', {
    where: {
      code: {
        in: results.map(ucar => Number(ucar.OldCars_Base?.ZAIKO_Base?.CD_ZAIKOTEN ?? 0)),
      },
    },
  })


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        <span className="ml-3 text-gray-600">検索中...</span>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        検索結果がありません
      </div>
    )
  }

  return (
    <C_Stack className={`p-2`} >
      <TextRed>配送先は、「新QRシステムにて中古車Gが設定した配送先入力」を表示しますが、旧QRシステム時代のデータに関しては「ai21の在庫店舗」を表示しています。</TextRed>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                査定番号/98番号
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                QRシート発行日
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                車体番号/型式
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                メーカー/車名
              </th>


              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                年式
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                ナンバー
              </th>

              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                最新工程
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                販売結果
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                配送先
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                排気量/駆動方式
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((ucar, index) => {

              const ucarInst = new UcarCL(ucar)
              const latestProcess = ucarInst.latestProcess


              const zaikoBase = ucar.OldCars_Base?.ZAIKO_Base
              const ZaikoStoreModel = storeList?.find(store => String(store.code) === String(zaikoBase?.CD_ZAIKOTEN ?? ''))

              const storeName = ZaikoStoreModel?.name ?? ucarInst.data?.DestinationStore?.name ?? '-';




              return (
                <tr
                  key={ucar.sateiID}
                  onClick={() => onRowClick(ucar.sateiID)}
                  className={`
                    cursor-pointer transition-colors
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    hover:bg-emerald-50
                  `}
                >
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <span>{ucar.sateiID}</span>
                    <br />
                    <small>{ucar.number98 || '-'}</small>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {ucar.createdAt ? formatDate(new Date(ucar.createdAt)) : '-'}
                  </td>


                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {ucarInst.notation?.chassisNumber || '-'}
                    <br />
                    {ucarInst.notation?.type || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {ucarInst.notation?.brandName || '-'} /
                    {ucarInst.notation?.modelName || '-'}
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {ucarInst.notation?.modelYear || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {ucarInst.notation?.plate || '-'}
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <Coloring
                        mode='text'
                        color={UcarProcessCl.CODE.byCode(latestProcess?.processCode ?? '')?.color ?? 'blue'}
                        className={`inline-flex text-[12px] p-0.5!  `}>

                        {UcarProcessCl.CODE.byCode(latestProcess?.processCode ?? '')?.label || '-'}
                      </Coloring>
                    </div>
                    <small>{latestProcess?.date ? formatDate(new Date(latestProcess.date)) : '-'}</small>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <small>{formatDate(ucarInst.ai21Data.DD_URIAGE, 'YY/MM/DD') || '-'}</small>
                    <br />
                    <small className={`text-blue-700`}>{NumHandler.toPrice(Number(ucarInst.ai21Data?.KI_HANKAKA ?? 0)) || '-'}</small>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {storeName}
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {ucarInst.notation?.displacement || '-'} /
                    {ucarInst.notation?.driveType || '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* ページネーション */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
            <div className="flex-1 flex justify-between items-center">
              <p className="text-sm text-gray-700">
                全 <span className="font-medium">{pagination.total}</span> 件中{' '}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.perPage + 1}
                </span>{' '}
                -{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.perPage, pagination.total)}
                </span>{' '}
                件を表示
              </p>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className={`
                    relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium
                    ${pagination.page <= 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                    }
                  `}
                >
                  前へ
                </button>

                {/* ページ番号表示 */}
                {generatePageNumbers(pagination.page, pagination.totalPages).map((pageNum, idx) => (
                  pageNum === '...' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum as number)}
                      className={`
                        relative inline-flex items-center px-4 py-2 border text-sm font-medium
                        ${pagination.page === pageNum
                          ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }
                      `}
                    >
                      {pageNum}
                    </button>
                  )
                ))}

                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className={`
                    relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium
                    ${pagination.page >= pagination.totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                    }
                  `}
                >
                  次へ
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </C_Stack>
  )
}

// ページ番号生成ヘルパー
function generatePageNumbers(current: number, total: number): (number | '...')[] {
  const delta = 2
  const range: (number | '...')[] = []

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i)
    } else if (range[range.length - 1] !== '...') {
      range.push('...')
    }
  }

  return range
}
