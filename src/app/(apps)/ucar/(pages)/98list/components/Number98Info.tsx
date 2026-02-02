'use client'

import { R_Stack } from '@cm/components/styles/common-components/common-components'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { cl } from '@cm/lib/methods/common'
import type { Search98NumberResult } from '@app/(apps)/ucar/(lib)/num98/search98Number'

type Props = {
  searchResult: Search98NumberResult
}

export function Number98Info({ searchResult }: Props) {
  const { number98, isAvailable, unavailableReasons } = searchResult

  if (!number98) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <p className="text-yellow-800 font-semibold">{unavailableReasons[0]?.detail}</p>
      </div>
    )
  }

  return (
    <div className={cl('border rounded p-4', isAvailable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')}>
      <R_Stack className="gap-8 items-start flex-wrap">
        {/* 98番号基本情報 */}
        <div>
          <h2 className="text-lg font-semibold mb-2">98番号: {number98.number}</h2>
          <div className="text-sm space-y-1">
            <p>ソート番号: {number98.sortNumber ?? '-'}</p>
            <p>作成日: {formatDate(number98.createdAt, 'YYYY/MM/DD HH:mm')}</p>
            {number98.updatedAt && <p>更新日: {formatDate(number98.updatedAt, 'YYYY/MM/DD HH:mm')}</p>}
          </div>
        </div>

        {/* 利用可否判定 */}
        <div>
          <div
            className={cl(
              'inline-block px-4 py-2 rounded text-lg font-bold mb-3',
              isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            )}
          >
            {isAvailable ? '✓ 利用可能' : '✗ 利用不可'}
          </div>

          {/* 条件チェック結果一覧 */}
          <div className="space-y-1">
            {unavailableReasons.map((reason, i) => (
              <div
                key={i}
                className={cl(
                  'text-sm flex items-start gap-2 p-1.5 rounded',
                  reason.matched ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                )}
              >
                <span className="font-bold shrink-0">{reason.matched ? '✗' : '✓'}</span>
                <span>
                  <span className="font-semibold">{reason.condition}:</span> {reason.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      </R_Stack>
    </div>
  )
}
