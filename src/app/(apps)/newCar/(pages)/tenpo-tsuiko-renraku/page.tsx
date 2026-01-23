'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { toastByResult } from '@cm/lib/ui/notifications'
import { getTenpoTsuikoData } from '@app/(apps)/newCar/server-actions/tenpoTsuikoActions'

import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'

import { TenpoTsuikoShinseiStatusButton } from '@app/(apps)/newCar/(pages)/tenpo-tsuiko-renraku/TenpoTsuikoShinseiStatusButton'
import useTempoTsuikoGMF from '@app/(apps)/newCar/templateHooks/useTempoTsuikoGMF'
import { Button } from '@cm/components/styles/common-components/Button'
import { IconBtn } from '@cm/components/styles/common-components/IconBtn'
import { getStatusColor } from './TenpoTsuikoShinseiStatusButton'
import { T_LINK } from '@cm/components/styles/common-components/links'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

// ステータスフィルターの型定義
type StatusFilter = 'all' | '未申請' | '申請中' | '承認完了' | '却下'

export default function TenpoTsuikoRenrakuPage() {
  const tempoTsuikoGMF = useTempoTsuikoGMF()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [tuikoData, setTsuikoData] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [searchNoCyumon, setSearchNoCyumon] = useState<string>('')

  // URLクエリからステータスフィルターを取得
  const statusFilter = (searchParams?.get('status') as StatusFilter) || 'all'

  // ステータスフィルターを更新する関数
  const updateStatusFilter = (newStatus: StatusFilter) => {
    if (!searchParams) return

    const params = new URLSearchParams(searchParams)
    if (newStatus === 'all') {
      params.delete('status')
    } else {
      params.set('status', newStatus)
    }
    router.push(`?${params.toString()}`)
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await getTenpoTsuikoData(searchNoCyumon, statusFilter)

      if (result.success) {
        console.log('データ取得成功:', result.data?.length, '件')
        setTsuikoData(result.data)
      } else {
        console.error('データ取得失敗:', result)
        toastByResult({ success: false, message: result.message || 'エラーが発生しました' })
      }
    } catch (error) {
      console.error('データ取得エラー:', error)
      toastByResult({ success: false, message: 'データ取得に失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [statusFilter]) // ステータスフィルターが変更されたときにデータを再取得

  // 検索ボタンがクリックされたときの処理
  const handleSearch = () => {
    fetchData()
  }

  // ステータスを取得する関数

  const formatCurrency = (value: number) => {
    if (!value) return '未設定'
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(value)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-4 w-fit">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 追工コード「3999」「360Z」「721Z」に該当する車両データを表示しています</li>
          <li>• 操作ボタンを押すと申請履歴が表示され、新規申請や詳細確認ができます</li>
          <li>• 承認者には順次メール通知が送信されます</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <C_Stack>
          {/* ステータスフィルター */}
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">ステータスでフィルター</div>
            <div className="flex flex-wrap gap-2">
              <IconBtn
                onClick={() => updateStatusFilter('all')}
                color="blue"
                className={statusFilter === 'all' ? 'opacity-100' : 'opacity-30'}
              >
                全て
              </IconBtn>
              <IconBtn
                onClick={() => updateStatusFilter('未申請')}
                color={getStatusColor('未申請')}
                className={statusFilter === '未申請' ? 'opacity-100' : 'opacity-30'}
              >
                未申請
              </IconBtn>
              <IconBtn
                onClick={() => updateStatusFilter('申請中')}
                color={getStatusColor('申請中')}
                className={statusFilter === '申請中' ? 'opacity-100' : 'opacity-30'}
              >
                申請中
              </IconBtn>
              <IconBtn
                onClick={() => updateStatusFilter('承認完了')}
                color={getStatusColor('承認完了')}
                className={statusFilter === '承認完了' ? 'opacity-100' : 'opacity-30'}
              >
                承認済み
              </IconBtn>
              <IconBtn
                onClick={() => updateStatusFilter('却下')}
                color={getStatusColor('却下')}
                className={statusFilter === '却下' ? 'opacity-100' : 'opacity-30'}
              >
                却下
              </IconBtn>
            </div>
          </div>

          <R_Stack>
            <div className="text-sm text-gray-600">
              {statusFilter === 'all'
                ? `${tuikoData.length}台の車両が見つかりました`
                : `${tuikoData.length}台の車両が表示されています（${statusFilter}）`}
            </div>
            <input
              type="text"
              placeholder="受注番号で検索"
              value={searchNoCyumon}
              onChange={e => setSearchNoCyumon(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={handleSearch}>検索</Button>
          </R_Stack>
          {CsvTable({
            records: tuikoData.map(row => {
              return {
                csvTableRow: [
                  // {cellValue: <div className="font-mono text-sm">{row.APPINDEX}</div>},
                  {
                    label: '注文番号',
                    cellValue: <div className="font-mono text-sm">{row.NO_CYUMON || '-'}</div>,
                    style: { width: 120 },
                  },
                  {
                    label: '車名',
                    cellValue: <div className="font-medium">{row.KJ_KURUMAME || '未設定'}</div>,
                    style: { width: 150 },
                  },
                  {
                    label: '追工件数',
                    cellValue: <div className="font-mono">{row.TenpoTsuikoData?.length || 0}件</div>,
                    style: { width: 100 },
                  },
                  {
                    label: '追工内容',
                    cellValue: (
                      <div className="max-w-[180px] truncate">
                        {row.TenpoTsuikoData?.map(t => t.MJ_TUIKOM + `(${t.CD_TUIKO})`).map((item, index) => (
                          <div key={index}>{item}</div>
                        ))}
                      </div>
                    ),
                    style: { width: 200 },
                  },
                  {
                    label: '追工金額合計',
                    cellValue: (
                      <div className="text-right font-medium">
                        {formatCurrency(row.TenpoTsuikoData?.reduce((sum, t) => sum + (t.KI_TUIKOKIN || 0), 0))}
                      </div>
                    ),
                    style: { width: 120 },
                  },
                  { label: '店舗', cellValue: <div>{row.Store?.name || '-'}</div>, style: { width: 120 } },
                  { label: '担当者', cellValue: <div>{row.User?.name || '-'}</div>, style: { width: 120 } },

                  {
                    label: '配送希望日',
                    cellValue: (
                      <div>
                        <div>{formatDate(row.DD_HAISKIBO) || '-'}</div>
                      </div>
                    ),
                    style: { width: 120 },
                  },
                  {
                    label: '操作',
                    cellValue: (
                      <TenpoTsuikoShinseiStatusButton
                        {...{
                          handleOpenModal: (params: { newCar: any }) => {
                            tempoTsuikoGMF.setGMF_OPEN({
                              onRefresh: () => fetchData(),
                              newCar: params.newCar,
                              usedIn: 'crPage',
                            })
                          },
                          rowData: row,
                        }}
                      />
                    ),
                    style: { width: 120 },
                  },

                  {
                    label: 'テスト',
                    cellValue: <T_LINK {...{ href: `/newCar/tenpo-tsuiko-shinsei/${row.id}` }}>テスト</T_LINK>,
                    style: { width: 120 },
                  },
                ],
              }
            }),
          }).WithWrapper({ className: 'max-h-[50vh]' })}
        </C_Stack>
      </div>

      {tuikoData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {statusFilter === 'all' ? '店舗追工対象の車両が見つかりませんでした' : `${statusFilter}の車両が見つかりませんでした`}
        </div>
      )}

      <tempoTsuikoGMF.Modal />
    </div>
  )
}
