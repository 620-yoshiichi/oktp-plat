'use client'
import {Shinren} from '@app/(apps)/shinren/class/Shinren'
import {Fields} from '@cm/class/Fields/Fields'
import {Button} from '@cm/components/styles/common-components/Button'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

const QuerySwitcher = () => {
  const columns = Fields.transposeColumns([Shinren.col.userIdColumn])
  const {BasicForm, latestFormData} = useBasicFormProps({columns, formData: {}})
  return (
    <>
      <BasicForm latestFormData={latestFormData} alignMode="row">
        <Button>検索</Button>
      </BasicForm>
    </>
  )
}

export default QuerySwitcher
