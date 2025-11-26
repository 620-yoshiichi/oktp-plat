'use client'
import dynamic from 'next/dynamic'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'

import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'

import {columnGetterType, editFormatType} from '@cm/types/types'

import {getScopes} from 'src/non-common/scope-lib/getScopes'

const ProcessNameSelector = dynamic(() => import('@app/(apps)/QRBP/components/QRBP/Process/ProcessNameSelector'))

import {Fields} from '@cm/class/Fields/Fields'

import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {ControlContextType} from '@cm/types/form-control-type'

import {carForCr} from '@app/(apps)/QRBP/class/lib/carForCrCol'
import {carListForEngineerCol} from '@app/(apps)/QRBP/class/lib/carListForEngineerCol'

import {Alert} from '@cm/components/styles/common-components/Alert'
import {ColoredText} from '@cm/components/styles/common-components/colors'
import useRoleGMF from '@cm/hooks/useRoleGMF'

import {PencilSquareIcon} from '@heroicons/react/20/solid'
import {colType} from '@cm/types/col-types'
import {carForStore} from '@app/(apps)/QRBP/class/lib/carForStoreCol'

export class ColBuilder {
  static damageNameMaster = (props: columnGetterType & {dataModelName: string}) => {
    const {admin} = props.useGlobalProps.accessScopes()
    const col1: colType[] = [
      {id: 'name', label: '名称', type: 'text', form: {disabled: !admin, register: {required: '必須'}}},
      {id: 'color', label: '色', type: 'color', form: {disabled: !admin, register: {required: '必須'}}},
      {id: 'carPerDay', label: '基準台数', type: 'float', form: {register: {required: '必須'}}},
    ]
    const data: colType[] = col1
    return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
  }

  // static area = (props: columnGetterType) => {
  //   const data: colType[] = [
  //     {
  //       id: 'name',
  //       label: '名前',
  //       form: {register: {}},
  //     },
  //     {
  //       id: 'name',
  //       label: '名前',
  //       form: {register: {}},
  //     },
  //   ]

