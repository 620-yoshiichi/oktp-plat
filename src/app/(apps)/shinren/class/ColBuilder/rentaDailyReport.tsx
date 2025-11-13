'use client'

import {columnGetterType} from '@cm/types/types'
import {colType} from '@cm/types/col-types'

import {Fields} from '@cm/class/Fields/Fields'
import {Shinren} from '@app/(apps)/shinren/class/Shinren'

import {copyMultipeColumnObject} from '@cm/lib/methods/multipleItemLib'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {T_LINK} from '@cm/components/styles/common-components/links'
import {HREF} from '@cm/lib/methods/urls'
import {ChildrenCountFormat} from '@cm/class/Fields/lib/defaultFormat'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import useWindowSize from '@cm/hooks/useWindowSize'

const minWidth = 120
const tdStyle = {minWidth}

export const rentaDailyReport = (props: columnGetterType) => {
  const {
    ColBuilderExtraProps,
    useGlobalProps: {session, accessScopes, query},
  } = props

  const {device, width} = useWindowSize()
  const today = getMidnight()

  const col0: colType[] = []
  const col1: colType[] = [
    ...new Fields([
      {
        id: 'id',
        label: 'id',
        type: 'number',
      },
      {
        id: 'rentaStoreId',
        label: '店舗',
        type: `number`,
        forSelect: {},
        form: {
          disabled: true,
          defaultValue: ColBuilderExtraProps?.rentaStoreId,
          register: {required: '必須'},
        },
        // format: (value, row) => row.RentaStore.name,
        td: {hidden: device.PC ? false : true},
      },

      {
        ...Shinren.col.userIdColumn,
        form: {
          disabled: true,
          defaultValue: session?.id,
          register: {required: '必須'},
        },

        td: {hidden: device.PC ? false : true},
      },
    ])
      .customAttributes(({col}) => ({
        ...col,
        td: {style: {...tdStyle, ...col?.td?.style}},
      }))
      .aggregateOnSingleTd().plain,

    ...new Fields([
      {
        id: 'rentaCustomerId',
        label: '顧客名',
        form: {register: {required: '必須'}},
        format: (value, row) => {
          const href = HREF(`/shinrn/rentaCustomer/${row.rentaCustomerId}`, {}, query)
          return (
            <div className={`min-w-[100px] text-sm !leading-5`}>
              <T_LINK href={href}>{row?.RentaCustomer?.name}</T_LINK>
            </div>
          )
        },

        forSelect: {
          ...Shinren.rentaCustomer.getForSelectConfig({session}),
          allowCreateOptions: {
            creator: () => {
              return {
                getCreatFormProps: props2 => {
                  const columns = new Fields([
                    {...{id: `name`, label: `顧客名`}, form: {defaultValue: props2.searchFormData?.name, ...defaultRegister}},
                    {
                      label: 'スタッフ',
                      id: 'userId',
                      form: {
                        defaultValue: session.id,
                        disabled: true,
                      },
                      forSelect: {
                        config: {
                          where: {app: 'shinren'},
                          orderBy: [{RentaStore: {code: 'asc'}}, {code: 'asc'}],
                        },
                      },
                    },
                    {
                      ...{id: `rentaStoreId`, label: `営業所`},

                      form: {defaultValue: session.rentaStoreId, disabled: true},
                      forSelect: {},
                    },

                    {
                      ...{id: `result`, label: `結果`},
                      form: {defaultValue: '継続しない'},
                      forSelect: {
                        optionsOrOptionFetcher: Shinren.constants.resultTypes,
                      },
                    },
                    {
                      ...{id: `type`, label: `新管区分`},

                      form: {defaultValue: '新規'},
                      forSelect: {optionsOrOptionFetcher: Shinren.constants.visitTypes},
                    },
                  ])
                    .aggregateOnSingleTd()
                    .transposeColumns()

                  return {
                    columns,
                    formData: {},
                  }
                },
              }
            },
          },
        },
      },
      {
        id: 'date',
        label: '登録日時',
        type: 'date',
        form: {
          defaultValue: today,
          register: {required: '必須'},
        },
      },
      {id: 'time', label: 'アポ時間', type: 'time', form: {}},
    ])
      .customAttributes(({col}) => ({
        ...col,
        td: {style: {...tdStyle, ...col?.td?.style}},
      }))
      .aggregateOnSingleTd().plain,

    ...new Fields([
      {
        id: 'approachType',
        label: '手段',
        forSelect: {
          optionsOrOptionFetcher: Shinren.constants.approachTypes,
        },
        form: {register: {required: '必須'}},
      },
      {
        id: 'visitType',
        label: '訪問区分',
        forSelect: {optionsOrOptionFetcher: Shinren.constants.visitTypes},
        form: {register: {required: '必須'}},
      },
    ])
      .customAttributes(({col}) => ({
        ...col,

        td: {style: {...tdStyle, ...col?.td?.style}},
      }))
      .aggregateOnSingleTd().plain,
  ]

  const purposeOutcomePayload = {userId: session?.id, date: getMidnight(new Date())}

  const col2: colType[] = [
    {
      id: 'useHoujinDb',
      label: '法人DB利用',
      type: `boolean`,
      td: {hidden: true},
      form: {},
    },
    ...copyMultipeColumnObject({
      colCount: 2,
      label: '用途',
      model: 'purpose',
      colId: 'purposeMasterId',
      additional: {payload: {...purposeOutcomePayload}},
    }),
    ...copyMultipeColumnObject({
      label: '成果',
      colCount: 3,
      model: 'outcome',
      colId: 'outcomeMasterId',
      additional: {payload: {...purposeOutcomePayload}},
    }),

    {
      id: 'increasedNegotiationsCount',
      label: '商談増',
      type: 'number',
      format: ChildrenCountFormat,
      form: {register: {}},
    },
  ]

  const col3: colType[] = [
    {
      id: 'remarks',
      label: 'メモ',
      type: 'textarea',
      // td: {style: {fontSize: 10, minWidth: 100}},
      format: value => <small>{value}</small>,
      form: {
        register: {},
        style: {
          width: 500,
          height: 200,
          maxWidth: '80vw',
          maxHeight: '50vh',
        },
      },
    },
  ]

  // return new Fields([
  //   //
  //   ...col0,
  //   ...col1,
  //   ...col2,
  //   ...col3,
  // ]).transposeColumns()

  let data: colType[] = [...Fields.mod.addColIndexs([col0, col1, col2, col3])]

  data = Fields.mod.setAttribute({
    cols: data,
    targets: {
      mode: 'exclude',
      ids: ['rentaCustomerId', 'date', 'time', 'remarks'],
    },
    attributeSetter: ({col}) => {
      let result = col
      if (width < 500) {
        const td = {...col.td, hidden: true}
        result = {...col, td}
      }
      return result
    },
  })

  data = Fields.mod.setAttribute({
    cols: data,
    targets: {
      mode: 'include',
      ids: ['rentaCustomerId', 'userId', 'rentaStoreId', 'time', 'visitType', 'remarks'],
    },
    attributeSetter: ({col}) => ({...col, search: {}}),
  })

  const disabled = ({record, col}) => {
    const isOwner = record?.userId === props.useGlobalProps?.session?.id
    const isManager = accessScopes().getShinernScopes().isManager

    const disabled = isManager || isOwner ? false : true

    return disabled
  }

  data = Fields.mod.setAttribute({
    cols: data,
    attributeSetter: ({col}) => {
      const form = col?.form ? {...col?.form, disabled} : undefined
      return {...col, form}
    },
    targets: {
      mode: 'include',
      ids: data.map(col => col.id).filter(id => ['userId', 'rentaStoreId'].includes(id) === false),
    },
  })

  return Fields.transposeColumns(data, {
    ...props.transposeColumnsOptions,
  })
}
