'use client'
import {columnGetterType} from '@cm/types/types'
import {colType} from '@cm/types/col-types'
import {Fields} from '@cm/class/Fields/Fields'

import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {absSize} from '@cm/lib/methods/common'

import {ucarColBuilder} from '@app/(apps)/ucar/class/ColBuilder/UcarColBuilder'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import {BankUpsertModal} from '@app/(apps)/ucar/(parts)/Bank/BankUpsertModal'
import {getUcarProcessCols} from '@app/(apps)/ucar/class/ColBuilder/getter/getUcarProcessCols'
import {getUcarPaperWorkNotesCols} from '@app/(apps)/ucar/class/ColBuilder/getter/getUcarPaperWorkNotesCols'

export class ColBuilder {
  static ucar = ucarColBuilder
  static ucarGarageLocationMaster = (props: columnGetterType) => {
    return new Fields([
      {
        ...{id: `name`, label: `地域`, search: {}},
        form: {register: {required: `必須`}},
      },
    ]).transposeColumns()
  }
  static ucarGarageSlotMaster = (props: columnGetterType) => {
    return new Fields([
      {
        ...{id: `ucarGarageLocationMasterId`, label: `地域`},
        td: {hidden: true},
        forSelect: {},
        form: {register: {required: `必須`}},
      },
      {
        ...{id: `garageNumber`, label: `車庫番号`},
        form: {register: {required: `必須`}},
      },
      {
        ...{id: `appliedCar`, label: `適用車両(査定ID) `},
        format: (value, row) => {
          const LastAppliedCar = row.AppliedUcarGarageSlot.sort((a, b) => (a.appliedAt > b.appliedAt ? -1 : 1)).find(
            row => !row.finishedAt
          )?.Ucar
          if (LastAppliedCar) {
            return LastAppliedCar?.Assessment_ID
          }
        },
      },
      {
        ...{id: `history`, label: `使用中 / 総登録`},
        td: {
          getRowColor: (value, row) => {
            return row.AppliedUcarGarageSlot.filter(row => !row.finishedAt).length > 0 ? '#909090' : ''
          },
        },

        format: (value, row) => {
          const count = row.AppliedUcarGarageSlot.filter(row => !row.finishedAt).length
          const totalCount = row.AppliedUcarGarageSlot.length
          return (
            <R_Stack className={`flex-nowrap`}>
              <div color={count > 0 ? 'red' : ''}>
                <strong className={count > 0 ? 'bg-error-main inline-block  rounded px-2 text-center text-white' : ''}>
                  {count}
                </strong>{' '}
                / <small>{totalCount}</small>
              </div>
            </R_Stack>
          )
        },
      },
    ])
      .customAttributes(({col}) => {
        return {...col, td: {style: {...absSize({width: 100}), ...col?.td?.style}}}
      })

      .transposeColumns()
  }

  static UcarPaperWorkNotes = getUcarPaperWorkNotesCols
  static bankMaster = (props: columnGetterType) => {
    const result = new Fields([
      {
        id: 'code',
        label: 'コード',

        form: {...defaultRegister},
        search: {},
      },
      {id: 'name', label: '銀行名', form: {...defaultRegister}, search: {}},
      {
        id: 'bankMaster',
        label: '銀行名',
        format: (value, row, col) => {
          return (
            <R_Stack className={` items-center`}>
              <BankUpsertModal {...{bankMasterId: row.id, formData: {}}} />
              <div>
                {CsvTable({
                  records: row.BankBranchMaster?.map(d => {
                    return {
                      csvTableRow: [
                        {
                          label: 'コード',
                          style: {minWidth: 80},
                          cellValue: d.code,
                        },
                        {
                          label: '支店名',
                          style: {minWidth: 240},
                          cellValue: d.name,
                        },
                        {
                          label: '',
                          cellValue: <BankUpsertModal {...{bankMasterId: row.id, formData: d}} />,
                        },
                      ],
                    }
                  }),
                }).WithWrapper({className: `t-paper `})}
              </div>
            </R_Stack>
          )
        },
      },
    ]).transposeColumns()

    return result
  }
  static bankBranchMaster = (props: columnGetterType) => {
    const result = new Fields([
      {id: 'code', label: 'コード', form: {...defaultRegister}, td: {style: {...absSize({width: 40})}}},
      {id: 'name', label: '支店名', form: {...defaultRegister}, td: {style: {...absSize({width: 120})}}},
    ]).transposeColumns()

    return result
  }
  static store = (props: columnGetterType) => {
    const data: colType[] = [
      {
        id: 'code',
        label: '拠点コード',
        type: 'number',
        td: {},
        form: {register: {required: '必須'}},
        search: {},
      },
      {
        id: 'name',
        label: '名前',
        form: {register: {}},
      },
      {
        id: 'areaId',
        label: '配送エリア区分',
        form: {register: {}},
        forSelect: {},
      },
    ]

    return Fields.transposeColumns(data)
  }

  static ucarProcess = getUcarProcessCols

  static user = (props: columnGetterType) => {
    const {useGlobalProps} = props

    const col1: colType[] = [
      {
        id: 'code',
        type: 'number',
        label: 'コード',
        form: {
          register: {required: '必須'},
        },
        sort: {},
        search: {},
      },
      {
        id: 'storeId',
        label: '店舗',
        forSelect: {},
        form: {defaultValue: props.ColBuilderExtraProps?.storeId},
        sort: {},
        search: {},
      },

      {
        id: 'name',
        label: '氏名',
        form: {
          register: {required: '必須'},
        },
        sort: {},
        search: {},
      },
      {
        id: 'email',
        label: 'メールアドレス',

        form: {
          register: {required: '必須'},
        },
        sort: {},
        search: {},
        type: 'email',
      },
      {
        id: 'password',
        label: 'パスワード',
        type: 'password',
        form: {register: {required: '必須'}},
        td: {hidden: true},
      },
    ]

    const data: colType[] = Fields.mod.addColIndexs([col1])

    return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
  }
}

export const renderThDivider = props => {
  const {label, maxRowSpan} = props
  return {
    th: {
      divider: {},
      format: () => <div className={` [writing-mode:vertical-rl]`}>{label} </div>,
    },
    td: {rowSpan: maxRowSpan},
  }
}
