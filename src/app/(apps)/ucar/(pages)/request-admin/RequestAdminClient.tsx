'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Button } from '@cm/components/styles/common-components/Button'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { UCAR_CODE } from '@app/(apps)/ucar/class/UCAR_CODE'
import { UcarRequestCl } from '@app/(apps)/ucar/class/UcarRequestCl'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { getColorStyles } from '@cm/lib/methods/colors'
import { cn } from '@cm/shadcn/lib/utils'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'

type RequestAdminClientProps = {
  initialRequests: any[]
  initialStatusFilter: string
  sessionId: number
}

export default function RequestAdminClient(props: RequestAdminClientProps) {
  const { initialRequests, initialStatusFilter, sessionId } = props
  const router = useRouter()
  const [requests, setRequests] = useState(initialRequests)
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter)
  const [isProcessing, setIsProcessing] = useState<number | null>(null)
  const [rejectedReason, setRejectedReason] = useState('')

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    const params = new URLSearchParams()
    if (status !== 'all') {
      params.set('status', status)
    }
    router.push(`/ucar/request-admin${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const handleApprove = async (requestId: number) => {
    if (!confirm('この申請を承諾しますか？')) return

    setIsProcessing(requestId)
    try {
      const result = await UcarRequestCl.approve({
        requestId,
        approvedById: sessionId,
      })

      if (result.success) {
        toast.success(result.message)
        // リストを更新
        setRequests(prev =>
          prev.map(req => (req.id === requestId ? { ...req, status: 'approved', approvedAt: new Date() } : req))
        )
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('承諾エラー:', error)
      toast.error('承諾処理に失敗しました')
    } finally {
      setIsProcessing(null)
    }
  }

  const handleReject = async (requestId: number) => {
    setIsProcessing(requestId)
    try {
      const result = await UcarRequestCl.reject({
        requestId,
        approvedById: sessionId,
        rejectedReason,
      })

      if (result.success) {
        toast.success(result.message)
        // リストを更新
        setRequests(prev =>
          prev.map(req => (req.id === requestId ? { ...req, status: 'rejected', approvedAt: new Date() } : req))
        )
        setRejectedReason('')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('却下エラー:', error)
      toast.error('却下処理に失敗しました')
    } finally {
      setIsProcessing(null)
    }
  }

  const statusOptions = [
    { value: 'all', label: 'すべて' },
    { value: 'pending', label: '申請中' },
    { value: 'approved', label: '承諾済' },
    { value: 'rejected', label: '却下済' },
  ]

  return (
    <C_Stack className="gap-6">
      {/* ステータスフィルタ */}
      <R_Stack className="gap-2">
        {statusOptions.map(option => (
          <Button
            key={option.value}
            color={statusFilter === option.value ? 'blue' : 'gray'}
            onClick={() => handleStatusFilterChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </R_Stack>

      {/* 申請一覧 */}
      {requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">申請がありません</div>
      ) : (
        CsvTable({
          records: requests.map(request => {
            const requestTypeObj = UCAR_CODE.REQUEST_TYPES.byCode(request.requestType)
            const statusObj = UCAR_CODE.REQUEST_STATUS.array.find(s => s.code === request.status)

            return {
              csvTableRow: [
                {
                  label: 'ID',
                  cellValue: request.id,
                  style: { minWidth: 50 },
                },
                {
                  label: '申請日時',
                  cellValue: formatDate(request.createdAt, 'YYYY/MM/DD HH:mm'),
                  style: { minWidth: 130 },
                },
                {
                  label: '査定番号',
                  cellValue: (
                    <div>
                      <div className="font-semibold">{request.sateiID}</div>
                      <small className="text-gray-500">{request.Ucar?.Store?.name}</small>
                    </div>
                  ),
                  style: { minWidth: 120 },
                },
                {
                  label: '申請区分',
                  cellValue: requestTypeObj?.label || request.requestType,
                  style: {
                    minWidth: 100,
                    ...getColorStyles(requestTypeObj?.color || ''),
                  },
                  thStyle: { background: undefined, color: undefined, },
                },
                {
                  label: '申請理由',
                  cellValue: <div className="max-w-[200px] truncate">{request.reason}</div>,
                  style: { minWidth: 150 },
                },
                {
                  label: '申請者',
                  cellValue: request.User?.name,
                  style: { minWidth: 100 },
                },
                {
                  label: 'ステータス',
                  cellValue: statusObj?.label || request.status,
                  style: {
                    minWidth: 80,
                    ...getColorStyles(statusObj?.color || ''),
                  },
                  thStyle: { background: undefined, color: undefined, },
                },
                {
                  label: '処理日時',
                  cellValue: request.approvedAt ? formatDate(request.approvedAt, 'YYYY/MM/DD HH:mm') : '-',
                  style: { minWidth: 130 },
                },
                {
                  label: '操作',
                  cellValue:
                    request.status === 'pending' ? (
                      <R_Stack className="gap-2">
                        <Button
                          color="green"
                          onClick={() => handleApprove(request.id)}
                          disabled={isProcessing === request.id}
                        >
                          承諾
                        </Button>
                        <ShadModal
                          Trigger={
                            <Button color="red" disabled={isProcessing === request.id}>
                              却下
                            </Button>
                          }
                        >
                          <C_Stack className="gap-4 min-w-[300px]">
                            <h3 className="font-bold">却下理由</h3>
                            <textarea
                              className="w-full border rounded p-2 min-h-[80px]"
                              value={rejectedReason}
                              onChange={e => setRejectedReason(e.target.value)}
                              placeholder="却下理由を入力（任意）"
                            />
                            <R_Stack className="justify-end gap-2">
                              <Button
                                color="red"
                                onClick={() => handleReject(request.id)}
                                disabled={isProcessing === request.id}
                              >
                                却下する
                              </Button>
                            </R_Stack>
                          </C_Stack>
                        </ShadModal>
                      </R_Stack>
                    ) : (
                      <span className="text-gray-400">処理済</span>
                    ),
                  style: { minWidth: 150 },
                },
              ],
            }
          }),
        }).WithWrapper({
          className: cn('[&_th]:!p-2', '[&_td]:!p-2', '[&_td]:text-sm', '[&_td]:align-middle'),
        })
      )}
    </C_Stack>
  )
}
