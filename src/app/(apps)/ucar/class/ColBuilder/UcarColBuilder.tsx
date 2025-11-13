'use client'
import {columnGetterType} from '@cm/types/types'
import {colType} from '@cm/types/col-types'
import {Fields} from '@cm/class/Fields/Fields'

import {IsActiveDisplay} from '@app/(apps)/ucar/(lib)/isActiveDisplays'
import {upassCols} from '@app/(apps)/ucar/files/upass/upass-columns'
import {getCurrentStatuses} from '@app/(apps)/ucar/(parts)/statusAndAlerts'
import UcarAlertButtonSummay from '@app/(apps)/ucar/(pages)/paperProcess/Summay/UcarAlertButtonSummay'
import ProcessSummary from '@app/(apps)/ucar/(pages)/paperProcess/Summay/parts/ProcessSummary'
import {absSize, cl} from '@cm/lib/methods/common'
import {UcarProcessCl} from '../UcarProcessCl'
import {getPaperManagementCols} from '@app/(apps)/ucar/class/ColBuilder/lib/ucar/ucarCols-lib/lib/getPaperManagementCols/getPaperManagementCols'
import {DocumentChartBarIcon} from '@heroicons/react/20/solid'
import {T_LINK} from '@cm/components/styles/common-components/links'
import {HREF} from '@cm/lib/methods/urls'
import {TrActionIconClassName} from '@cm/components/DataLogic/TFs/MyTable/hooks/useMyTableLogic'
import useUcarDetailUpdatorGMF from '@app/(apps)/ucar/(parts)/templateHooks/useUcarDetailUpdatorGMF'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {PencilIcon, TrashIcon} from 'lucide-react'
import Coloring from '@cm/lib/methods/Coloring'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {UcarCL} from '../UcarCL'
import {UCAR_CODE} from '../UCAR_CODE'

export const UCAR_TABLE_ROW_HEIGHT = 120

