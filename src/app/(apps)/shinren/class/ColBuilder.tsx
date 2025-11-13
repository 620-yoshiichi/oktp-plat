'use client'

import {columnGetterType} from '@cm/types/types'

import ContentPlayer from '@cm/components/utils/ContentPlayer'

import {Fields} from '@cm/class/Fields/Fields'

import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {rentaCustomer} from '@app/(apps)/shinren/class/ColBuilder/rentaCustomer'
import {rentaDailyReport} from '@app/(apps)/shinren/class/ColBuilder/rentaDailyReport'
import {Shinren} from '@app/(apps)/shinren/class/Shinren'
import {colType} from '@cm/types/col-types'

export class ColBuilder {
  static rentaDailyReport = rentaDailyReport

  static rentaCustomer = rentaCustomer

  static extraInfo = (props: columnGetterType) => {
    const col1: colType[] = [
      {
        id: 'date',
        label: '日付',
        type: 'date',
        form: {defaultValue: getMidnight(new Date())},
      },
      {
        id: 'remarks',
        label: 'メモ',
        form: {},
        type: 'textarea',
      },
      {
        id: 'imageUrl',
        label: '画像',
        type: 'file',
        form: {
          file: {
            accept: {
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/png': ['.png'],
              'application/pdf': ['.pdf'],
            },
            backetKey: 'shinren/extraInfo',
          },
        },
        format: value => {
          const url = value
          return <ContentPlayer {...{src: url}} />
        },
      },
    ]

    const data: colType[] = [...col1]
    return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
  }

  static insuranceInfo = (props: columnGetterType) => {
    const col1: colType[] = [
      {id: 'insuranceCompany', label: '保険会社', form: {register: {required: '必須'}}},
      {
        id: 'dueDate',
        label: '予定日',
        type: 'date',
        form: {register: {required: '必須'}},
      },
      {
        id: 'imageUrl',
        label: '証券画像',
        type: 'file',
        form: {
          file: {
            accept: {
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/png': ['.png'],
              'application/pdf': ['.pdf'],
            },
            backetKey: 'shinren/insuranceInfo',
          },
        },
        format: value => {
          const url = value
          return <ContentPlayer {...{src: url}} />
        },
      },
    ]

    const data: colType[] = [...col1]
    return Fields.transposeColumns(data, {
      ...props.transposeColumnsOptions,
    })
  }

  static alternateInfo = (props: columnGetterType) => {
    const col1: colType[] = [
      {id: 'carName', label: '車名', form: {register: {required: '必須'}}},
      {
        id: 'dueDate',
        label: '予定日',
        type: 'date',
        form: {register: {required: '必須'}},
      },
      {
        id: 'type',
        label: '種目',
        forSelect: {optionsOrOptionFetcher: Shinren.constants.alternateType},
        form: {register: {required: '必須'}},
      },
    ]

    const data: colType[] = [...col1]
    return Fields.transposeColumns(data, {
      ...props.transposeColumnsOptions,
    })
  }

  static rentaReference = (props: columnGetterType) => {
    const {rentaCustomerId} = props.ColBuilderExtraProps ?? {}
    const {query, session} = props.useGlobalProps

    const {config, option} = Shinren.rentaCustomer.getForSelectConfig({session})
    config.modelName = `rentaCustomer`
    const col1: colType[] = [
      {
        id: 'refToId',
        label: '紹介先',
        forSelect: {config, option},
        format: (value, row) => {
          const customer = row?.RefTo?.RentaCustomer
          return Shinren.rentaCustomer.getCustomerDetailLink({customer, query})
        },
        form: {register: {required: '必須'}},
      },
    ]

    const data: colType[] = [...col1]
    return Fields.transposeColumns(data, {
      ...props.transposeColumnsOptions,
    })
  }

  static rentaStore = (props: columnGetterType) => {
    const {useGlobalProps} = props

    const data: colType[] = [
      {
        id: 'name',
        label: '拠点名',
        form: {register: {required: '必須'}},
      },
    ]
    return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
  }

  static user = (props: columnGetterType) => {
    const {useGlobalProps} = props
    const {accessScopes} = useGlobalProps
    const scopes = accessScopes()
    const ShinrenScope = scopes.getShinernScopes()

    const col1: colType[] = [
      {
        id: 'code',
        type: 'number',
        label: 'コード',
        form: {
          disabled: scopes.getShinernScopes().isManager ? false : true,
          register: {required: '必須'},
        },
        sort: {},
        search: {},
      },
      {
        id: 'rentaStoreId',
        label: '店舗',
        forSelect: {},
        form: {
          disabled: ShinrenScope.isManager ? false : true,
          defaultValue: props.ColBuilderExtraProps?.storeId,
        },
        sort: {},
        search: {},
      },

      {
        id: 'name',
        label: '氏名',
        form: {
          disabled: ShinrenScope.isManager ? false : true,
          register: {required: '必須'},
        },
        sort: {},
        search: {},
      },
      {
        id: 'email',
        label: 'メールアドレス',

        form: {
          disabled: ShinrenScope.isManager ? false : true,
          register: {required: '必須'},
        },
        sort: {},
        search: {},
        type: 'email',
      },
      {
        id: 'password',
        label: 'パスワード',
        type: `password`,
        form: {register: {required: '必須'}},
        td: {hidden: true},
      },

      {
        id: 'type',
        label: '権限',

        forSelect: {optionsOrOptionFetcher: Shinren.constants.userTypes},
        form: {
          disabled: ShinrenScope.isManager ? false : true,
          register: {required: '必須'},
        },
        sort: {},
        search: {},
      },
    ]

    const data: colType[] = Fields.mod.addColIndexs([col1])

    return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
  }

  static outcomeMaster = (props: columnGetterType) => {
    const col1: colType[] = [
      {id: 'name', label: '名称', form: {register: {required: '必須'}}},
      {id: 'color', label: '色', type: 'color', form: {register: {required: '必須'}}},
      {id: 'aggregateAs', label: '集計区分', form: {}},
    ]
    const data: colType[] = col1
    return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
  }
  static purposeMaster = (props: columnGetterType) => {
    const col1: colType[] = [
      {id: 'name', label: '名称', form: {register: {required: '必須'}}},
      {id: 'color', label: '色', type: 'color', form: {register: {required: '必須'}}},
      {id: 'aggregateAs', label: '集計区分', form: {}},
    ]
    const data: colType[] = col1
    return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
  }
}
