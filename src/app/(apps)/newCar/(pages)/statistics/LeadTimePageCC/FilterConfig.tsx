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
          {id: 'DD_FR', label: '振当'},
          {id: 'DD_NOSYA', label: '納車'},
        ],
      },
    },
    {id: `by`, label: `グループピング`, forSelect: {optionsOrOptionFetcher: [`店舗`, `スタッフ`]}},
    {
      id: `sort`,
      label: `並び替え`,
      forSelect: {
        optionsOrOptionFetcher: [
          {id: 'ASC', label: '昇順(書類)'},
          {id: 'DESC', label: '降順(書類)'},
          {id: 'CODE', label: 'コード順'},
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
