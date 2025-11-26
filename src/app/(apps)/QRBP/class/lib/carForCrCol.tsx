'use client'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'

import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'
import {absSize, superTrim} from '@cm/lib/methods/common'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'
import StatusControlerWrapper from '@app/(apps)/QRBP/components/QRBP/Process/StatusControlerWrapper'

import ProcessViwer from '@app/(apps)/QRBP/components/QRBP/Process/ProcessViwer'
import {columnGetterType} from '@cm/types/types'

import {HandRaisedIcon, PlusIcon} from '@heroicons/react/20/solid'
import {toast} from 'react-toastify'
import {Fields} from '@cm/class/Fields/Fields'
import ScheduleDisplay from '@app/(apps)/QRBP/components/QRBP/ScheduleDisplay'
import {Center, C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import {CircledIcon, IconBtn} from '@cm/components/styles/common-components/IconBtn'

import {SubCars} from '@app/(apps)/QRBP/admin/car/forCr/SubCars'

import {defaultFormat} from '@cm/class/Fields/lib/defaultFormat'
import {DoubledBP} from '@app/(apps)/QRBP/class/doubledBpNumber'
import {HREF} from '@cm/lib/methods/urls'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {convertHexToRGBA, getColorStyles} from '@cm/lib/methods/colors'
import {NumHandler} from '@cm/class/NumHandler'
import {Button} from '@cm/components/styles/common-components/Button'

export const carForCr = (props: columnGetterType) => {
  const {useGlobalProps, ColBuilderExtraProps} = props
  const {setformData, editModalOpen, seteditModalOpen} = ColBuilderExtraProps ?? {}

  const {toggleLoad, session, addQuery, accessScopes} = useGlobalProps
  const {admin} = accessScopes()

  return new Fields([
    ...new Fields([
      {
        id: 'carType',
        label: '新/中/BP',
        form: {
          defaultValue: 'BP',
        },

        forSelect: {optionsOrOptionFetcher: BP_Car.const.carTypes},
      },
      {
        id: 'prePermission',
        label: '事前着工許可',
        type: 'boolean',
        form: {},
      },
      {
        id: 'preStart',
        label: '事前着工指示',
        type: 'boolean',
        form: {},
      },
    ])

      .customAttributes(({col}) => {
        return {
          ...col,
          td: {
            getRowColor: (value, row) => {
              const lastProcess = row.Process.sort((a, b) => {
                const bDate = getMidnight(new Date(b.date))
                const aDate = getMidnight(new Date(a.date))
                const asc = aDate.getTime() - bDate.getTime() || (a.id || 0) - (b.id || 0)
                const desc = -asc
                return desc
              })[0]

              const bgColor = lastProcess ? convertHexToRGBA(lastProcess?.ProcessNameMaster?.color, 0.2) : '#feeefe'

              return bgColor
            },
            withLabel: true,
            style: {...absSize({width: 110})},
            hidden: true,
          },
        }
      })
      .aggregateOnSingleTd()
      .buildFormGroup({groupName: `受入時設定値`}).plain,

    ...new Fields([
      {
        id: `orderNumber`,
        label: `注文番号`,
        type: 'text',
        search: {},
        form: {hidden: true},
      },

      {
        id: `advancePayment`,
        label: `前受金`,
        td: {hidden: true},
        form: {hidden: true},
        search: admin ? {} : undefined,
        type: `float`,
      },
      {
        id: 'bpNumber',
        label: 'BP番号',
        type: 'text',
        form: {
          register: {required: '必須'},
          disabled: ({record, col}) => {
            return record?.['bpNumber'] ? true : false
          },
        },
        td: {},
        sort: {},
        search: {},
      },
      {
        id: `action`,
        label: `アクション`,
        form: {hidden: true},
        format: (value, row, col) => {
          const {subCarsInCurrentCars} = props.ColBuilderExtraProps ?? {}
          const accepted = new BP_Car(row).findProcessByName('CR受入')
          return (
            <R_Stack className={`gap-0.5`}>
              <div className={` leading-4`}>
                {admin && (
                  <div>
                    {row.advancePayment > 0 && (
                      <small className={`text-error-main font-bold`}>前受:{NumHandler.toPrice(row.advancePayment)}</small>
                    )}
                  </div>
                )}
              </div>

              <R_Stack className={` flex-nowrap gap-1`}>
                {accepted && (
                  <Button
                    color="blue"
                    size="xs"
                    onClick={() => {
                      const params = DoubledBP.params.create(row)
                      const query = props.useGlobalProps
                      const href = HREF(`/QRBP/admin/car/forCr/qrsheet`, {...params}, query)
                      window.open(href, 'blank')
                    }}
                  >
                    QR
                  </Button>
                )}
                <button className={` w-5 rounded-sm p-1 py-0.5 text-[8px]`}>
                  <HandRaisedIcon
                    onClick={async e => {
                      const repBpNumber = prompt(`代表BP番号(5桁)を入力してください。`)
                      const toThisBpNum = `30 ${repBpNumber}`

                      const carToConnect = await DoubledBP.getLatestCarByBpNumber(toThisBpNum)

                      if (repBpNumber === '99999') {
                        await setrepresentativeCarBpNumber(`99999`)
                      } else {
                        if (!carToConnect) {
                          alert(`該当のデータは見つかりませんでした。`)
                          return
                        }
                        if (
                          confirm(
                            `${repBpNumber} に紐付けます。本当によろしいですか？
             車名:${carToConnect.carName}
             プレート:${carToConnect.plate}
             お客様:${carToConnect.customerName}
             `
                          )
                        ) {
                          await setrepresentativeCarBpNumber(toThisBpNum)
                        }
                      }

                      async function setrepresentativeCarBpNumber(toThisBpNum) {
                        const complexKey = DoubledBP.getComplexKey(row)

                        toggleLoad(async () => {
                          const res = await doStandardPrisma('car', 'update', {
                            where: {complexKey},
                            data: {representativeCarBpNumber: toThisBpNum},
                          })

                          toastByResult(res)
                          toast.success(`データを紐付けました`)
                        })
                      }
                    }}
                  />
                </button>
              </R_Stack>
              <SubCars {...{car: row, subCarsInCurrentCars, setformData}} />
            </R_Stack>
          )
        },
      },
      {
        id: 'lastProcess',
        label: '最終工程',
        format: (value, row) => {
          const accpeted = new BP_Car(row).findProcessByName('CR受入')
          const lastProcess = new BP_Car(row).getLastProcess()
          const {name, type, color} = lastProcess?.ProcessNameMaster ?? {}

          return (
            <C_Stack className={`flex-nowrap gap-1 `}>
              <IconBtn
                size="sm"
                vivid
                className={` text-[10px]! leading-3! w-fit text-center`}
                color={BP_Car.const.carTypes.find(type => type.value === row.carType)?.color ?? ''}
              >
                {row.carType}
              </IconBtn>
              {accpeted ? (
                <IconBtn size="sm" vivid className={` text-[10px]! leading-3! w-fit text-center`} color={color}>
                  {name}
                </IconBtn>
              ) : (
                <IconBtn vivid className={` text-[10px]! leading-3! w-fit text-center`} color="#feeefe">
                  未受入
                </IconBtn>
              )}
            </C_Stack>
          )
        },
        form: {hidden: true},
      },
    ])

      .showSummaryInTd({})
      .aggregateOnSingleTd()
      .buildFormGroup({groupName: `基本①`}).plain,

    ...new Fields([
      {
        id: 'orderedAt',
        label: '受注日',
        type: 'date',
        form: {...defaultRegister},
        td: {},
        sort: {},
        search: {},
      },
      {
        id: 'frame',
        label: 'フレーム',
        form: {hidden: true},

        sort: {},
        search: {},
      },
      {
        id: 'katashiki',
        label: '型式',
        form: {hidden: true},
        td: {},
        sort: {},
        search: {},
      },
      {
        id: 'customerName',
        label: 'お客様名',

        format: (value, row) => <strong className={`font-bold text-[10px]`}>{superTrim(row?.customerName ?? '')}</strong>,
        sort: {},
        search: {},
        form: {hidden: true},
      },
      {id: 'carName', label: '車名', sort: {}, search: {}, form: {hidden: true}},
      {id: 'plate', label: 'プレート', sort: {}, search: {}, type: 'text', form: {hidden: true}},
    ])
      .showSummaryInTd({wrapperWidthPx: 180})
      .aggregateOnSingleTd()
      .buildFormGroup({groupName: `基本①`}).plain,

    ...new Fields([
      ...new Fields([
        {
          id: 'storeId',
          label: '拠点',
          form: {register: {required: '必須'}},
          forSelect: {},
          td: {style: {fontWeight: 'bold'}},
          sort: {},
          // search: {},
        },
        {
          id: 'userId',
          label: '拠点AD',
          forSelect: {
            config: {},
          },
          form: {register: {required: '必須'}},
          type: 'number',
          sort: {},
          search: {},
        },

        {
          id: 'crUserId',
          label: 'CR AD',
          forSelect: {
            config: {
              modelName: 'user',
              where: {
                UserRole: {some: {RoleMaster: {name: 'CRアドバイザ'}}},
              },
            },
          },
          format: (value, row, col) => {
            return <Center> {row?.CrUser?.User.name}</Center>
          },

          form: {
            defaultValue: session?.id,
            register: {required: '必須'},
          },
        },
      ])

        .showSummaryInTd({})
        .aggregateOnSingleTd()
        .buildFormGroup({groupName: `担当`}).plain,
    ]).plain,

    ...new Fields([
      ...new Fields([
        {
          id: 'damageNameMasterId',
          label: 'ダメージ',

          forSelect: {},

          format: (value, row, col) => {
            const {showDamageSelector, setshowDamageSelector, handleClose} = props.ColBuilderExtraProps ?? {}
            const Btn = (
              <R_Stack
                onClick={e => {
                  setshowDamageSelector(row)
                }}
                className={` w-full flex-nowrap`}
              >
                <CircledIcon {...{icon: <PlusIcon />}} />

                {defaultFormat(value, row, col)}
              </R_Stack>
            )

            return Btn
          },
          form: {
            register: {},
          },
          sort: {},
          search: {},
        },
        {
          id: 'currentEstimate',
          label: '見積り',
          type: 'price',
          form: {},
          sort: {},
          search: {},
        },
        {
          id: 'scheduledAt',
          label: '予定',
          type: 'date',
          format: (value, row) => {
            return <ScheduleDisplay {...{car: row, type: 'cr'}} />
          },

          form: {},
        },
        {
          id: 'crScheduledAt',
          label: 'ボード予定',
          form: {},
          type: 'date',
          td: {hidden: true},
        },
      ])
        .showSummaryInTd({wrapperWidthPx: 200})

        .buildFormGroup({groupName: `見積もり等`}).plain,

      //保険
      ...new Fields([
        {
          id: 'insuranceType',
          label: '保険内容',
          sort: {},
          search: {},
          forSelect: {
            optionsOrOptionFetcher: BP_Car.const.insuranceTypes,
          },
          td: {
            style: {width: 70},
          },
        },
        {
          id: 'insuranceCompany',
          label: '保険会社',
          sort: {},
          search: {},
          forSelect: {
            optionsOrOptionFetcher: BP_Car.const.insuranceCompanyTypes,
          },
        },
        {
          id: 'agreedPrice',
          label: '協定金額',
          type: 'price',
          sort: {},
          search: {},
        },
      ])
        .showSummaryInTd({})
        .buildFormGroup({groupName: `保険情報`}).plain,
    ]).aggregateOnSingleTd().plain,

    ...new Fields([
      {
        id: 'processStatus',
        label: 'ステータス',

        form: {hidden: true},
        format: (value, row) => {
          return <StatusControlerWrapper {...{car: row, addQuery, useGlobalProps}} />
        },
      },
      {
        id: 'processViwers',
        label: '進捗',
        form: {hidden: true},
        td: {style: {minWidth: 490}},
        format: (value, row) => {
          const {subCarsInCurrentCars} = props.ColBuilderExtraProps ?? {}

          return (
            <div className={`mx-auto w-full px-2`}>
              <ProcessViwer
                {...{
                  car: row,
                  subCarsInCurrentCars,
                  editModalOpen,
                  seteditModalOpen,
                }}
              />
            </div>
          )
        },
      },
      {
        id: 'notesViewer',
        label: '申請一覧',
        form: {hidden: true},
        td: {
          style: {minWidth: 200},
        },
        format: (value, row, col) => {
          if ((row?.Notes ?? []).length === 0) return <></>
          return (
            <table className={`table-fixed bg-white`}>
              <tbody className={`border-less text-xs`}>
                {row?.Notes?.map((note, i) => {
                  const {NoteNameMaster} = note
                  return (
                    <tr key={note.id} className={`border-b`}>
                      <td width={120} className={`p-0.5!`}>
                        <C_Stack className={` items-start gap-0 p-0.5`} style={{...getColorStyles(NoteNameMaster.color)}}>
                          <R_Stack className={`flex-nowrap gap-0.5`}>
                            <div>{formatDate(note.createdAt, 'M/D(ddd)')}</div>
                            <div>{note?.User?.name}</div>
                          </R_Stack>
                          <div>{NoteNameMaster.name}</div>
                        </C_Stack>
                      </td>

                      <td className={` p-0.5! text-start `}>{note.content}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        },
      },
    ])
      .showSummaryInTd({wrapperWidthPx: 500})
      .aggregateOnSingleTd()
      .buildFormGroup({groupName: `その他`}).plain,
  ])
    .customAttributes(({col}) => {
      return {
        ...col,
        form: {
          ...col.form,
          style: {width: 200},
        },
      }
    })
    .transposeColumns()
}