export const ucarColBuilder = (props: columnGetterType) => {
  const {useGlobalProps} = props
  const GMF_UcrDetailUpdater = useUcarDetailUpdatorGMF()
  const {UseRecordsReturn, available98Numbers, next98NumberModel} = props.ColBuilderExtraProps ?? {}

  const mutateRecords = UseRecordsReturn?.mutateRecords

  const {query, session} = useGlobalProps

  // 基本情報
  const CAR_COLS = new Fields(
    upassCols
      .filter(d => d.showIn?.ucarMainTable)
      .map(d => {
        const label = d.showIn?.ucarMainTable?.label
        const format = (value, row) => {
          const inst = new UcarCL(row)
          value = inst.notation[d.en]
          return <div className={`max-w-[240px]  text-xs  truncate`}>{value}</div>
        }
        return {
          id: `UPASS.${d.en}`,
          label,
          format,
          form: {
            disabled: true,
            defaultValue: props => {
              return props?.formData?.[`UPASS`]?.[d.en]
            },
          },
          td: {style: {...{verticalAlign: 'middle'}}},
        }
      })
  )

  const SETTING_COLS = new Fields([
    {
      id: 'userId',
      label: '担当ス',
      format: (value, row) => row?.User && `${row?.User?.name} (${row?.Store?.name ?? '店舗未設定'})`,
      forSelect: {},
    },

    //
    {
      id: 'destinationStoreId',
      label: '配布店舗',
      format: (value, row) => row.DestinationStore?.name,
      form: {},
      forSelect: {
        config: {
          modelName: 'store',
          orderBy: [{code: 'asc'}],
        },
      },
    },
    {
      id: 'number98',
      label: '98番号',
      format: (value, row) => row.number98,
      form: {},
      forSelect: {
        config: {
          modelName: 'number98',
          select: {number: 'string', name: false},
          orderBy: [{number: 'asc'}],

          nameChanger: op => ({...op, id: op.number, name: op.number ? String(op.number) : ''}),
        },
      },
    },
    {
      id: 'daihatsuReserve',
      label: 'ダイハツ予約枠',
      td: {
        hidden: true,
        getRowColor: (value, row) => {
          return UCAR_CODE.PROCESSED_AS.byCode(row.processedAs)?.color
        },
      },
    },

    {
      id: 'destination',
      label: '仕分結果',
      form: {},
      format: (value, row) => {
        const codeItem = UCAR_CODE.SHIWAKE.byCode(row.destination)
        return (
          <Coloring mode="text" color={codeItem?.color}>
            {codeItem?.label}
          </Coloring>
        )
      },
      forSelect: {
        optionsOrOptionFetcher: UCAR_CODE.SHIWAKE.array,
      },
    },
    {
      id: 'tmpRentalStoreId',
      label: 'レンタル先',
      form: {},
      format: (value, row) => row.TmpRentalStore?.name,
      forSelect: {config: {modelName: 'store'}},
    },
  ])

  const PAPER_WORK_ALERT_COLS = new Fields([
    {
      id: `currentStatus`,
      label: `不備・アラート`,
      form: {hidden: true},
      format: (value, row) => {
        const UcarData = row
        const statuses = getCurrentStatuses({UcarData})
        return <UcarAlertButtonSummay {...{statuses, UcarData, mutateRecords}} />
      },
      td: {style: {...{minWidth: 80}}},
    },
  ])

  const base: colType[] = [
    //
    {
      id: 'actions',
      label: '',
      form: {hidden: true},
      td: {
        getRowColor: (value, row) => {
          const dataNotFound = !row.UPASS
          return dataNotFound ? '#f3f4f6' : ''
        },
      },
      format: (value, row) => {
        const href = HREF(`/ucar/qr`, {sateiID: 163012408000017}, useGlobalProps.query)
        return (
          <C_Stack className={`gap-4 `}>
            <T_LINK href={href} target={`_blank`} className={` text-inherit no-underline`}>
              <DocumentChartBarIcon className={cl(TrActionIconClassName, 'h-5 w-5 text-blue-500')} />
            </T_LINK>

            <PencilIcon
              onClick={() => GMF_UcrDetailUpdater.setGMF_OPEN({sateiID: row.sateiID})}
              className={cl(TrActionIconClassName, 'h-5 w-5 text-blue-500')}
            />
            <TrashIcon
              onClick={async () => {
                if (confirm('削除しますか？')) {
                  await doStandardPrisma('ucar', 'delete', {where: {id: row.id}})
                  useGlobalProps.router.refresh()
                }
              }}
              className={cl(TrActionIconClassName, 'h-5 w-5 text-red-500')}
            />
          </C_Stack>
        )
      },
    },

    ...SETTING_COLS.showSummaryInTd({wrapperWidthPx: 200}).buildFormGroup({groupName: `基本情報`}).plain,
    ...CAR_COLS.showSummaryInTd({wrapperWidthPx: 280}).buildFormGroup({groupName: `車両情報`}).plain,
    ...PAPER_WORK_ALERT_COLS.plain,
  ]

  // const {cols_tdShowOnly, cols_processViewer, cols_taxJob} = useUcarCols({
  //   mutateRecords,
  //   available98Numbers,
  //   next98NumberModel,
  //   useGlobalProps,
  //   query,
  // })

  if (IsActiveDisplay(query, `下取書類`)) {
    const cols_paperManagement = getPaperManagementCols()
    base.push(...cols_paperManagement.acceptProcessCols.plain)
    base.push(...cols_paperManagement.processeFinishedCols.plain)
  }

  if (IsActiveDisplay(query, `商品化`)) {
    const mainProcessMasters = UcarProcessCl.CODE.array?.filter(process => process.list.includes(`main`))
    const subProcessMasters = UcarProcessCl.CODE.array?.filter(process => process.list.includes(`sub`))
    const PROCESS_MASTER_COLS = new Fields([
      {
        id: 'AllProcesses',
        label: '加修工程',
        type: 'text',
        td: {style: {...absSize({width: 350})}},
        format: (value, row, col) => {
          const className = ``
          return <ProcessSummary {...{className, ucar: row, mainProcessMasters, subProcessMasters, query}} />
        },
      },
    ])
    base.push(...PROCESS_MASTER_COLS.plain)
  }

  if (IsActiveDisplay(query, `自動車税`)) {
    // base.push(...cols_taxJob.cols1)
  }

  return new Fields(base).transposeColumns()
}
