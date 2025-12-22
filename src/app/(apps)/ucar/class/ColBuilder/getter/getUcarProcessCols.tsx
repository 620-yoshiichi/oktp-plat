'use client'
import {columnGetterType} from '@cm/types/types'
import {colType} from '@cm/types/col-types'
import {Fields} from '@cm/class/Fields/Fields'

import {UCAR_CONSTANTS} from '@app/(apps)/ucar/(constants)/ucar-constants'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'

export const getUcarProcessCols = (props: columnGetterType) => {
  const {useGlobalProps, ColBuilderExtraProps} = props

  const {sateiID, storeId, stores, processCode} = ColBuilderExtraProps ?? {}

  const {session} = useGlobalProps

  const {id: userId} = session ?? {}

  const QrSheetIssueColes = getUcarProcessQrSheetIssueColes({stores})
    .find(p => p.value === processCode)
    ?.columns.flat() ?? [{id: 'remarks', label: '備考', type: 'textarea', form: {}, td: {style: {maxWidth: 140}}}]

  const customeStyle = ({col}: {col: colType}) => {
    return {
      ...col,
      form: {...col?.form, style: {...col?.form?.style, minWidth: 280}},
    }
  }

  const result = new Fields([
    ...new Fields([
      {
        id: 'sateiID',
        label: '査定ID',
        type: 'text',
        form: {defaultValue: sateiID, disabled: true},
        td: {style: {minWidth: 140}},
      },

      {
        id: 'userId',
        label: 'ユーザー',
        forSelect: {},
        form: {disabled: true, defaultValue: userId, ...defaultRegister},
      },
      {
        id: 'processCode',
        label: '工程',

        forSelect: {
          codeMaster: UcarProcessCl.CODE,
          // optionsOrOptionFetcher: UcarProcessCl.CODE.array.map(p => ({id: p.code, name: p.label, color: p.color})),
        },
        // format: value => UcarProcessCl.CODE.byCode(value)?.label,

        form: {
          disabled: true,
          register: {required: '必須'},
        },
      },
    ])
      // .showSummaryInTd({})
      .customAttributes(customeStyle).plain,
    ...new Fields([
      {
        id: 'date',
        label: '日時',
        type: 'datetime',
        format: (value, row) => {
          return formatDate(row.date, 'YYYY-MM-DD(ddd)')
        },
        td: {style: {minWidth: 140}},
        form: {defaultValue: new Date()},
      },
      ...QrSheetIssueColes, // QR発行情報（必要な時だけ）
    ])
      // .showSummaryInTd({wrapperWidthPx: 180})
      .customAttributes(customeStyle).plain,
  ]).transposeColumns()

  return result
}

const getUcarProcessQrSheetIssueColes = (props: any) => {
  const {stores} = props
  const data = [
    {
      value: 'QR発行',
      columns: Fields.transposeColumns(UCAR_CONSTANTS.columns.getQrSheetIssueInfoCol({stores})),
    },
  ]

  return data
}
