import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'

import {Fields} from '@cm/class/Fields/Fields'

import {colType} from '@cm/types/col-types'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'
import {taxCustomerInfoCols} from '@app/(apps)/ucar/(pages)/create-process/UcarProcessCreateForm/UserInfoRegister'
import {C_Stack, Circle, R_Stack} from '@cm/components/styles/common-components/common-components'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

export const getTaxJobCols = () => {
  const cols1: colType[] = new Fields([
    {
      id: 'henkinRequired',
      label: '返金必要有無 ',
      type: `boolean`,
      format: (value, row) => {
        return row.henkinRequired ? '○' : '×'
      },
    },

    {id: `taxCustomerName`, label: `お客様`, form: {...defaultRegister}},
    {id: `annualTax`, label: `年間支払額`, type: `number`},

    //form
    {id: `upperCarregisteredAt`, label: `購入車登録日`, type: `date`, form: {}},
    {id: `DD_SIIRE`, label: `下取車仕入日`, type: `date`, form: {disabled: true}},
    {id: `earlyRecievedAt`, label: `基準日(早方)`, type: `date`, form: {}},
  ])
    .showSummaryInTd({wrapperWidthPx: 240})
    .buildFormGroup({groupName: `返金お客様情報`}).plain

  const cols2: colType[] = new Fields([]).showSummaryInTd({}).buildFormGroup({groupName: `入庫/登録`}).plain

  const cols3: colType[] = new Fields([
    ...new Fields([
      {id: `petCount`, label: `PET月数`, type: `number`},
      {id: `petPrice`, label: `PET金額`, type: `number`},
      {id: `prefCount`, label: `県月数`, type: `number`},
      {id: `prefPrice`, label: `県金額`, type: `number`},
    ]).showSummaryInTd({}).plain,
  ]).buildFormGroup({groupName: `計算結果`}).plain

  const cols4: colType[] = new Fields([
    {id: `exception`, label: `例外処理`, forSelect: {codeMaster: UCAR_CODE.TAX_EXCEPTION}},
    {id: `paymentNoticeRecievedAt`, label: `納付書受領`, type: `date`},
    {id: `isPayed`, label: `納付済み`, type: `boolean`},
  ]).showSummaryInTd({}).plain

  const colArr = {cols1, cols2, cols3, cols4}

  return colArr
}
