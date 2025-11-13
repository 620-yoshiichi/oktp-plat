'use client'

import {useEffect, useState} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {toastByResult} from '@cm/lib/ui/notifications'
import {processApproval} from '@app/(apps)/newCar/server-actions/tenpoTsuikoActions'
import {isDev} from '@cm/lib/methods/common'

interface TenpoTsuikoShinseiHistoryProps {
  selectedHeaderId?: string
  histories: ApprovalHeader[]
  fetchHistories: () => void
}

interface ApprovalDetail {
  id: number
  userId: number
  status: string
  comment?: string
  approvalOrder: number
  processedAt?: string
  User: {
    id: number
    name: string
    email?: string
    UserRole: {name: string}[]
  }
}

export interface ApprovalHeader {
  id: number
  date: string
  approvalOrder: number
  active: boolean
  TenpoTsuikoShinseiDetail: ApprovalDetail[]
  NewCar: {
    KJ_KURUMAME?: string
    NO_CYUMON?: string
    Store?: {name: string}
    User?: {name: string}
  }
}

export default function TenpoTsuikoShinseiHistory({selectedHeaderId, histories, fetchHistories}: TenpoTsuikoShinseiHistoryProps) {
  const {session} = useGlobal()

  const [processing, setProcessing] = useState<number | null>(null)
  const [commentInput, setCommentInput] = useState<{[key: number]: string}>({})

  useEffect(() => {
    if (selectedHeaderId && histories.length > 0) {
      const selectedElement = document.getElementById(`header-${selectedHeaderId}`)
      if (selectedElement) {
        selectedElement.scrollIntoView({behavior: 'smooth', block: 'center'})
      }
    }
  }, [selectedHeaderId, histories])

  const handleApproval = async (detailId: number, status: 'approved' | 'rejected') => {
    const comment = commentInput[detailId] || ''

    if (status === 'rejected' && !comment.trim()) {
      toastByResult({success: false, message: '拒否理由を入力してください'})
      return
    }

    try {
      setProcessing(detailId)

      const result = await processApproval({
        detailId,
        status,
        comment: comment.trim(),
        userId: session?.id,
      })

      toastByResult(result)

      if (result.success) {
        // 履歴を再取得
        await fetchHistories()
        // コメント入力をクリア
        setCommentInput(prev => ({...prev, [detailId]: ''}))
      }
    } catch (error) {
      console.error('承認処理エラー:', error)
      toastByResult({success: false, message: '承認処理に失敗しました'})
    } finally {
      setProcessing(null)
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'waiting':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '承認済み'
      case 'rejected':
        return '拒否'
      case 'pending':
        return '承認待ち'
      case 'waiting':
        return '待機中'
      default:
        return '不明'
    }
  }

  const canCurrentUserApprove = (detail: ApprovalDetail) => {
    // 現在のユーザーが承認者で、かつ承認待ち状態の場合のみ承認可能
    return (detail.userId === session?.id || isDev) && detail.status === 'pending'
  }

  const getOverallStatus = (details: ApprovalDetail[]) => {
    if (details.some(d => d.status === 'rejected')) {
      return {text: '拒否済み', style: 'bg-red-100 text-red-800'}
    }
    if (details.every(d => d.status === 'approved')) {
      return {text: '承認完了', style: 'bg-green-100 text-green-800'}
    }
    if (details.some(d => d.status === 'pending')) {
      return {text: '承認中', style: 'bg-yellow-100 text-yellow-800'}
    }
    return {text: '待機中', style: 'bg-gray-100 text-gray-600'}
  }

  if (histories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>店舗追工申請履歴がありません</p>
      </div>
    )
  }

  return (
    <C_Stack className="space-y-4">
      <h3 className="text-lg font-semibold">店舗追工申請履歴</h3>

      {histories
        .filter(header => header.active)
        .map(header => {
          const overallStatus = getOverallStatus(header.TenpoTsuikoShinseiDetail)
          const isSelected = selectedHeaderId && header.id.toString() === selectedHeaderId

          return (
            <div
              key={header.id}
              id={`header-${header.id}`}
              className={`border rounded-lg bg-white shadow-sm ${isSelected ? 'ring-2 ring-blue-500 border-blue-300' : ''}`}
            >
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">申請日: {new Date(header.date).toLocaleDateString('ja-JP')}</div>
                    <div className="text-sm text-gray-600">
                      車両: {header.NewCar.KJ_KURUMAME} ({header.NewCar.NO_CYUMON})
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${overallStatus.style}`}>
                    {overallStatus.text}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-3">
                  {header.TenpoTsuikoShinseiDetail.map(detail => (
                    <div key={detail.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium">{detail.User.name}</span>
                            <span className="text-sm text-gray-600">(順番: {detail.approvalOrder})</span>
                            <span className={`px-2 py-1 rounded border text-xs font-medium ${getStatusStyle(detail.status)}`}>
                              {getStatusText(detail.status)}
                            </span>
                          </div>

                          {detail.comment && (
                            <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded mb-2">
                              <strong>コメント:</strong> {detail.comment}
                            </div>
                          )}

                          {detail.processedAt && (
                            <div className="text-xs text-gray-500">
                              処理日時: {new Date(detail.processedAt).toLocaleString('ja-JP')}
                            </div>
                          )}

                          {canCurrentUserApprove(detail) && (
                            <div className="mt-3 space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  コメント
                                  {detail.status === 'pending' && <span className="text-red-500">（拒否の場合は必須）</span>}
                                </label>
                                <textarea
                                  className="w-full p-2 border rounded-md text-sm"
                                  rows={2}
                                  placeholder="承認・拒否の理由やコメントを入力してください"
                                  value={commentInput[detail.id] || ''}
                                  onChange={e =>
                                    setCommentInput(prev => ({
                                      ...prev,
                                      [detail.id]: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  color="green"
                                  onClick={() => handleApproval(detail.id, 'approved')}
                                  disabled={processing === detail.id}
                                >
                                  {processing === detail.id ? '処理中...' : '承認'}
                                </Button>
                                <Button
                                  size="sm"
                                  color="red"
                                  onClick={() => handleApproval(detail.id, 'rejected')}
                                  disabled={processing === detail.id}
                                >
                                  拒否
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
    </C_Stack>
  )
}
