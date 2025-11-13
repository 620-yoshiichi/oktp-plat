'use client'
import {columnGetterType} from '@cm/types/types'
import {colType} from '@cm/types/col-types'
import {Fields} from '@cm/class/Fields/Fields'

import {UCAR_CONSTANTS} from '@app/(apps)/ucar/(constants)/ucar-constants'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

export const getUcarProcessCols = (props: columnGetterType) => {
  const {useGlobalProps, ColBuilderExtraProps} = props

  const {sateiID, storeId, stores, processCode} = ColBuilderExtraProps ?? {}

  const {session} = useGlobalProps

  const {id: userId} = session ?? {}

  const QrSheetIssueColes = getUcarProcessQrSheetIssueColes({stores})
    .find(p => p.value === processCode)
    ?.columns.flat() ?? [{id: 'remarks', label: '備考', type: 'textarea', form: {}}]

    const shiwakeCols =new Fields([
      {
        id: 'shiwake',
        label: '仕掛',
        type: 'text',
        form: {defaultValue: '仕掛'},
      },
    ]).buildFormGroup({groupName: '仕掛'}).plain

  const customeStyle = ({col}: {col: colType}) => {
    return {
      ...col,
      form: {...col?.form, style: {...col?.form?.style, minWidth: 280}},
    }
  }

  return new Fields([
    ...new Fields([
      {
        id: 'sateiID',
        label: '査定ID',
        type: 'text',
        form: {defaultValue: sateiID, disabled: true},
      },
      {
        ...{id: 'storeId', label: '拠点'},
        forSelect: {},
        form: {
          disabled: true,
          defaultValue: storeId,
        },
      },
      {
        ...{id: 'userId', label: 'ユーザー'},
        forSelect: {},
        form: {disabled: true, defaultValue: userId},
      },
    ])
      .showSummaryInTd({})
      .customAttributes(customeStyle)
      .buildFormGroup({groupName: '基本情報'}).plain,
    ...new Fields([
      {
        id: 'processCode',
        label: '工程',
        forSelect: {
          optionsOrOptionFetcher: UcarProcessCl.CODE.array.map(p => ({id: p.code, name: p.label, color: p.color})),
        },
        format: value => UcarProcessCl.CODE.byCode(value)?.label,

        form: {
          disabled: true,
          register: {required: '必須'},
        },
      },
      {
        id: 'date',
        label: '日時',
        type: 'datetime',
        format: value => formatDate(value, 'YYYY-MM-DD(ddd) HH:mm'),
        form: {defaultValue: new Date()},
      },
      ...QrSheetIssueColes,
    ])
      .showSummaryInTd({})
      .customAttributes(customeStyle)
      .buildFormGroup({groupName: '工程'}).plain,
  ]).transposeColumns()

  const col1: colType[] = [
    {
      id: 'steiId',
      label: '査定ID',
      type: 'text',

      form: {
        defaultValue: sateiID,
        disabled: true,
      },
    },
    ...new Fields([
      {
        ...{id: 'storeId', label: '拠点'},
        forSelect: {},
        form: {
          disabled: true,
          defaultValue: storeId,
        },
        search: {},
      },
      {
        ...{id: 'userId', label: 'ユーザー'},
        forSelect: {},
        form: {disabled: true, defaultValue: userId},
        search: {},
      },
    ])
      .customAttributes(customeStyle)
      .aggregateOnSingleTd().plain,
  ]

  const col2: colType[] = [
    {id: 'processCode', label: '工程', forSelect: {}, search: {}, form: {register: {required: '必須'}}},
    {
      id: 'date',
      label: '日時',
      type: 'datetime',
      form: {defaultValue: new Date()},
    },
  ]

  let data: colType[] = Fields.mod.addColIndexs([col1, col2, QrSheetIssueColes])

  // /**add form props */

  // add required
  data = Fields.mod.setAttribute({
    targets: {mode: 'exclude', ids: ['note', `runnable`, `remarks`]},
    cols: data,
    attributeSetter: ({col}) => {
      const register = {...col.form?.register, required: '必須'}
      const form = {...col.form, register}
      return {...col, form}
    },
  })

  const result = Fields.transposeColumns(data, {...props.transposeColumnsOptions})

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