  //   return Fields.transposeColumns(data)
  // }
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
        id: 'tel',
        label: '電話番号',
        form: {register: {}},
      },
      {
        id: 'fax',
        label: 'FAX番号',
        form: {register: {}},
      },
      {
        id: 'address',
        label: '住所',
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

  static processNameMaster = (props: columnGetterType) => [
    [
      {
        id: 'name',
        label: <div>名称</div>,

        form: {register: {required: '必須'}},
      },
      {
        id: 'type',
        label: `工程区分`,
        form: {register: {required: '必須'}},
      },

      {
        id: 'color',
        label: '色',
        type: 'color',

        format: (value, row) => {
          return <ColoredText bgColor={value}>{value}</ColoredText>
        },
        td: {style: {width: 100}},
        form: {register: {required: '必須'}},
      },
      {
        id: 'onEnginerProcess',
        label: '工程表示',
        type: 'boolean',
        td: {style: {textAlign: 'center'}},
        form: {},
      },
      {
        id: 'repetitionLimit',
        label: `重複許容`,
        type: 'number',
        td: {style: {width: 70}},
        form: {},
      },
    ],
  ]

  static user = (props: columnGetterType) => {
    const {useGlobalProps} = props
    const {session} = useGlobalProps
    const scopes = getScopes(session)

    const data: colType[] = [
      {
        id: 'storeId',
        label: '拠点',
        forSelect: {},
        form: {
          register: {required: '必須'},
          disabled: !scopes.admin,
        },
        sort: {},
        search: {},
      },
      {
        id: 'code',
        type: 'number',
        label: 'スタッフコード',
        form: {
          register: {required: '必須'},
          disabled: !scopes.admin,
        },
        sort: {},
        search: {},
      },
      {
        id: 'name',
        label: '氏名',
        form: {
          register: {required: '必須'},
          disabled: !scopes.admin,
        },
        sort: {},
        search: {},
      },
      {
        id: 'email',
        label: 'メールアドレス',

        form: {
          register: {required: '必須'},
          disabled: !scopes.admin,
        },
        sort: {},
        search: {},
        type: 'email',
      },
      {
        id: 'password',
        label: 'パスワード',
        type: 'password',
        form: {},
      },
      {
        id: 'type',
        label: '区分',
        form: {disabled: !scopes.admin},
        search: {},
        sort: {},
        forSelect: {
          optionsOrOptionFetcher: BP_Car.const.userTypes,
        },
      },
      {
        id: 'type2',
        label: '区分2',

        form: {disabled: !scopes.admin},
        search: {},
        sort: {},
        forSelect: {
          optionsOrOptionFetcher: BP_Car.const.engineerTeamType,
        },
      },
      {
        id: 'damageNameMasterId',
        label: 'ダメージ',
        forSelect: {},
        form: {
          disabled: !scopes.admin,
        },
        search: {},
        sort: {},
      },

      {
        id: 'role',
        label: '権限（旧）',
        format: value => value,
        form: {
          register: {required: '必須'},
          disabled: !scopes.admin,
        },
        sort: {},
        search: {},
      },

      {
        id: 'userRoles',
        label: '権限',
        format: (value, row: any) => {
          const {setGMF_OPEN} = useRoleGMF()
          return (
            <R_Stack {...{className: `onHover flex-nowrap gap-0.5`, onClick: () => setGMF_OPEN({user: row})}}>
              <PencilSquareIcon className={`min-w-4 h-4`} />
              <small>{row.UserRole.map(role => role.RoleMaster.name).join(' / ')}</small>
            </R_Stack>
          )
        },
        form: {hidden: true},
      },
      {
        id: 'apps',
        label: 'アプリ',
        type: `array`,
        form: {disabled: !scopes.admin},
        format: (value, row) => {
          return value.join(' / ')
        },
      },
      {id: 'active', label: 'アクティブ', type: `boolean`, form: {}},
    ]
    return Fields.transposeColumns(data)
  }

  static carListForEngineer = carListForEngineerCol

  static engineerList = () =>
    Fields.transposeColumns([
      {id: 'name', label: '氏名'},
      {
        id: 'type',
        label: '区分',
      },
      {
        id: 'processToday',
        label: '今日',
        format: (value, row) => {
          const ProcessToday = row?.Process?.filter(process => {
            return formatDate(process?.date) === formatDate()
          })

          const color = ProcessToday?.length > 0 ? 'bg-primary-main' : 'bg-sub-light'

          return <div className={`icon-btn mx-auto  text-base text-white ${color}`}>{ProcessToday?.length}</div>
        },
      },
      {
        id: 'processForSelectedDates',
        label: '期間中',
        format: (value, row) => {
          const ProcessToday = row?.Process?.filter(process => {
            return true
          })

          const color = ProcessToday?.length > 0 ? 'bg-primary-main' : 'bg-sub-light'

          return <div className={`icon-btn mx-auto  text-base text-white ${color}`}>{ProcessToday?.length}</div>
        },
      },
    ])

  static engineer = (props: columnGetterType) => [
    [
      {
        id: 'name',
        label: '氏名',
        form: {register: {required: '必須'}},
      },
    ],
  ]

  static processHistory = (props: columnGetterType) => [[{id: 'id', label: 'プロセス'}]]

  static processForCertainCar = (props: columnGetterType) => {
    const {useGlobalProps} = props
    const {session, query} = useGlobalProps

    const iconBtnClass = `!text-[11px] !p-[2px] !text-gray-700`
    return new Fields([
      ...new Fields([
        {
          id: 'processNameMasterId',
          label: '工程',
          forSelect: {},
          // td: {style: {minWidth: 90}},
          form: {
            //工程選択ボタン
            editFormat: (props: ControlContextType) => {
              const {col, ReactHookForm, field} = props
              return <ProcessNameSelector {...{col, ReactHookForm, field}} />
            },
            register: {required: '必須'},
          },
          // format: (value, row, col) => {
          //   const ProcessNameMaster = row.ProcessNameMaster
          //   return (
          //     <C_Stack className={`mx-auto items-center gap-1 text-sm `}>
          //       <IconBtnForSelect className={iconBtnClass} color={ProcessNameMaster?.color}>
          //         {ProcessNameMaster?.name}
          //       </IconBtnForSelect>
          //       <span>{row?.User?.name}</span>
          //     </C_Stack>
          //   )
          // },
        },

        {
          id: 'userId',
          label: '担当',
          forSelect: {
            config: {
              where: {
                UserRole: {some: {RoleMaster: {name: 'CRエンジニア'}}},
              },
            },
          },
          // td: {hidden: true,},
          form: {
            defaultValue: Number(query?.userId ?? session?.id),
            register: {
              required: '必須',
            },
          },
        },
        {
          id: 'time',
          label: '時間',
          type: 'float',
          forSelect: {
            optionsOrOptionFetcher: BP_Car.const.timeTypes,
          },
          form: {defaultValue: 1.0, register: {required: '必須'}},
          // td: {style: {minWidth: 90}},
          // format: (value, row) => {
          //   const processColor = BP_Car.const.processTypes.find(type => type.value === row?.type)?.color ?? ''

          //   return (
          //     <C_Stack className={`w-full items-center`}>
          //       <R_Stack>
          //         {value && (
          //           <IconBtn color={generateColorCodeInRange(Number(value), 0, 5)} className={cl(iconBtnClass, 'w-[30px]')}>
          //             {value}
          //           </IconBtn>
          //         )}
          //         {row.type && (
          //           <IconBtn className={iconBtnClass} color={processColor}>
          //             {row.type}
          //           </IconBtn>
          //         )}
          //       </R_Stack>

          //       {row.date && <IconBtn className={iconBtnClass}>{formatDate(row.date, 'YY-MM-DD')}</IconBtn>}
          //     </C_Stack>
          //   )
          // },
        },
      ]).showSummaryInTd({labelWidthPx: 24, wrapperWidthPx: 110}).plain,
      ...new Fields([
        {
          id: 'date',
          label: '日時',
          type: 'date',
          // td: {hidden: true},
          form: {
            defaultValue: getMidnight(new Date()),
            register: {required: '必須'},
          },
          format: (value, row) => {
            return formatDate(row?.date, 'MM/DD(ddd)')
          },
        },

        {
          id: 'type',
          label: '区分',
          forSelect: {optionsOrOptionFetcher: BP_Car.const.processTypes},
          // td: {hidden: true},
          ...{
            form: {defaultValue: '通常', register: {required: '必須'}},
          },
        },
        {
          id: 'note',
          label: '備考',
          type: 'textarea',
          format: (value, process) => {
            const mainCarBpNumber = process?.Car?.representativeCarBpNumber
            const thisCarIsSub = props?.ColBuilderExtraProps?.car?.representativeCarBpNumber

            const ProcessAlert = () => {
              if (thisCarIsSub && !mainCarBpNumber) {
                return (
                  <Alert color="red">
                    <small>代表</small>
                    <small>{thisCarIsSub}</small>
                  </Alert>
                )
              } else if (!thisCarIsSub && mainCarBpNumber) {
                return (
                  <Alert color="red">
                    <small>代表</small>
                    <small>{mainCarBpNumber}</small>
                  </Alert>
                )
              }
              return <></>
            }

            return (
              <div className={`max-h-[50px] w-[80px] overflow-auto break-words     text-xs`}>
                <ProcessAlert />
                {value ?? ''}
              </div>
            )
          },
          form: {
            addFormat: (props: editFormatType) => {
              const {myTable, ReactHookForm} = {...props}
              const {setValue} = ReactHookForm
              const currentValue = ReactHookForm.watch('note')
              const templates = ['コーティング', 'ストライプ', '中間写真', '部品待ち()']
              return (
                <div>
                  <p>テンプレから備考入力</p>
                  <div className={` row-stack  w-fit flex-wrap gap-0  py-2`}>
                    {templates.map(value => {
                      return (
                        <div className={`w-1/2`}>
                          <button
                            type="button"
                            className={`t-paper w-full   p-[2px] text-sm`}
                            onClick={e => {
                              let newValue = currentValue ? currentValue + '\n' : ''
                              newValue += `${value}`
                              setValue('note', newValue)
                            }}
                          >
                            {value}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            },
          },
        },
      ]).showSummaryInTd({labelWidthPx: 24, wrapperWidthPx: 110}).plain,
    ]).transposeColumns()
  }

  static notes = (props: columnGetterType) => {
    const {useGlobalProps} = props
    const isStoreMode = useGlobalProps.pathname.includes('car/forStore')

    return Fields.transposeColumns([
      {
        id: 'noteNameMasterId',
        label: '伝言区分',
        td: {
          style: {width: 100},
        },
        form: {register: {required: '必須'}},
        forSelect: {
          config: isStoreMode
            ? {
                where: {name: {not: {in: ['中断', 'キャンセル']}}},
              }
            : {},
        },
      },
      {
        id: 'content',
        label: '内容',
        type: 'textarea',
        form: {register: {required: '必須'}},
      },
    ])
  }

  static carForStore = carForStore

  static carForCr = carForCr
}
