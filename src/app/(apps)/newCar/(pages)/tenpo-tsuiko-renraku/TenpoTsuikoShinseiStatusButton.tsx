'use client'

import {useMemo} from 'react'

import {Button} from '@cm/components/styles/common-components/Button'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
export const getStatusDisplay: (props: {rowData: any}) => '承認完了' | '却下' | '申請中' | '未申請' = (props: {
  rowData: any
}): '承認完了' | '却下' | '申請中' | '未申請' => {
  const {rowData} = props
  if (!rowData?.id) {
    return '未申請'
  }

  // 申請履歴がない場合
  if (!rowData.TenpoTsuikoShinseiHeader || rowData.TenpoTsuikoShinseiHeader.length === 0) {
    return '未申請'
  }

  // アクティブな申請を取得
  const activeHeaders = rowData.TenpoTsuikoShinseiHeader.filter((h: any) => h.active !== false)

  if (activeHeaders.length === 0) {
    return '未申請'
  }

  // 最新のアクティブな申請を取得
  const latestActiveHeader = activeHeaders[0] // 最新の申請（createdAt descでソート済み）
  const details = latestActiveHeader.TenpoTsuikoShinseiDetail

  // 承認状態を判定
  if (details.some((d: any) => d.status === 'rejected')) {
    return '却下'
  }

  if (details.every((d: any) => d.status === 'approved')) {
    return '承認完了'
  }

  if (details.some((d: any) => d.status === 'pending')) {
    return '申請中'
  }

  return '申請中'
}

export const getStatusColor = (status: '承認完了' | '却下' | '申請中' | '未申請' | '対象外') => {
  switch (status) {
    case '承認完了':
      return 'green'
    case '却下':
      return 'red'
    case '申請中':
      return 'orange'
    case '未申請':
      return 'gray'

    default:
      return 'gray'
  }
}

export const TenpoTsuikoShinseiStatusButton = ({
  handleOpenModal,
  rowData,
}: {
  handleOpenModal: (params: {newCar: any}) => void
  rowData: any
}) => {
  const StatusDisplay = useMemo(() => {
    return (
      <div className="text-sm">
        <IconBtn
          color={getStatusColor(getStatusDisplay({rowData}))}
          className={` p-0.5 text-center w-[75px] mx-auto border-[3px]  animate-pulse      rounded-full text-xs font-medium `}
        >
          {getStatusDisplay({rowData})}
        </IconBtn>
      </div>
    )
  }, [rowData])

  // 申請履歴がない場合
  if (!rowData.TenpoTsuikoShinseiHeader || rowData.TenpoTsuikoShinseiHeader.length === 0) {
    return (
      <div className={` cursor-pointer`} onClick={() => handleOpenModal({newCar: rowData})}>
        {StatusDisplay}
      </div>
    )
    return (
      <Button color="red" size="sm" onClick={() => handleOpenModal({newCar: rowData})}>
        店舗連絡
      </Button>
    )
  }

  // アクティブな申請を取得
  const activeHeaders = rowData.TenpoTsuikoShinseiHeader.filter((h: any) => h.active !== false)

  if (activeHeaders.length === 0) {
    return (
      <div className={` cursor-pointer`} onClick={() => handleOpenModal({newCar: rowData})}>
        {StatusDisplay}
      </div>
    )
    return (
      <Button color="red" size="sm" onClick={() => handleOpenModal({newCar: rowData})}>
        店舗連絡
      </Button>
    )
  }

  // 最新のアクティブな申請を取得
  const latestActiveHeader = activeHeaders[0]
  const details = latestActiveHeader.TenpoTsuikoShinseiDetail

  // 却下済みの場合は再申請可能
  if (details.some((d: any) => d.status === 'rejected')) {
    return (
      <div className={` cursor-pointer`} onClick={() => handleOpenModal({newCar: rowData})}>
        {StatusDisplay}
      </div>
    )
    return (
      <Button color="orange" size="sm" onClick={() => handleOpenModal({newCar: rowData})}>
        再申請
      </Button>
    )
  }

  // 承認完了の場合は詳細確認のみ
  if (details.every((d: any) => d.status === 'approved')) {
    return (
      <div className={` cursor-pointer`} onClick={() => handleOpenModal({newCar: rowData})}>
        {StatusDisplay}
      </div>
    )
  }

  // 承認中またはその他の場合は詳細確認
  return (
    <div className={` cursor-pointer`} onClick={() => handleOpenModal({newCar: rowData})}>
      {StatusDisplay}
    </div>
  )
}
