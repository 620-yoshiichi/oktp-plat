import {Fields} from '@cm/class/Fields/Fields'
import {addColIndexs} from '@cm/class/Fields/lib/addColIndex'
import {colType} from '@cm/types/col-types'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {
  bankBranchMasterCol,
  bankMasterCol,
  yuchoShitenNoCol,
} from '@app/(apps)/ucar/class/ColBuilder/lib/ucar/ucarCols-lib/lib/getTaxJobCols'
import {useEffect} from 'react'

export default function useUserInfoRegister({UcarData}) {
  const register = {required: `必須`}
  let data: colType[] = []
  const col1: colType[] = [
    {
      ...{id: `taxCustomerName`, label: `お客様`},
      form: {register},
    },
    {
      ...{id: `registerdAt`, label: `登録日`, type: `date`},
      form: {},
    },
  ]

  const col2 = [bankMasterCol, bankBranchMasterCol, yuchoShitenNoCol]

  const col3 = [
    {
      ...{id: `accountType`, label: `口座種類`},
      form: {register},
    },
    {
      ...{id: `accountNumber`, label: `口座番号`},
      form: {descriptionNoteAfter: `ゆうちょは「通帳番号」を記入`, register},
    },
    {
      ...{id: `accountName`, label: `名義（カナ）`},
      form: {register},
    },
  ]

  data = addColIndexs([col1, col2, col3])

  const columns = new Fields([
    ...new Fields([
      //
      {id: `taxCustomerName`, label: `お客様`, form: {register}},
      {id: `registerdAt`, label: `登録日`, type: `date`, form: {}},
    ]).buildFormGroup({groupName: `基本情報`}).plain,

    ...new Fields([
      //
      bankMasterCol,
      bankBranchMasterCol,
      yuchoShitenNoCol,
    ]).buildFormGroup({groupName: `口座情報①`}).plain,

    ...new Fields([
      {id: `accountType`, label: `口座種類`, form: {register}},
      {id: `accountNumber`, label: `口座番号`, form: {descriptionNoteAfter: `ゆうちょは「通帳番号」を記入`, register}},
      {id: `accountName`, label: `名義（カナ）`, form: {register}},
    ]).buildFormGroup({groupName: `口座情報②`}).plain,
  ]).transposeColumns()

  const defaultValues = Object.fromEntries(data.map(({id}) => [id, UcarData[id]]))

  const {BasicForm, latestFormData, ReactHookForm} = useBasicFormProps({
    columns,
    formData: defaultValues,
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
