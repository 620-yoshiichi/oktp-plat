'use client'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Fields} from '@cm/class/Fields/Fields'
import {Button} from '@cm/components/styles/common-components/Button'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

import React from 'react'
export const Filter = ({query, addQuery}) => {
  const {BasicForm, latestFormData} = useBasicFormProps({
    formData: query,
    columns: new Fields([
      {
        id: `orderNumber`,
        label: `受注番号で検索`,
        // forSelect: {optionsOrOptionFetcher: [`全て`, `保留あり`, `保留なし`]},
        form: {
          descriptionNoteAfter: `*他の条件は無視されます`,
        },
      },
      {
        id: `searchBy_DD_HONBSYOK`,
        label: `最終更新日で検索`,
        type: `date`,
        form: {
          descriptionNoteAfter: `*他の条件は無視されます`,
        },
      },
      {
        id: `shinren`,
        label: `新レン`,
        form: {
          descriptionNoteAfter: `*他の条件は無視されます`,
        },
        type: `boolean`,
      },
    ]).transposeColumns(),
  })
  return (
    <BasicForm
      {...{
        latestFormData,
        onSubmit: async data => {
          addQuery({
            ...data,
            searchBy_DD_HONBSYOK: data.searchBy_DD_HONBSYOK ? formatDate(data.searchBy_DD_HONBSYOK) : undefined,
          })
        },
      }}
    >
      <Button>確定</Button>
    </BasicForm>
  )
}
