'use client'

import { UcarProcessCl } from '@app/(apps)/ucar/class/UcarProcessCl'
import { RetentionCarDetail } from '../server-actions'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { getColorStyles } from '@cm/lib/methods/colors'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { cn } from '@cm/shadcn/lib/utils'
import { Days } from '@cm/class/Days/Days'
import { HREF } from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import Link from 'next/link'

// ============================================================
// 型定義
// ============================================================

export type UcarProcessTableProps = {
  /** 車両データ（RetentionCarDetail 型） */
  cars: RetentionCarDetail[]
  isLoading?: boolean

  /** オプション機能 */
  options?: {
    /** LT差分を赤丸バッジで表示 */
    showLTBadge?: boolean
    /** フォーカス工程コード（アウトライン強調） */
    focusProcessCode?: string
    /** フォーカス工程の色（アウトライン色） */
    focusColor?: string
    /** 今日完了工程を緑でハイライト */
    highlightToday?: boolean
    /** 現在工程にpulseアニメーション */
    pulseCurrentProcess?: boolean
  }
}

// ============================================================
// ヘルパー
// ============================================================

/** 表示用工程一覧（メインフロー + 販売日） */
const ALL_PROCESSES = [
  ...(UcarProcessCl.CODE.array?.filter(p => p.list?.includes('main')) ?? []),
  UcarProcessCl.CODE.raw.SALES_DATE,
].filter(Boolean)

/** 日付間の日数差を計算 */
function calcDaysDiff(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime()
  return ms / (1000 * 60 * 60 * 24)
}


function getBackGroundColor(lt: number): string {
  if (lt <= 1) return 'bg-green-500 !text-[10px]'
  if (lt <= 5) return 'bg-yellow-500 !text-[10px]'
  if (lt <= 10) return 'bg-orange-500 !text-[12px]'
  return 'bg-red-500 !text-[13px]'
}

// ============================================================
// メインコンポーネント
// ============================================================

export function UcarProcessTable({ cars, isLoading, options = {} }: UcarProcessTableProps) {
  const { query } = useGlobal()
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (cars.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-400">車両データがありません</div>
      </div>
    )
  }

  return CsvTable({
    records: cars.map(car => {
      // processMapを拡張: 販売日（code='SALES'）は ai21.DD_URIAGE から取得
      const extendedProcessMap: Record<string, string | null> = {...car.processMap}
      if (car.ai21.DD_URIAGE) {
        extendedProcessMap['SALES'] = car.ai21.DD_URIAGE.toISOString()
      }

      // 完了済み工程の配列（順序通り）
      const completedProcesses: {code: string; date: Date}[] = []
      for (const proc of ALL_PROCESSES) {
        const dateIso = extendedProcessMap[proc.code]
        if (dateIso) {
          completedProcesses.push({code: proc.code, date: new Date(dateIso)})
        }
      }

      // 各工程からの LT を計算（次に完了した工程までの日数）
      const ltMap: Record<string, number | null> = {}
      for (let i = 0; i < completedProcesses.length - 1; i++) {
        const from = completedProcesses[i]
        const to = completedProcesses[i + 1]
        ltMap[from.code] = calcDaysDiff(from.date, to.date)
      }

      // 最新完了工程
      const lastProcessCode = completedProcesses[completedProcesses.length - 1]?.code

      return {
        csvTableRow: [
          // --- 査定ID ---
          {
            label: '査定ID',
            cellValue: (
              <Link
                href={HREF('/ucar/ucar', {
                  __search__sateiID: car.sateiID,
                  displayColumns: '下取書類,商品化',
                }, query)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-blue-600 hover:text-blue-800 underline"
              >
                {car.sateiID}
              </Link>
            ),
            style: { minWidth: 100 },
          },

          // --- 車種・グレード ---
          {
            label: '車種・グレード',
            cellValue: (
              <div>
                <div>{[car.tmpBrandName, car.tmpModelName].filter(Boolean).join(' ') || '-'}</div>
                {car.tmpGrade && <div className="text-gray-500">{car.tmpGrade}</div>}
              </div>
            ),
            style: { minWidth: 140 },
          },

          // --- 担当店舗・スタッフ ---
          {
            label: '担当店舗・スタッフ',
            cellValue: (
              <div>
                <div>{car.storeName ?? '-'}</div>
                {car.userName && <div className="text-gray-500">{car.userName}</div>}
              </div>
            ),
            style: { minWidth: 120 },
          },

          // --- QR発行日 ---
          {
            label: 'QR発行日',
            cellValue: formatDate(new Date(car.qrIssuedAt), 'YY/MM/DD'),
            style: { minWidth: 80 },
            className: 'text-center',
          },

          // --- ai21売上 ---
          {
            label: 'ai21売上',
            cellValue: (
              <div>
                {car.ai21.DD_URIAGE && <div>{formatDate(car.ai21.DD_URIAGE, 'YY/MM/DD')}</div>}
                {car.ai21.CD_ZAIKOTEN && <div className="text-gray-500 text-[10px]">{car.ai21.CD_ZAIKOTEN}</div>}
                {car.ai21.KI_HANKAKA != null && (
                  <div className="font-bold">{(car.ai21.KI_HANKAKA / 10000).toFixed(1)}万円</div>
                )}
              </div>
            ),
            style: { minWidth: 100 },
            className: 'text-center',
          },

          // --- 工程列（12列: 11工程 + 販売日） ---
          ...ALL_PROCESSES.map(proc => {
            const dateIso = extendedProcessMap[proc.code]
            const isCurrentProcess = proc.code === lastProcessCode
            const isFocusProcess = proc.code === options.focusProcessCode
            const isToday = dateIso && options.highlightToday && Days.validate.isSameDate(new Date(dateIso), new Date())
            const lt = ltMap[proc.code]

            return {
              label: <div>{proc.label}</div>,
              cellValue: dateIso ? (
                <div className="relative">
                  <div>{formatDate(new Date(dateIso), 'YY/MM/DD(ddd)')}</div>
                  <div>{formatDate(new Date(dateIso), 'HH:mm')}</div>

                  {/* LT差分バッジ（オプション） */}
                  {options.showLTBadge && lt !== null && lt !== undefined && lt > 0.1 && (
                    <div className={cn(
                      getBackGroundColor(lt),
                      "absolute center-y -right-4 z-10  text-white text-[9px] font-bold rounded-full px-1 flex items-center justify-center shadow",)}>
                      +{lt.toFixed(1)}
                    </div>
                  )}
                </div>
              ) : (
                ''
              ),
              style: {
                ...(!dateIso ? { backgroundColor: '#00000070' } : {}),
                ...(isCurrentProcess && dateIso
                  ? {
                    backgroundColor: isToday ? '#d2f7d6' : '#ffff00',
                    ...(options.pulseCurrentProcess ? { animation: 'pulse 3s infinite' } : {}),
                  }
                  : {}),
                ...(isFocusProcess && dateIso && options.focusColor
                  ? { outline: `2px solid ${options.focusColor}`, outlineOffset: -2 }
                  : {}),
              },
              thStyle: {
                ...getColorStyles(proc.color ?? ''),
                minWidth: 110,
                animation: undefined,
              },
              className: cn('text-center align-middle'),
            }
          }),
        ],
      }
    }),
  }).WithWrapper({
    className: cn('[&_th]:!p-0', '[&_td]:!py-0.5', '[&_td]:text-xs', '[&_td]:align-middle'),
  })
}
