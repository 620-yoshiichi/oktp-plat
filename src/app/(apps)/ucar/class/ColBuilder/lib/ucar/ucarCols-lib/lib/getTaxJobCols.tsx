import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'

import {Fields} from '@cm/class/Fields/Fields'

import {colType} from '@cm/types/col-types'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'
import {
  bankBranchMasterCol,
  yuchoShitenNoCol,
  bankMasterCol,
} from '@app/(apps)/ucar/(pages)/create-process/UcarProcessCreateForm/UserInfoRegister'
import Coloring from '@cm/lib/methods/Coloring'

export const getTaxJobCols = () => {
  const cols1: colType[] = new Fields([
    {id: `taxCustomerName`, label: `お客様`, form: {...defaultRegister}},
    {id: `annualTax`, label: `年間支払額`, type: `number`},

    //form
    {id: `upperCarregisteredAt`, label: `購入車登録日`, type: `date`, form: {}},
    {id: `DD_SIIRE`, label: `下取車仕入日`, type: `date`, form: {disabled: true}},
  ])
    .showSummaryInTd({wrapperWidthPx: 240})
    .buildFormGroup({groupName: `返金お客様情報`}).plain

  const cols2: colType[] = new Fields([
    bankMasterCol,
    bankBranchMasterCol,
    yuchoShitenNoCol,
    {id: `accountType`, label: `口座種類`, form: {...defaultRegister}},
    {id: `accountNumber`, label: `口座番号`, form: {descriptionNoteAfter: `ゆうちょは「通帳番号」を記入`, ...defaultRegister}},
    {id: `accountNameKana`, label: `名義（カナ）`, form: {...defaultRegister}},
  ])
    .showSummaryInTd({wrapperWidthPx: 280})
    .buildFormGroup({groupName: `入庫/登録`}).plain

  const cols3: colType[] = new Fields([
    ...new Fields([
      {id: `earlyYear`, label: `基準日(早方)`, type: `number`},
      {id: `earlyMonth`, label: `基準日(早方)`, type: `number`},

      {id: `petCount`, label: `PET月数`, type: `number`},
      {id: `petPrice`, label: `PET金額`, type: `number`},
      {id: `prefCount`, label: `県月数`, type: `number`},
      {id: `prefPrice`, label: `県金額`, type: `number`},
    ]).showSummaryInTd({}).plain,
  ]).buildFormGroup({groupName: `計算`}).plain

  const cols4: colType[] = new Fields([
    {
      id: 'henkinRequired',
      label: '返金必要有無 ',
      type: `boolean`,
      format: (value, row) => {
        return row.henkinRequired ? '○' : '×'
      },
    },
    {
      id: `exception`,
      label: `例外処理`,
      forSelect: {codeMaster: UCAR_CODE.TAX_EXCEPTION},
      format: (value, row) => {
        const codeItem = UCAR_CODE.TAX_EXCEPTION.byCode(row.exception)
        return (
          <Coloring mode="bg" color={codeItem?.color}>
            {codeItem?.label}
          </Coloring>
        )
      },
    },
    {id: `paymentNoticeRecievedAt`, label: `納付書受領`, type: `date`},
    {id: `isPayed`, label: `納付済み`, type: `boolean`},
    {id: `paybackScheduledAt`, label: `入金予定日`, type: `date`},
    {
      id: `accountingRecievedAt`,
      label: `入金確認日`,
      type: `date`,
    },
  ]).showSummaryInTd({wrapperWidthPx: 200}).plain

  const colArr = {cols1, cols2, cols3, cols4}

  return colArr
}
