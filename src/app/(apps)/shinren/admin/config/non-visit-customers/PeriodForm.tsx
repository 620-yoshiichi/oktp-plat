'use client'
import {Fields} from '@cm/class/Fields/Fields'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {Button} from '@cm/components/styles/common-components/Button'

const PeriodForm = () => {
  const {addQuery} = useGlobal()
  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: Fields.transposeColumns([
      {
        id: `period`,
        label: `過去何日未訪問`,
        type: `number`,
        form: {defaultValue: 90, register: {required: `必須`}},
      },
    ]),
  })
  const onSubmit = () => addQuery({...latestFormData})
  return (
    <>
      <R_Stack>
        <BasicForm latestFormData={latestFormData} alignMode="row"></BasicForm>
        <Button onClick={onSubmit}>設定</Button>
      </R_Stack>
    </>
  )
}

export default PeriodForm
