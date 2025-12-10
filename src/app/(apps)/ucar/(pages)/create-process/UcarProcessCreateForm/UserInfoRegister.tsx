import {Fields} from '@cm/class/Fields/Fields'
import {addColIndexs} from '@cm/class/Fields/lib/addColIndex'
import {colType} from '@cm/types/col-types'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

import {useEffect} from 'react'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'

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

export default function useUserInfoRegister({UcarData}) {
  const columns = taxCustomerInfoCols.transposeColumns()

  const {BasicForm, latestFormData, ReactHookForm} = useBasicFormProps({
    columns,
    formData: {
      taxCustomerName: UcarData.taxCustomerName,
      registerdAt: UcarData.registerdAt,
      bankMasterId: UcarData.bankMasterId,
      bankBranchMasterId: UcarData.bankBranchMasterId,
      yuchoShitenNo: UcarData.yuchoShitenNo,
      accountType: UcarData.accountType,
      accountNumber: UcarData.accountNumber,
      accountNameKana: UcarData.accountNameKana,
    },
  })

  useEffect(() => {
    ReactHookForm.setValue(`bankBranchMasterId`, null)
    ReactHookForm.setValue(`yuchoShitenNo`, null)
  }, [latestFormData.bankMasterId])

  return {
    UserRegisterBasicForm: BasicForm,
    userData: latestFormData,
  }
}

export const taxCustomerInfoCols = new Fields([
  ...new Fields([
    //
    {id: `taxCustomerName`, label: `お客様`, form: {...defaultRegister}},
    {id: `registerdAt`, label: `登録日`, type: `date`, form: {}},
  ]).buildFormGroup({groupName: `基本情報`}).plain,

  ...new Fields([
    //
    bankMasterCol,
    bankBranchMasterCol,
    yuchoShitenNoCol,
  ]).buildFormGroup({groupName: `口座情報①`}).plain,

  ...new Fields([
    {id: `accountType`, label: `口座種類`, form: {...defaultRegister}},
    {id: `accountNumber`, label: `口座番号`, form: {descriptionNoteAfter: `ゆうちょは「通帳番号」を記入`, ...defaultRegister}},
    {id: `accountNameKana`, label: `名義（カナ）`, form: {...defaultRegister}},
  ]).buildFormGroup({groupName: `口座情報②`}).plain,
])
