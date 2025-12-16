import {Fields} from '@cm/class/Fields/Fields'

import {colType} from '@cm/types/col-types'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'
import {
  bankBranchMasterCol,
  yuchoShitenNoCol,
  bankMasterCol,
} from '@app/(apps)/ucar/(pages)/create-process/UcarProcessCreateForm/UserInfoRegister'
import Coloring from '@cm/lib/methods/Coloring'
import InlineTaxCalucrator from '@app/(apps)/ucar/class/ColBuilder/lib/ucar/ucarCols-lib/InlineTaxCalucrator'
import {Button} from '@cm/components/styles/common-components/Button'

export const getTaxJobCols = ({isChukoshaGroup}: {isChukoshaGroup?: boolean}) => {
  const cols1: colType[] = new Fields([
    {id: `taxCustomerName`, label: `お客様`, form: {}},
    {id: `annualTax`, label: `年間支払額`, type: `number`, form: {}},

    //form
    {id: `upperCarregisteredAt`, label: `購入車登録日`, type: `date`, form: {}},
    {id: `DD_SIIRE`, label: `下取車仕入日`, type: `date`, form: {disabled: true}},
    {
      id: `calcTax`,
      label: `税金計算`,
      form: {disabled: true},
      format: (value, row) => {
        return (
          <InlineTaxCalucrator row={row}>
            <Button size="sm">税金計算</Button>
          </InlineTaxCalucrator>
        )
      },
    },
  ])
    .showSummaryInTd({wrapperWidthPx: 180, editable: isChukoshaGroup})
    .buildFormGroup({groupName: `返金お客様情報`}).plain

  const cols2: colType[] = new Fields([
    bankMasterCol,
    bankBranchMasterCol,
    yuchoShitenNoCol,
    {id: `accountType`, label: `口座種類`, form: {}},
    {id: `accountNumber`, label: `口座番号`, form: {descriptionNoteAfter: `ゆうちょは「通帳番号」を記入`}},
    {id: `accountNameKana`, label: `名義（カナ）`, form: {}},
  ])
    .showSummaryInTd({wrapperWidthPx: 200, editable: isChukoshaGroup})
    .buildFormGroup({groupName: `口座情報`}).plain

  const cols3: colType[] = new Fields([
    ...new Fields([
      {id: `earlyYear`, label: `基準年(早方)`, type: `number`, form: {}},
      {id: `earlyMonth`, label: `基準月(早方)`, type: `number`, form: {}},
      {id: `petCount`, label: `PET月数`, type: `number`, form: {}},
      {id: `petPrice`, label: `PET金額`, type: `number`, form: {}},
      {id: `prefCount`, label: `県月数`, type: `number`, form: {}},
      {id: `prefPrice`, label: `県金額`, type: `number`, form: {}},
    ]).showSummaryInTd({wrapperWidthPx: 200, editable: isChukoshaGroup}).plain,
  ]).buildFormGroup({groupName: `税金額`}).plain

  const cols4: colType[] = new Fields([
    {
      id: 'henkinRequired',
      label: '返金必要有無 ',
      type: `boolean`,
      form: {},
      // format: (value, row) => {
      //   return row.henkinRequired ? '○' : '×'
      // },
    },
    {
      id: `exception`,
      label: `例外処理`,
      form: {},
      forSelect: {
        optionsOrOptionFetcher: UCAR_CODE.TAX_EXCEPTION.array,
      },
      format: (value, row) => {
        const codeItem = UCAR_CODE.TAX_EXCEPTION.byCode(row.exception)
        return (
          <Coloring mode="bg" color={codeItem?.color}>
            {codeItem?.label}
          </Coloring>
        )
      },
    },
    {id: `paymentNoticeRecievedAt`, label: `納付書受領`, form: {}, type: `date`},
    {id: `isPayed`, label: `納付済み`, form: {}, type: `boolean`},
    {id: `paybackScheduledAt`, label: `入金予定日`, form: {}, type: `date`},
    {
      id: `accountingRecievedAt`,
      label: `入金確認日`,
      form: {},
      type: `date`,
    },
  ])
    .showSummaryInTd({wrapperWidthPx: 200, editable: isChukoshaGroup})
    .buildFormGroup({groupName: `自動車税その他`}).plain

  const colArr = {cols1, cols2, cols3, cols4}

  return colArr
}
