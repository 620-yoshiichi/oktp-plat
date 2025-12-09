import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'

import {Fields} from '@cm/class/Fields/Fields'

import {colType} from '@cm/types/col-types'

export const getTaxJobCols = () => {
  const cols1: colType[] = new Fields([
    ...new Fields([
      {id: 'registerdAt', label: '登録日', type: `date`, form: {}},
      {id: 'earlyRecievedAt', label: '入庫/登録', type: `date`, form: {}},
      {id: 'earlierDate', label: '計算基準日', type: `date`, form: {}},
    ]).customAttributes(({col}) => ({...col, td: {}})).plain,

    ...new Fields([
      {id: `paymentNoticeRecievedAt`, label: `納付書受領`, type: `date`},
      {
        id: `isPayed`,
        label: `納付済み`,
        type: `boolean`,
      },
      {
        id: `exception`,
        label: `例外処理`,
        forSelect: {
          optionsOrOptionFetcher: [
            {value: '返金なし（薄）', color: '#F4CCCC'},
            {value: '返金なし（トヨペット）', color: '#DAE3F3'},
            {value: '県税からの返金のみ', color: '#D9EAD3'},
            {value: '買戻し（同一人再使用）', color: '#EAD1DC'},
            {value: '課税なし', color: '#FFF2CC'},
          ],
        },
      },
      {id: `annualTax`, label: `年間支払額`, type: `number`},
    ]).customAttributes(({col}) => ({...col, form: {}, td: {}})).plain,
  ]).buildFormGroup({groupName: `入庫/登録`}).plain

  const cols2: colType[] = new Fields([
    ...new Fields([bankMasterCol, bankBranchMasterCol]).customAttributes(({col}) => ({...col, form: {}, td: {}})).plain,
    ...new Fields([
      {id: `accountType`, label: `口座種類`},
      {id: `accountNumber`, label: `口座番号`},
      {id: `accountNameKana`, label: `名義（カナ）`},
    ]).customAttributes(({col}) => ({...col, form: {}, td: {}})).plain,
  ]).buildFormGroup({groupName: `口座情報`}).plain

  const cols3: colType[] = new Fields([
    ...new Fields([
      {id: `petCount`, label: `PET月数`, type: `number`},
      {id: `petPrice`, label: `PET金額`, type: `number`},
    ]).customAttributes(({col}) => ({...col, form: {}, td: {}})).plain,
    ...new Fields([
      {id: `prefCount`, label: `県月数`, type: `number`},
      {id: `prefPrice`, label: `県金額`, type: `number`},
    ]).customAttributes(({col}) => ({...col, form: {}, td: {}})).plain,
  ]).buildFormGroup({groupName: `計算結果`}).plain

  const colArr = {cols1, cols2, cols3}

  return colArr
}

export const bankMasterCol: colType = {
  id: `bankMasterId`,
  label: `銀行名`,
  forSelect: {
    config: {
      modelName: `bankMaster`,
    },
    allowCreateOptions: {
      creator() {
        return {
          getCreatFormProps: props2 => {
            return {
              columns: new Fields([
                {id: `code`, label: `銀行コード`, form: {...defaultRegister}},
                {id: `name`, label: `銀行名`, form: {...defaultRegister}},
              ]).transposeColumns(),
              formData: {name: props2.searchFormData.name},
            }
          },
        }
      },
    },
  },
  form: {...defaultRegister},
}

export const yuchoShitenNoCol: colType = {
  id: `yuchoShitenNo`,
  label: `ゆうちょ支店番号`,
  form: {
    descriptionNoteAfter: `3桁の漢数字を入力してください。`,
  },
  type: 'text',
}
export const bankBranchMasterCol: colType = {
  id: `bankBranchMasterId`,
  label: `支店名`,
  form: {
    descriptionNoteAfter: `ゆうちょの場合は入力しないでください。`,
  },
  forSelect: {
    config: {
      modelName: `bankBranchMaster`,
      messageWhenNoHit: `先に銀行を選択してください`,
      select: {name: `text`, branchKana: `text`},
      where: ({latestFormData}) => {
        const result = {
          bankMasterId: latestFormData.bankMasterId ?? 0,
        }

        return result
      },
      nameChanger: op => {
        const name = op?.name ? `${op?.name} (${op.branchKana ?? `カナなし`})` : ''
        return {...op, name}
      },
    },

    dependenceColIds: [`bankMasterId`],
    allowCreateOptions: {
      creator: () => {
        return {
          getCreatFormProps: props2 => {
            return {
              columns: new Fields([
                {
                  id: `bankMasterId`,
                  label: `銀行`,
                  forSelect: {},
                  form: {defaultValue: props2.latestFormData.bankMasterId},
                },
                {id: `code`, label: `支店コード`},
                {
                  id: `name`,
                  label: `支店名`,
                  form: {defaultValue: props2.searchFormData.name},
                },
                {id: `branchKana`, label: `支店カナ`, form: {}},
              ])
                .customAttributes(({col}) => ({...col, form: {}, td: {}}))
                .transposeColumns(),
              formData: {
                name: props2.searchFormData.name,
              },
            }
          },
        }
      },
    },
  },
}
