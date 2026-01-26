'use client'

type Props = {
  taxRefundNotSelected: boolean
  needsCustomerInfo: boolean
  needsDestination: boolean
}

/**
 * 前提条件が満たされていない場合の警告メッセージ
 */
export const PrerequisitesWarning = ({ taxRefundNotSelected, needsCustomerInfo, needsDestination }: Props) => {
  if (!taxRefundNotSelected && !needsCustomerInfo && !needsDestination) return null

  const conditions: string[] = []
  if (taxRefundNotSelected) conditions.push('返金有無の選択')
  if (needsCustomerInfo) conditions.push('お客様情報の入力')
  if (needsDestination) conditions.push('仕分け先の入力')

  const message = `${conditions.join('と')}後に工程登録が可能になります。`

  return (
    <div>
      <div className="text-red-500 opacity-100 bg-red-100 border-red-500 border p-2 rounded">{message}</div>
    </div>
  )
}
