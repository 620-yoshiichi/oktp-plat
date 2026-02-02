'use client'
import { columnGetterType } from '@cm/types/types'
import { colType } from '@cm/types/col-types'
import { Fields } from '@cm/class/Fields/Fields'

import { IsActiveDisplay } from '@app/(apps)/ucar/(lib)/isActiveDisplays'
import { upassCols } from '@app/(apps)/ucar/files/upass/upass-columns'

import ProcessSummary from '@app/(apps)/ucar/(pages)/paperProcess/Summay/parts/ProcessSummary'
import { absSize, cl, isDev } from '@cm/lib/methods/common'
import { UcarProcessCl } from '../UcarProcessCl'
import { getPaperManagementCols } from '@app/(apps)/ucar/class/ColBuilder/lib/ucar/ucarCols-lib/lib/getPaperManagementCols/getPaperManagementCols'
import { DocumentIcon, InformationCircleIcon } from '@heroicons/react/20/solid'
import { T_LINK } from '@cm/components/styles/common-components/links'
import { HREF } from '@cm/lib/methods/urls'
import { TrActionIconClassName } from '@cm/components/DataLogic/TFs/MyTable/hooks/useMyTableLogic'
import useUcarDetailUpdatorGMF from '@app/(apps)/ucar/(parts)/templateHooks/useUcarDetailUpdatorGMF'
import useUcarRequestGMF from '@app/(apps)/ucar/(parts)/templateHooks/useUcarRequestGMF'
import { Absolute, C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { PencilIcon, TrashIcon } from 'lucide-react'

import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { updateNumber98IssueHistory } from '@app/(apps)/ucar/(lib)/num98/updateNumber98IssueHistory'
import { UcarCL, ucarData } from '../UcarCL'
import { UCAR_CODE } from '../UCAR_CODE'
import { __shared_get_shiwakeKekkeCol } from '@app/(apps)/ucar/class/ColBuilder/getter/shared_shiwakeKekkeCol'
import { getTaxJobCols } from '@app/(apps)/ucar/class/ColBuilder/lib/ucar/ucarCols-lib/lib/getTaxJobCols'
import { getDMMFModel } from '@cm/lib/methods/prisma-schema'
import { IconBtn } from '@cm/components/styles/common-components/IconBtn'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import { defaultRegister } from '@cm/class/builders/ColBuilderVariables'
import { GoogleSheet_Append } from '@app/api/google/actions/sheetAPI'
import { getAvailable98Numbers } from '../../(lib)/num98/getAvailable98Numbers'

export const UCAR_TABLE_ROW_HEIGHT = 120

export const ucarColBuilder = (props: columnGetterType) => {
  const { useGlobalProps } = props
  const { isChukoshaGroup, isStoreManager } = useGlobalProps.accessScopes().getUcarProps()
  const GMF_UcrDetailUpdater = useUcarDetailUpdatorGMF()
  const GMF_UcarRequest = useUcarRequestGMF()
  const { UseRecordsReturn, getAvailable98NumbersReturn, currentNumber98 } = props.ColBuilderExtraProps ?? {}

  // const mutateRecords = UseRecordsReturn?.mutateRecords

  const getModifiedCols = () => {
    const ucarSchema = getDMMFModel('Ucar' as any)?.fields?.filter(field => field.name.startsWith('modified_'))

    return (
      ucarSchema?.map(item => {
        const key = item.name.replace('modified_', '')
        const upassColName = upassCols.find(col => col.en === key)

        return {
          id: item.name,
          label: `修正_${upassColName?.jp}`,
          form: {},
          td: { hidden: true },
          // format: (value, row) => {
          //   return row[`modified_${item.name}`]
          // },
        }
      }) ?? []
    )
  }

  const { query, session } = useGlobalProps



  const SETTING_COLS = new Fields([
    {
      id: 'userId',
      label: '担当者',
      format: (value, row) => row?.User && `${row?.User?.name} (${row?.Store?.name ?? '店舗未設定'})`,
      form: {
        ...defaultRegister,
        disabled: true,
        defaultValue: session?.id,
      },
      forSelect: {},
    },

    //

    {
      id: 'number98',
      label: '98番号',
      format: (value, row) => row.number98,
      form: {},

      td: {
        editable: {
          upsertController: {
            validateUpdate: async ({ latestFormData, formData }) => {
              const prevNumber98 = formData?.number98
              const newNumber98 = latestFormData?.number98
              const numberChanged = prevNumber98 !== newNumber98

              if (numberChanged) {
                const confirmed = confirm('98番号を更新します。よろしいですか？')
                if (!confirmed) {
                  return { success: false, message: '98番号の更新をキャンセルしました' }
                }
              }

              const { available98Numbers } = await getAvailable98Numbers({ take: 50 })
              const inAvailable = available98Numbers.some(d => d.number === newNumber98)
              if (!inAvailable) {
                return { success: false, message: '98番号が利用可能な範囲内にありません' }
              }


              return { success: true, message: '' }
            },
            finalizeUpdate: async ({ res, formData }) => {
              if (res.success) {
                await updateNumber98IssueHistory({
                  prevNumber98: formData?.number98,
                  newNumber98: res.result?.number98,
                })
              }
            },
          },
        },
      },
      forSelect: {
        config: {
          select: {
            id: 'number',
            number: 'text',
            sortNumber: 'number',
          },
        },
        optionsOrOptionFetcher: async ({ searchInput }) => {
          const getAvailable98NumbersReturn = await getAvailable98Numbers({
            additionalWhere: {
              number: {
                contains: searchInput ?? '',
              },
            },
          })
          return {
            optionObjArr: [
              ...getAvailable98NumbersReturn?.available98Numbers.map(d => {
                return {
                  value: d.number,
                  label: String(d.sortNumber) ?? '',
                }
              }),
            ],
          }
        },

      },
    },
    {
      id: 'NO_SIRETYUM',
      label: '仕入時注文番号',
      type: 'text',
      form: {
        register: {
          validate: (value, row) => {
            if (!value) {
              return undefined
            }
            value = String(value ?? '')
            // 許容パターン: 2桁数字, 半角スペース, 5桁数字
            const reg = /^\d{2}\s\d{5}$/
            if (!reg.test(value)) {
              return '「2桁数字」「半角スペース」「5桁数字」で入力してください。'
            }
          },
        },
      },
    },
    {
      id: 'DD_SIIRE',
      label: '仕入日',
      type: 'date',
      form: {},
    },
  ])

  const SHIIRE_G_SETTING_COLS = new Fields([
    {
      id: 'daihatsuReserve',
      label: '予約枠',
      td: { hidden: true },
    },
    __shared_get_shiwakeKekkeCol(),
    {
      id: 'destinationStoreId',
      label: '配布店舗',

      format: (value, row) => {
        return row.DestinationStore?.name
      },
      form: {},
      forSelect: {
        config: {
          modelName: 'store',
          orderBy: [{ code: 'asc' }],
        },
      },
    },
  ])

  // 基本情報
  const CAR_COLS: colType[] = [
    // ...upassCols
    //   .filter(d => d.showIn?.ucarMainTable)
    //   .map(d => {
    //     const label = d.showIn?.ucarMainTable?.label

    //     const format = (value, row) => {
    //       const inst = new UcarCL(row)
    //       value = inst.notation[d.en]
    //       return <div className={`max-w-[240px]  text-xs  truncate`}>{value}</div>
    //     }

    //     const col = {
    //       id: `readOnly_UPASS.${d.en}`,
    //       label,
    //       format,
    //       form: {
    //         hidden: true,
    //         defaultValue: props => {
    //           return props?.formData?.[`UPASS`]?.[d.en]
    //         },
    //       },
    //     }

    //     return col
    //   }),



    {
      id: 'modelName',
      label: '車種',
      form: { hidden: true },
      format: (value, row) => {
        const inst = new UcarCL(row as unknown as ucarData)

        console.log(inst.notation.nenshiki)  //logs
        return [inst.notation.brandName, inst.notation.modelName].join(' ')
      },
    },
    {
      id: 'plate',
      label: 'プレート',
      form: { hidden: true },

      format: (value, row) => {
        return new UcarCL(row as unknown as ucarData).notation.plate
      },
    },
    {
      id: 'chassisNumber',
      label: '車体番号',
      form: { hidden: true },
      format: (value, row) => {
        return new UcarCL(row as unknown as ucarData).notation.chassisNumber
      },
    },

    {
      id: 'grade',
      label: 'グレード',
      form: { hidden: true },
      format: (value, row) => {
        return new UcarCL(row as unknown as ucarData).notation.grade
      },
    },
    {
      id: 'type',
      label: '型式',
      form: { hidden: true },
      format: (value, row) => {
        return new UcarCL(row as unknown as ucarData).notation.type
      },
    },

    {
      id: 'createdAt',
      label: '作成日',
      type: 'date',
      form: { hidden: true },
      td: { style: { ...{ verticalAlign: 'middle' } } },
    },

    // {
    //   id: 'tmpRentalStoreId',
    //   label: 'レンタル先',
    //   form: {},
    //   format: (value, row) => row.TmpRentalStore?.name,
    //   forSelect: {config: {modelName: 'store'}},
    // },
  ]



  const base: colType[] = [
    //

    {
      id: 'actions',
      label: '',
      form: { hidden: true },
      td: {
        getRowColor: (value, row) => {
          if (row.daihatsuReserve) {
            return '#46a73b20'
          } else {
            return undefined
          }
          // if (!row.UPASS) {
          //   return UCAR_CODE.Alert.byCode('UP_ASS_NOT_FOUND')?.color
          // } else if (!row.OldCars_Base?.APPINDEX) {
          //   return UCAR_CODE.Alert.byCode('APPINDEX_NOT_FOUND')?.color
          // }
        },
      },
      format: (value, row) => {
        const href = HREF(`/ucar/qr`, { sateiID: row.sateiID }, useGlobalProps.query)

        const alertList = UCAR_CODE.Alert.array.filter(item => item.checkAlert?.(row as unknown as ucarData))

        return (
          <C_Stack className={`gap-4 `}>
            <T_LINK href={href} target={`_blank`} className={` text-inherit no-underline relative`}>
              <DocumentIcon className={cl(TrActionIconClassName, 'h-6 w-6 text-yellow-500')} />
              <Absolute className={`text-[10px] w-[20px] left-[14px]! font-bold text-black`}>QR</Absolute>
            </T_LINK>

            <PencilIcon
              onClick={() =>
                GMF_UcrDetailUpdater.setGMF_OPEN({
                  sateiID: row.sateiID,
                  getAvailable98NumbersReturn,
                  useRecordsReturn: UseRecordsReturn,
                })
              }
              className={cl(TrActionIconClassName, 'h-5 w-5 text-blue-500')}
            />
            {(isChukoshaGroup || isDev) && (
              <TrashIcon
                onClick={async () => {
                  if (confirm('不要なデータとして非表示にしますか？')) {
                    useGlobalProps.toggleLoad(async () => {
                      const res = await GoogleSheet_Append({
                        spreadsheetId:
                          'https://docs.google.com/spreadsheets/d/1a_4Rh4lbqimejsClcm2keXiqzWUe5qFAiX5LfUlW6lI/edit?gid=363856092#gid=363856092',
                        range: '不要査定ID登録!A1:A',
                        values: [[row.sateiID]] as string[][],
                      })

                      await doStandardPrisma('ucar', 'update', { where: { id: row.id }, data: { active: false } })
                    })
                  }
                }}
                className={cl(TrActionIconClassName, 'h-5 w-5 text-red-500')}
              />
            )}

            {/* 申請ボタン（店長・副店長のみ） */}
            {/* {isStoreManager && (
              <ClipboardListIcon
                onClick={() =>
                  GMF_UcarRequest.setGMF_OPEN({
                    UcarData: row as unknown as ucarData,
                    session: useGlobalProps.session,
                    UseRecordsReturn,
                  })
                }
                className={cl(TrActionIconClassName, 'h-5 w-5 text-purple-500')}

              />
            )} */}

            {alertList.length > 0 && (
              <ShadModal
                Trigger={
                  <div className={`bg-yellow-300 p-1 rounded-full`}>
                    <InformationCircleIcon className={`h-5 w-5 text-red-600 animate-pulse`} />
                  </div>
                }
              >
                <C_Stack className={`gap-4 text-xs`}>
                  {alertList.map(item => {
                    const color = item.color

                    const Trigger = item.Trigger

                    return (
                      <R_Stack key={item.code}>
                        <div className={`max-w-[320px]`}>
                          <IconBtn color={color} key={item.code}>
                            {item.label}
                          </IconBtn>
                        </div>

                        {Trigger && <Trigger {...{ row: row as unknown as ucarData }} />}
                      </R_Stack>
                    )
                  })}
                </C_Stack>
              </ShadModal>
            )}
          </C_Stack>
        )
      },
    },

    ...new Fields([
      {
        id: 'sateiID',
        label: '査定番号',
        type: 'text',
        form: {
          disabled: (props: { record: ucarData }): boolean => {
            const inst = new UcarCL(props?.record)
            return inst.notation.sateiID ? true : false
          },
          register: { required: '必須' },
        },
        format: (value, row) => {
          if (row.daihatsuReserve) {
            return <div className={`max-w-[240px]  text-xs  truncate`}>{row.daihatsuReserve} (予約枠)</div>
          }
          return row.sateiID
        },
      },
      ...new Fields(CAR_COLS).plain,
    ])
      .showSummaryInTd({ wrapperWidthPx: 240 })
      .buildFormGroup({ groupName: `車両情報` }).plain,

    ...new Fields([
      ...SETTING_COLS.buildFormGroup({ groupName: `基本情報` }).plain,
      ...SHIIRE_G_SETTING_COLS.buildFormGroup({ groupName: `仕入G設定情報` }).plain,
    ]).showSummaryInTd({ wrapperWidthPx: 200, editable: isChukoshaGroup }).plain,



    // ...CAR_MODIFIED_COLS.buildFormGroup({groupName: `修正情報`}).plain,
  ]

  // const {cols_tdShowOnly, cols_processViewer, cols_taxJob} = useUcarCols({
  //   mutateRecords,
  //   available98Numbers,
  //   next98NumberModel,
  //   useGlobalProps,
  //   query,
  // })

  if (IsActiveDisplay(query, `自動車税`)) {
    const taxCols = getTaxJobCols({ isChukoshaGroup })

    base.push(...taxCols.cols1)
    base.push(...taxCols.cols2)
    base.push(...taxCols.cols3)
    base.push(...taxCols.cols4)
  }

  if (IsActiveDisplay(query, `下取書類`)) {
    const cols_paperManagement = getPaperManagementCols({
      UseRecordsReturn,
      isChukoshaGroup,
    })
    base.push(...cols_paperManagement.acceptProcessCols.plain)
    base.push(...cols_paperManagement.processeFinishedCols.plain)
  }

  if (IsActiveDisplay(query, `商品化`)) {
    const mainProcessMasters = UcarProcessCl.CODE.array?.filter(process => process.list?.includes(`main`)) ?? []
    const subProcessMasters = UcarProcessCl.CODE.array?.filter(process => process.list?.includes(`sub`)) ?? []
    const PROCESS_MASTER_COLS = new Fields([
      {
        id: 'AllProcesses',
        label: '加修工程',
        type: 'text',
        td: { style: { ...absSize({ width: 350 }) } },
        format: (value, row, col) => {
          const className = ``
          return <ProcessSummary {...{ className, ucar: row, mainProcessMasters, subProcessMasters, query }} />
        },
      },
    ])
    base.push(...PROCESS_MASTER_COLS.plain)
  }

  return new Fields(base).transposeColumns()
}
