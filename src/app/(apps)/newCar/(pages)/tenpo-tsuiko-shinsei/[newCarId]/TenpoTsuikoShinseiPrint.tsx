'use client'

import React, {useEffect, useState} from 'react'
import {getNewCarData} from '@app/(apps)/newCar/server-actions/tenpoTsuikoActions'

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

export default function TenpoTsuikoShinseiPrint({newCarId, headerId}: {newCarId: number; headerId?: string}) {
  const [newCar, setNewCar] = useState<NewCarData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (newCarId) {
      fetchNewCarData()
    }
  }, [newCarId])

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

  const formatCurrency = (value: number) => {
    if (!value) return '¥0'
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(value)
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ja-JP', {year: 'numeric', month: '2-digit', day: '2-digit'})
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">読み込み中...</div>
  }

  if (!newCar) {
    return <div className="flex items-center justify-center h-64">車両データが見つかりません</div>
  }

  const totalAmount = newCar.TenpoTsuikoData?.reduce((sum, tsuiko) => sum + (tsuiko.KI_TUIKOKIN || 0), 0) || 0

  return (
    <div className="a4-print-container">
      <div className="print-header">
        <h1>店舗追工申請詳細</h1>
        <div className="application-date">
          <span>申請日: {formatDate(new Date())}</span>
        </div>
      </div>

      <div className="print-section">
        <h2>車両基本情報</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>車名</label>
            <div>{newCar.KJ_KURUMAME || '-'}</div>
          </div>
          <div className="info-item">
            <label>注文番号</label>
            <div>{newCar.NO_CYUMON || '-'}</div>
          </div>
          <div className="info-item">
            <label>車両フレームナンバー</label>
            <div>{newCar.NO_FRAME || '-'}</div>
          </div>
          <div className="info-item">
            <label>追工件数</label>
            <div>{newCar.TenpoTsuikoData?.length || 0}件</div>
          </div>
        </div>
      </div>

      <div className="print-section">
        <h2>お客様基本情報</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>買主名</label>
            <div>{newCar.KJ_KAINMEI1 || '-'}</div>
          </div>
          <div className="info-item">
            <label>名義人名</label>
            <div>{newCar.KJ_MEIGIME1 || '-'}</div>
          </div>
          <div className="info-item">
            <label>担当店舗</label>
            <div>{newCar.Store?.name || '-'}</div>
          </div>
          <div className="info-item">
            <label>担当者</label>
            <div>{newCar.User?.name || '-'}</div>
          </div>
        </div>
      </div>

      <div className="print-section">
        <h2>追工データ明細</h2>
        {newCar.TenpoTsuikoData && newCar.TenpoTsuikoData.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>追工コード</th>
                <th>追工内容</th>
                <th>追工金額</th>
                <th>処理状況</th>
                <th>処理日時</th>
              </tr>
            </thead>
            <tbody>
              {newCar.TenpoTsuikoData.map(tsuiko => (
                <tr key={tsuiko.id}>
                  <td>{tsuiko.CD_TUIKO}</td>
                  <td>{tsuiko.MJ_TUIKOM || '-'}</td>
                  <td className="text-right">{formatCurrency(tsuiko.KI_TUIKOKIN || 0)}</td>
                  <td>{tsuiko.processed ? '処理済み' : '未処理'}</td>
                  <td>{tsuiko.processedAt ? formatDate(tsuiko.processedAt) : '-'}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td colSpan={2} className="text-right">
                  合計
                </td>
                <td className="text-right">{formatCurrency(totalAmount)}</td>
                <td colSpan={2}></td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="no-data">追工データが見つかりませんでした</div>
        )}
      </div>

      <div className="approval-section">
        <div className="approval-column">
          <div className="approval-box">
            <div className="approval-title">店長</div>
            <div className="approval-stamp"></div>
            <div className="approval-date">日付: </div>
            <div className="approval-comment">コメント:</div>
          </div>
          <div className="approval-box">
            <div className="approval-title">スタッフ</div>
            <div className="approval-stamp"></div>
            <div className="approval-date">日付: </div>
            <div className="approval-comment">コメント:</div>
          </div>
          <div className="approval-box">
            <div className="approval-title">サービス副店長</div>
            <div className="approval-stamp"></div>
            <div className="approval-date">日付: </div>
            <div className="approval-comment">コメント:</div>
          </div>
        </div>
      </div>
    </div>
  )
}
