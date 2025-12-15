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
import {isGarageSlotAvailable} from '@app/(apps)/ucar/(lib)/garage/garageUtils'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

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
        id: `ucarGarageLocationMasterId`,
        label: `地域`,
        td: {hidden: true},
        forSelect: {},
        form: {register: {required: `必須`}, disabled: true},
      },
      {
        id: `garageNumber`,
        label: `車庫番号`,
        form: {register: {required: `必須`}, disabled: true},
      },
      {
        id: `finishedAt`,
        label: `強制空白`,
        form: {},
        format: (value, row) => {
          return formatDate(row.finishedAt)
        },
      },
      {
        id: `appliedCar`,
        label: `適用車両(査定ID) `,
        format: (value, row) => {
          // 使用中（空きではない）スロットの中で最新の適用車両を取得
          const LastAppliedCar = row.AppliedUcarGarageSlot.sort((a, b) => (a.appliedAt > b.appliedAt ? -1 : 1)).find(slot => {
            return !isGarageSlotAvailable(slot)
          })?.Ucar
          if (LastAppliedCar) {
            return LastAppliedCar?.sateiID
          } else {
            return '適用なし'
          }
        },
      },
      {
        ...{id: `history`, label: `使用中 / 総登録`},
        td: {
          getRowColor: (value, row) => {
            // 使用中（空きではない）スロットが1つ以上あればグレー表示
            return row.AppliedUcarGarageSlot.filter(slot => !isGarageSlotAvailable(slot)).length > 0 ? '#bbbbbb' : ''
          },
        },

        format: (value, row) => {
          // 使用中（空きではない）スロットの数
          const count = row.AppliedUcarGarageSlot.filter(slot => !isGarageSlotAvailable(slot)).length

          const totalCount = row.AppliedUcarGarageSlot.length
          return (
            <R_Stack className={`flex-nowrap gap-0.5`}>
              <span>{count}</span>
              <span>/</span>
              <span>{totalCount}</span>
            </R_Stack>
          )
        },
      },
    ])
      .customAttributes(({col}) => {
        return {
          ...col,
          td: {
            ...col?.td,
            style: {...absSize({width: 100}), ...col?.td?.style},
          },
        }
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
              <BankUpsertModal {...{bankCode: row.code, formData: {}}} />
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
                          cellValue: <BankUpsertModal {...{bankCode: row.code, formData: d}} />,
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
