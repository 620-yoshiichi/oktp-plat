'use client'
import {Fields} from '@cm/class/Fields/Fields'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import React from 'react'

export default function FilterConfig({commonFilterQuery}) {
  const {query, toggleLoad, addQuery} = useGlobal()
  const columns = new Fields([
    {
      id: `dataKey`,
      label: `基準日`,
      forSelect: {
        optionsOrOptionFetcher: [
          {name: `振当`, value: `DD_FR`},
          {name: `納車`, value: `DD_NOSYA`},
        ],
      },
    },
    {id: `by`, label: `グループピング`, forSelect: {optionsOrOptionFetcher: [`店舗`, `スタッフ`]}},
    {
      id: `sort`,
      label: `並び替え`,
      forSelect: {
        optionsOrOptionFetcher: [
          {name: `昇順(書類)`, value: `ASC`},
          {name: `降順(書類)`, value: `DESC`},
          {name: `コード順`, value: `CODE`},
        ],
      },
    },
  ]).transposeColumns()

  const {BasicForm, latestFormData} = useBasicFormProps({
    columns,
    formData: commonFilterQuery,
    onFormItemBlur: props => {
      addQuery(props.newlatestFormData)
    },
  })

  return (
    <div>
      <BasicForm
        {...{
          latestFormData,
          alignMode: `row`,
        }}
      >
        {/* <Button>更新</Button> */}
      </BasicForm>
    </div>
  )
}
