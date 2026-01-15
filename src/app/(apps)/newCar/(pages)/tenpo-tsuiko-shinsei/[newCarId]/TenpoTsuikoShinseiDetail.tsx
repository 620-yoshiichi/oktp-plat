'use client'

import {useEffect, useState, useRef} from 'react'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import TenpoTsuikoShinseiHistory, {
  ApprovalHeader,
} from '@app/(apps)/newCar/(parts)/TenpoTsuikoShinseiHistory/TenpoTsuikoShinseiHistory'
import TsuikoSharyo from '@app/(apps)/newCar/(parts)/TsuikoSharyo/TsuikoSharyo'
import {getNewCarData, getTenpoTsuikoHistory} from '@app/(apps)/newCar/server-actions/tenpoTsuikoActions'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {useReactToPrint} from 'react-to-print'
import '@cm/styles/tenpo-tsuiko-print.css'
import {toastByResult} from '@cm/lib/ui/notifications'
import {cn} from '@cm/shadcn/lib/utils'

interface NewCarData {
  id: number
  KJ_KURUMAME?: string
  NO_CYUMON?: string
  NO_FRAME?: string
  APPINDEX: string
  KJ_KAINMEI1?: string
  KJ_MEIGIME1?: string
  Store?: {
    id: number
    name: string
    code: string
  }
  User?: {
    id: number
    name: string
    email: string
  }
  TenpoTsuikoData?: Array<{
    id: number
    CD_TUIKO: string
    MJ_TUIKOM?: string
    KI_TUIKOKIN?: number
    processed: boolean
    processedAt?: Date
  }>
}

export default function TenpoTsuikoShinseiDetail({newCarId, headerId}: {newCarId: number; headerId?: string}) {
  // const params = useParams()
  const {router} = useGlobal()
  const [newCar, setNewCar] = useState<NewCarData | null>(null)
  const [loading, setLoading] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)

  // const newCarId = params?.newCarId ? parseInt(params.newCarId as string) : null

  const [histories, setHistories] = useState<ApprovalHeader[]>([])
  const fetchHistories = async () => {
    try {
      setLoading(true)
      const result = await getTenpoTsuikoHistory(newCarId)

      if (result.success) {
        setHistories(result.data)
      } else {
        toastByResult({success: false, message: result.message || 'エラーが発生しました'})
      }
    } catch (error) {
      console.error('履歴取得エラー:', error)
      toastByResult({success: false, message: '履歴取得に失敗しました'})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (newCarId) {
      fetchNewCarData()
      fetchHistories()
    }
  }, [newCarId])

  const lastShinseiHeader = histories.find(h => h.active)
  const allApproved = lastShinseiHeader?.TenpoTsuikoShinseiDetail.every(d => d.status === 'approved')
  const approvedByStuff =
    lastShinseiHeader?.TenpoTsuikoShinseiDetail.some(d => d.status === 'approved' && d.User.id === newCar?.User?.id) ||
    allApproved

  const fetchNewCarData = async () => {
    try {
      setLoading(true)

      const result = await getNewCarData(newCarId!)

      if (result.success) {
        setNewCar(result.data)
      } else {
        console.error('車両データ取得エラー:', result.message)
      }
    } catch (error) {
      console.error('車両データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  // 印刷処理の設定
  const handlePrint = useReactToPrint({
    documentTitle: `店舗追工申請_${newCar?.NO_CYUMON || newCar?.id || ''}`,
    contentRef: contentRef,
  })
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">読み込み中...</div>
        </div>
      </div>
    )
  }

  if (!newCar) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-600 mb-4">車両データが見つかりません</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-2 ">
      {/* 印刷ボタン */}

      <div className={`mx-auto w-[790px] bg-white`}>
        <div className="flex justify-end mb-4">
          <button
            disabled={!approvedByStuff}
            onClick={handlePrint}
            className={cn(
              `text-white font-bold py-2 px-4 rounded flex items-center `,
              approvedByStuff ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            印刷する
          </button>
        </div>
        {/* 通常表示用コンテンツ */}
        <R_Stack ref={contentRef} className={` items-stretch  justify-center  gap-0 ${approvedByStuff ? 'print-target' : ''}`}>
          {/* 車両情報 */}
          <div className={`w-[385px] `}>
            <TsuikoSharyo newCar={newCar} />
          </div>

          {/* 承認履歴 */}
          <div className={`w-[385px] `}>
            <div className="  p-6">
              {newCarId && (
                <TenpoTsuikoShinseiHistory
                  {...{
                    fetchHistories,
                    selectedHeaderId: headerId,
                    histories,
                  }}
                />
              )}
            </div>
          </div>
        </R_Stack>
      </div>

      {/* 印刷用コンポーネント（非表示）
      <div style={{display: 'none'}}>
        <div ref={contentRef}>{newCarId && <TenpoTsuikoShinseiPrint newCarId={newCarId} headerId={headerId} />}</div>
      </div> */}
    </div>
  )
}
