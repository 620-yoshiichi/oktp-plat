'use client'
import {columnGetterType} from '@cm/types/types'
import {colType} from '@cm/types/col-types'
import {Fields} from '@cm/class/Fields/Fields'

import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'

export const getUcarPaperWorkNotesCols = (props: columnGetterType) => {
  const col1: colType[] = [
    {
      id: 'userId',
      label: '登録者',
      forSelect: {},
      form: {
        disabled: true,
        defaultValue: props.useGlobalProps.session?.id,
      },
    },
    {
      ...{id: 'type', label: '申請区分', form: {}},
      forSelect: {
        optionsOrOptionFetcher: UCAR_CODE.PAPER_WORK_NOTE_TYPES.array,
      },
    },
    {
      ...{id: 'content', label: 'メッセージ', type: 'textarea'},
      form: {},
      td: {style: {width: 200}},
    },
    {
      ...{id: 'resolvedAt', label: '解決日', type: 'date'},
      form: {},
    },
  ]

  const data: colType[] = Fields.mod.addColIndexs([col1])

  return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
}
