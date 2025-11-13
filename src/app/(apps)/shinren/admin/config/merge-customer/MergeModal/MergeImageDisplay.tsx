'use client'

import {ConfirmTable} from '@app/(apps)/shinren/admin/config/merge-customer/MergeModal/ConfirmTable.tsx'
import {C_Stack} from '@cm/components/styles/common-components/common-components'

import {arrToLines} from '@cm/components/utils/texts/MarkdownDisplay'
import {breakLines} from '@cm/lib/value-handler'
import {Alert} from '@cm/components/styles/common-components/Alert'

export const MergeImageDisplay = ({CstmTo, CstmrFrom, mergedData, setmergedData}) => {
  if (!CstmTo || !CstmrFrom) return <Alert>データが見つかりません</Alert>
  /**統合元 */

  return (
    <C_Stack>
      <div className={`text-error-main`}>
        {breakLines(
          arrToLines([
            `左側の顧客データは統合後に、削除されます。統合先があっているか、入念に確認してください。`,
            `NEOデータに優先して、アプリデータを残したい場合は、アプリデータを選択してください。`,
          ])
        )}
      </div>
      <ConfirmTable {...{allCustomerCols, mergedData, notices, CstmrFrom, setmergedData, CstmTo}} />
    </C_Stack>
  )
}

export const notices = [
  {source: `NEO`, description: `NEOを優先反映`, color: `red`},
  {source: `アプリ`, description: `アプリデータ引き継ぎ`, color: 'blue'},
]

export const allCustomerCols = [
  //NEOデータ
  ...[
    {id: 'code', label: 'コード'},
    {id: 'name', label: '略名'},
    {id: 'kana', label: 'カナ'},
    {id: 'nameTop', label: '上段'},
    {id: 'nameBottom', label: '下段'},
    {id: 'address1', label: '住所1'},
    {id: 'address2', label: '住所2'},
    {id: 'postalCode', label: '郵便番号'},
    {id: 'phone', label: '電話番号'},
    {id: 'fax', label: 'FAX'},
    {id: 'repPos', label: '代表者役職名'},
    {id: 'repName', label: '代表者氏名'},
    {id: 'repKana', label: '代表者カナ'},
  ].map(c => ({...c, source: 'NEO'})),

  //アプリデータ
  ...[
    {id: 'type', label: '新管区分'},
    {id: 'result', label: '結果'},
    {id: 'pic', label: '責任者'},
    {id: 'carCount', label: '保有台数'},
    {id: 'leaseCompanyName', label: 'リース会社'},
    {id: 'maintenanceDestination', label: '車両仕入れ先・整備入庫先'},
    {id: 'remarks', label: '備考'},
  ].map(c => ({...c, source: 'アプリ'})),

  // {id: 'RentaDailyReport', label: ''},
  // {id: 'rentaStoreId', label: ''},
  // {id: 'User', label: ''},
  // {id: 'userId', label: ''},
  // {id: 'ExtraInfo', label: ''},
  // {id: 'AlternateInfo', label: ''},
  // {id: 'InsuranceInfo', label: ''},
]
