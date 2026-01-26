'use client'

import React from 'react'
import ShadModal from '@shadcn/ui/Organisms/ShadModal'
import { Button } from '@cm/components/styles/common-components/Button'
import type { UcarSearchResult } from '../types'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { UcarProcessCl } from '@app/(apps)/ucar/class/UcarProcessCl'

type UcarDetailModalProps = {
  isOpen: boolean
  onClose: () => void
  ucar: UcarSearchResult | null
  isLoading: boolean
}

// 情報表示行コンポーネント
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex border-b border-gray-100 py-2">
      <dt className="w-32 flex-shrink-0 text-sm font-medium text-gray-500">{label}</dt>
      <dd className="flex-1 text-sm text-gray-900">{value || '-'}</dd>
    </div>
  )
}

// セクションヘッダーコンポーネント
function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-sm font-semibold text-emerald-700 border-b-2 border-emerald-200 pb-1 mb-3 mt-4 first:mt-0">
      {title}
    </h3>
  )
}

// ナンバープレート表示
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

  return ucar.tmpPlate || ucar.plate || '-'
}

export default function UcarDetailModal({
  isOpen,
  onClose,
  ucar,
  isLoading,
}: UcarDetailModalProps) {
  const modalContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          <span className="ml-3 text-gray-600">読み込み中...</span>
        </div>
      )
    }

    if (!ucar) {
      return (
        <div className="text-center py-12 text-gray-500">
          車両情報が見つかりません
        </div>
      )
    }

    const upass = ucar.UPASS

    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        {/* 基本情報 */}
        <SectionHeader title="基本情報" />
        <dl className="space-y-0">
          <InfoRow label="査定No" value={ucar.sateiID} />
          <InfoRow label="98番号" value={ucar.number98} />
          <InfoRow label="受入日" value={ucar.arrivedAt ? formatDate(new Date(ucar.arrivedAt)) : null} />
          <InfoRow label="状況" value={ucar.processedAs} />
          <InfoRow label="配送先" value={ucar.DestinationStore?.name} />
          <InfoRow label="担当者" value={ucar.User?.name} />
          <InfoRow label="店舗" value={ucar.Store?.name} />
        </dl>

        {/* 車両情報 */}
        <SectionHeader title="車両情報" />
        <dl className="space-y-0">
          <InfoRow label="メーカー" value={upass?.brandName || ucar.tmpBrandName} />
          <InfoRow label="車名" value={upass?.modelName || ucar.tmpModelName} />
          <InfoRow label="グレード" value={upass?.grade || ucar.tmpGrade} />
          <InfoRow label="型式" value={upass?.commonType || ucar.tmpCommonType} />
          <InfoRow label="通称型式" value={upass?.type || ucar.tmpType} />
          <InfoRow label="年式" value={upass?.modelYear || ucar.tmpModelYear} />
          <InfoRow label="車体番号" value={upass?.chassisNumber || ucar.tmpChassisNumber} />
          <InfoRow label="フレーム番号" value={upass?.frameNumber || ucar.tmpFrameNumber} />
          <InfoRow label="ナンバー" value={formatPlate(ucar)} />
        </dl>

        {/* 仕様情報 */}
        <SectionHeader title="仕様情報" />
        <dl className="space-y-0">
          <InfoRow label="外装色" value={upass?.exteriorColor} />
          <InfoRow label="走行距離" value={upass?.mileageKm ? `${upass.mileageKm} km` : null} />
          <InfoRow label="排気量" value={upass?.displacement ? `${upass.displacement} cc` : null} />
          <InfoRow
            label="車寸"
            value={
              upass?.length && upass?.width && upass?.height
                ? `${upass.length} × ${upass.width} × ${upass.height} mm`
                : null
            }
          />
          <InfoRow label="ミッション" value={upass?.transmissionType} />
          <InfoRow label="駆動方式" value={upass?.driveType} />
        </dl>



        {/* 工程履歴 */}
        {ucar.UcarProcess && ucar.UcarProcess.length > 0 && (
          <>
            <SectionHeader title="工程履歴" />
            <div className="space-y-2">
              {ucar.UcarProcess.map((process, index) => {
                return <div
                  key={process.id}
                  className={`
                  flex items-center justify-between px-3 py-2 rounded-md
                  ${index === 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'}
                `}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`
                      px-2 py-1 text-xs font-medium rounded
                      ${index === 0 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'}
                    `}
                    >
                      {UcarProcessCl.CODE.byCode(process.processCode ?? '')?.label || '-'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {process.User?.name || '-'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {process.date ? formatDate(new Date(process.date)) : '-'}
                  </span>
                </div>
              })}
            </div>
          </>
        )}



        {/* 備考 */}
        {ucar.remarks && (
          <>
            <SectionHeader title="備考" />
            <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
              {ucar.remarks}
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <ShadModal
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose()
      }}
      title={
        <span className="text-emerald-700">
          車両詳細 {ucar?.sateiID ? `- ${ucar.sateiID}` : ''}
        </span>
      }
      description={
        ucar
          ? `${ucar.UPASS?.brandName || ucar.tmpBrandName || ''} ${ucar.UPASS?.modelName || ucar.tmpModelName || ''}`
          : ''
      }
      footer={
        <Button
          onClick={onClose}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition-colors"
        >
          閉じる
        </Button>
      }
      style={{ minWidth: 500, maxWidth: 700 }}
    >
      {modalContent()}
    </ShadModal>
  )
}
