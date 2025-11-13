'use client'

import {useState} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {toastByResult} from '@cm/lib/ui/notifications'
import {createTenpoTsuikoShinsei} from '@app/(apps)/newCar/server-actions/tenpoTsuikoActions'

interface TenpoTsuikoHistoryModalProps {
  carData: any
  onRefresh: () => void
  usedIn: 'crPage' | 'newCarList'
}

export default function TenpoTsuikoHistoryModal({carData, onRefresh, usedIn}: TenpoTsuikoHistoryModalProps) {
  const [processing, setProcessing] = useState(false)

  if (!carData) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP')
  }

  const getStatusDisplay = (details: any[]) => {
    if (details.some((d: any) => d.status === 'rejected')) {
      return '却下済み'
    }
    if (details.every((d: any) => d.status === 'approved')) {
      return '承認完了'
    }
    if (details.some((d: any) => d.status === 'pending')) {
      return '承認中'
    }
    return '申請済み'
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case '承認完了':
        return 'bg-green-100 text-green-800'
      case '却下済み':
        return 'bg-red-100 text-red-800'
      case '承認中':
        return 'bg-yellow-100 text-yellow-800'
      case '申請済み':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const handleNewApplication = async () => {
    if (confirm('新規申請を行いますか？')) {
      try {
        setProcessing(true)
        console.log('新規申請開始:', carData.id)

        const result = await createTenpoTsuikoShinsei({
          newCarId: carData.id,
        })

        console.log('申請結果:', result)
        toastByResult(result)

        if (result.success) {
          console.log('申請成功 - データ更新開始')
          await onRefresh()
          console.log('データ更新完了')
        }
      } catch (error) {
        console.error('新規申請エラー:', error)
        toastByResult({success: false, message: '新規申請の作成に失敗しました'})
      } finally {
        setProcessing(false)
      }
    }
  }

  const handleViewDetail = (headerId: string) => {
    const url = `/newCar/tenpo-tsuiko-shinsei/${carData.id}?headerId=${headerId}`
    console.log('Opening detail page:', url)
    window.open(url, '_blank')
  }

  return (
    <>
      {/* 車両情報 */}
      <div className="px-6 py-4 bg-blue-50 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">注文番号:</span>
            <span className="ml-2 font-mono">{carData.NO_CYUMON || '-'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">車名:</span>
            <span className="ml-2">{carData.KJ_KURUMAME || '-'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">店舗:</span>
            <span className="ml-2">{carData.Store?.name || '-'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">担当者:</span>
            <span className="ml-2">{carData.User?.name || '-'}</span>
          </div>
        </div>

        {/* 追工作業詳細 */}
        {carData.TenpoTsuikoData && carData.TenpoTsuikoData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">追工作業詳細</h4>
            <div className="space-y-2">
              {carData.TenpoTsuikoData.map((tsuiko: any, index: number) => (
                <div key={index} className="bg-white rounded-lg p-3 border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">追工コード:</span>
                      <span className="ml-2 font-mono">{tsuiko.CD_TUIKO || '-'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">作業内容:</span>
                      <span className="ml-2">{tsuiko.MJ_TUIKOM || '-'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">追工金額:</span>
                      <span className="ml-2 font-mono">
                        {tsuiko.KI_TUIKOKIN ? `¥${tsuiko.KI_TUIKOKIN.toLocaleString()}` : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">処理状況:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          tsuiko.processed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {tsuiko.processed ? '処理済み' : '未処理'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 申請履歴 */}
      <div className="px-6 py-4 flex-1 overflow-auto">
        {carData.TenpoTsuikoShinseiHeader && carData.TenpoTsuikoShinseiHeader.length > 0 ? (
          <C_Stack>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">申請履歴一覧</h3>
              <div className="flex gap-2">
                {usedIn === 'crPage' && (
                  <Button color="red" size="sm" onClick={handleNewApplication} disabled={processing}>
                    {processing ? '処理中...' : '新規申請'}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {carData.TenpoTsuikoShinseiHeader.sort(
                (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              ).map((header: any, index: number) => {
                const status = getStatusDisplay(header.TenpoTsuikoShinseiDetail)
                const isActive = header.active !== false // activeがfalseでない場合はアクティブ
                return (
                  <div
                    key={header.id}
                    className={`border-2 rounded-lg p-4 ${isActive ? 'bg-gray-50' : 'bg-gray-200 opacity-30 border-none'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">申請 #{index + 1}</span>
                          {!isActive && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">無効</span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(status)}`}>{status}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">申請日時: {formatDate(header.createdAt)}</div>
                      </div>
                      <Button color="blue" size="sm" onClick={() => handleViewDetail(header.id)}>
                        詳細
                      </Button>
                    </div>

                    {/* 承認フロー詳細 */}
                    <div className="bg-white rounded border p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">承認フロー</h4>
                      <div className="space-y-2">
                        {header.TenpoTsuikoShinseiDetail.sort((a: any, b: any) => a.approvalOrder - b.approvalOrder).map(
                          (detail: any, detailIndex: number) => (
                            <div key={detail.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">
                                  {detailIndex + 1}. {detail.User?.name || '未設定'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    detail.status === 'approved'
                                      ? 'bg-green-100 text-green-800'
                                      : detail.status === 'rejected'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {detail.status === 'approved' ? '承認済み' : detail.status === 'rejected' ? '却下' : '承認待ち'}
                                </span>
                                {detail.updatedAt && detail.status !== 'pending' && (
                                  <span className="text-xs text-gray-500">{formatDate(detail.updatedAt)}</span>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </C_Stack>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">申請履歴がありません</div>
            <div className="flex gap-2 justify-center">
              <Button color="red" size="sm" onClick={handleNewApplication} disabled={processing}>
                {processing ? '処理中...' : '新規申請'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
