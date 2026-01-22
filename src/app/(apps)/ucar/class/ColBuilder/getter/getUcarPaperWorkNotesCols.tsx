'use client'
import { columnGetterType } from '@cm/types/types'
import { colType } from '@cm/types/col-types'
import { Fields } from '@cm/class/Fields/Fields'

import { UCAR_CODE } from '@app/(apps)/ucar/class/UCAR_CODE'
import { T_LINK } from '@cm/components/styles/common-components/links'

export const getUcarPaperWorkNotesCols = (props: columnGetterType) => {
  const col1: colType[] = [
    {
      id: 'type',
      label: '申請区分',

      forSelect: {
        codeMaster: UCAR_CODE.PAPER_WORK_NOTE_TYPES,
      },
      form: {
        defaultValue: UCAR_CODE.PAPER_WORK_NOTE_TYPES.raw.FUBI.code,
      },
    },
    {
      id: 'createdAt',
      label: '登録日',
      type: 'date',
      form: { hidden: true },
    },

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
      id: 'content',
      label: '内容',
      type: 'textarea',
      form: {},
      td: { style: { width: 200 } },
    },

    {
      id: 'resolvedAt',
      label: '解決日',
      type: 'date',
      form: {},
    },
    {
      id: 'fubiHensoHyo',
      label: '不備返送表',
      type: 'date',
      form: { hidden: true },
      format: (value, row) => {
        return (
          <T_LINK href={`/ucar/fubiHensoHyo/${row.id}`} target="_blank">
            不備返送表
          </T_LINK>
        )
      },
    },
  ]

  const data: colType[] = Fields.mod.addColIndexs([col1])

  return Fields.transposeColumns(data, { ...props.transposeColumnsOptions })
}
