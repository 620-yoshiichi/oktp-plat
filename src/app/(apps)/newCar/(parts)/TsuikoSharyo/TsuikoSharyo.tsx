'use client'

import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'

interface TsuikoSharyoProps {
  newCar: {
    id: number
    APPINDEX: string
    KJ_KURUMAME?: string
    NO_CYUMON?: string
    KJ_KAINMEI1?: string
    KJ_MEIGIME1?: string
    DD_HAISKIBO?: Date
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
      CD_TENPO?: string
      CD_HANSTAFF?: string
      KJ_KURUMAME?: string
      NO_CYUMON?: string
      KJ_KAINMEI1?: string
      processed: boolean
      processedAt?: Date
    }>
  }
}

export default function TsuikoSharyo({newCar}: TsuikoSharyoProps) {
  const formatCurrency = (value: number) => {
    if (!value) return '未設定'
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(value)
  }

  const formatDate = (date: Date | string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ja-JP')
  }

  // お客様名を結合
  const customerName = newCar.KJ_KAINMEI1

  return (
    <C_Stack className="space-y-2">
      {/* 車両基本情報 */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">車両基本情報</h2>
        <C_Stack className="gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">車名</label>
            <div className="mt-1 text-lg font-medium">{newCar.KJ_KURUMAME || '未設定'}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">注文番号</label>
            <div className="mt-1 font-mono">{newCar.NO_CYUMON || '未設定'}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">配送希望日</label>
            <div className="mt-1 font-medium text-lg ">{newCar?.DD_HAISKIBO ? formatDate(newCar.DD_HAISKIBO) : '未設定'}</div>
          </div>
        </C_Stack>
      </div>

      {/* お客様基本情報 */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">お客様基本情報</h2>
        <C_Stack className={`gap-6`}>
          <div>
            <label className="block text-sm font-medium text-gray-600">買主名</label>
            <div className="mt-1  font-medium">{customerName || '未設定'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">名義人名</label>
            <div className="mt-1  font-medium">{newCar.KJ_MEIGIME1 || '未設定'}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">担当店舗</label>
              <div className="mt-1">{newCar.Store?.name || '未設定'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">担当者</label>
              <div className="mt-1">{newCar.User?.name || '未設定'}</div>
            </div>
          </div>
        </C_Stack>
      </div>

      {/* 追工データ明細 */}
      {newCar.TenpoTsuikoData && newCar.TenpoTsuikoData.length > 0 && (
        <div className="   p-6">
          <h2 className="text-lg font-semibold mb-4">追工データ明細</h2>

          {CsvTable({
            records: [
              ...newCar.TenpoTsuikoData.map(tsuiko => ({
                csvTableRow: [
                  {
                    label: '追工コード',
                    cellValue: tsuiko.CD_TUIKO,
                  },
                  {
                    label: '追工内容',
                    cellValue: tsuiko.MJ_TUIKOM || '内容なし',
                  },
                  {
                    label: '追工金額',
                    cellValue: formatCurrency(tsuiko.KI_TUIKOKIN || 0),
                  },
                  // {
                  //   label: '処理状況',
                  //   cellValue: tsuiko.processed ? '処理済み' : '未処理',
                  // },
                  // {
                  //   label: '処理日時',
                  //   cellValue: tsuiko.processedAt ? formatDate(tsuiko.processedAt) : '-',
                  // },
                ],
              })),
              // {
              //   csvTableRow: [
              //     {cellValue: ''},
              //     {cellValue: '合計'},
              //     {
              //       cellValue: formatCurrency(
              //         newCar.TenpoTsuikoData?.reduce((sum, tsuiko) => sum + (tsuiko.KI_TUIKOKIN || 0), 0) || 0
              //       ),
              //     },
              //     {cellValue: '', colSpan: 2},
              //   ],
              // },
            ],
          }).WithWrapper({className: '!rounded-none !w-[350px]'})}

          {/* //   追工コード: '合計',
            //   追工内容: '',
            //   追工金額: formatCurrency(newCar.TenpoTsuikoData.reduce((sum, tsuiko) => sum + (tsuiko.KI_TUIKOKIN || 0), 0)),
            //   処理状況: '',
            //   処理日時: '',
            // }} */}
          {/* /> */}
        </div>
      )}

      {/* 追工データがない場合 */}
      {(!newCar.TenpoTsuikoData || newCar.TenpoTsuikoData.length === 0) && (
        <div className="   p-6">
          <h2 className="text-lg font-semibold mb-4">追工データ明細</h2>
          <div className="text-center py-8 text-gray-500">追工データが見つかりませんでした</div>
        </div>
      )}
    </C_Stack>
  )
}
