'use client'

import {columnGetterType} from '@cm/types/types'

import {Fields} from '@cm/class/Fields/Fields'
import {Shinren} from '@app/(apps)/shinren/class/Shinren'
import {T_LINK} from '@cm/components/styles/common-components/links'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn, IconBtnForSelect} from '@cm/components/styles/common-components/IconBtn'
IconBtn
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {HREF} from '@cm/lib/methods/urls'
import {ChildrenCountFormat} from '@cm/class/Fields/lib/defaultFormat'
import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'

import {InformationCircleIcon} from '@heroicons/react/20/solid'
import {Fragment} from 'react'
import ShadPopover from '@cm/shadcn/ui/Organisms/ShadPopover'
import useWindowSize from '@cm/hooks/useWindowSize'

import {colType} from '@cm/types/col-types'
const formDisabled = props => props.record.code

const Group = (array, {wrapperWidthPx = 160, labelWidthPx = 40} = {}) => {
  return new Fields(array).showSummaryInTd({wrapperWidthPx, labelWidthPx}).plain
}

export const rentaCustomer = (props: columnGetterType) => {
  const {useGlobalProps} = props
  const {width} = useWindowSize()
  const {query} = useGlobalProps
  const col1: colType[] =
    // .aggregateOnSingleTd()
    new Fields([
      ...Group([
        {id: 'code', label: 'コード', type: 'string', form: {disabled: formDisabled}, td: {}, search: {}},
        {
          id: 'name',
          label: `名称`,
          form: {disabled: formDisabled},
          search: {},
        },
        {id: 'nameTop', label: '上段', form: {disabled: formDisabled}, search: {}},
      ]),

      ...Group([
        {id: 'nameBottom', label: '下段', form: {disabled: formDisabled}, search: {}},
        {
          id: 'address1',
          label: '住所1',
          form: {disabled: formDisabled},
          format: (value, row) => <small className={`text-xs leading-[10px]`}>{row.address1}</small>,
        },
        {
          id: 'address2',
          label: '住所2',
          form: {disabled: formDisabled},
          format: (value, row) => <small className={`text-xs leading-[10px]`}>{row.address2}</small>,
        },
      ]),
    ]).plain

  const col2 = new Fields([
    ...Group([
      {
        id: 'RentaDailyReport.count',
        label: '直近',
        form: {hidden: true},
        format: (value, row) => {
          return <RentaDailyReportCount {...{row, query}} />
        },
      },
      {...Shinren.col?.userIdColumn, format: (value, row) => row.User?.name},
      {
        id: `readOnlyCustomerInfo`,
        label: `区分`,
        form: {hidden: true},
        format: (value, row, col) => <ReadOnlyCustomerInfo {...{row, query}} />,
      },
    ]),

    ...Group([
      {
        id: 'type',
        label: '新管区分',
        form: {},
        search: {},
        forSelect: {
          optionsOrOptionFetcher: Shinren.constants.visitTypes,
        },
      },
      {
        id: 'result',
        label: '結果',
        form: {},
        forSelect: {optionsOrOptionFetcher: Shinren.constants.resultTypes},
        search: {},
      },
      {id: 'phone', label: '電話'},
      {id: 'fax', label: 'FAX'},
    ]),
  ]).buildFormGroup({groupName: `区分等`}).plain

  const col3: colType[] = new Fields([
    ...Group([
      {id: 'repPos', label: '代表者役職'},
      {id: 'repName', label: '代表者氏名'},
      {id: 'pic', label: '責任者', form: {}},
    ]),
  ]).buildFormGroup({groupName: `付加情報①`}).plain

  const col4 = new Fields([
    ...Group([
      {id: 'carCount', label: '保有台数', form: {}, type: 'number'},
      {id: 'leaseCompanyName', label: 'リース会社', form: {}},
      {id: 'maintenanceDestination', label: '仕入/入庫先', form: {}},
      {
        id: 'remarks',
        label: '備考',
        form: {},
        type: `textarea`,
        format: (value, row) => {
          return (
            row[`remarks`] && (
              <ShadPopover
                {...{
                  PopoverTrigger: (
                    <small className={` flex flex-nowrap`}>
                      <span>備考あり</span>
                      <InformationCircleIcon className={`h-4 w-4`} />,
                    </small>
                  ),
                }}
              >
                <MarkDownDisplay>{row.remarks}</MarkDownDisplay>
              </ShadPopover>
            )
          )
        },
      },
    ]),
  ]).buildFormGroup({groupName: `付加情報②`}).plain

  const tdShowOnly = new Fields([
    ...Group(
      new Fields([
        {id: 'RentaDailyReport.length', label: '日報'},
        {id: 'AlternateInfo.length', label: '代替'},
        {id: 'InsuranceInfo.length', label: '保険'},
        {id: 'ExtraInfo.length', label: '記録'},
      ]).customAttributes(() => ({
        form: {hidden: true},
        format: ChildrenCountFormat,
      })).plain
    ),

    // ...Group(
    //   new Fields([
    //     {id: 'InsuranceInfo.length', label: '保険'},
    //     {id: 'ExtraInfo.length', label: '記録'},
    //   ]).customAttributes(() => ({
    //     form: {hidden: true},
    //     format: ChildrenCountFormat,
    //   })).plain
    // ),
  ]).plain

  const data = new Fields([...col1, ...col2, ...col3, ...col4, ...tdShowOnly])
    .customAttributes(({col}) => {
      const hiddenTargets = [
        [
          `readOnlyCustomerInfo`,
          'code',
          'userId',
          'type',
          'phone',
          'fax',
          'address1',
          'address2',
          'repPos',
          'repName',
          'pic',
          'carCount',
          'leaseCompanyName',
          'result',
          'AlternateInfo',
          'InsuranceInfo',
          'ExtraInfo',
        ],
      ]

      const formAvailableCols = [
        'name',
        'nameTop',
        'nameBottom',
        'address1',
        'address2',
        'repPos',
        'repName',
        'pic',
        'leaseCompanyName',
      ]

      const sort = formAvailableCols.includes(col.id) ? {} : {}

      const hidden = width < 600 && hiddenTargets.some(target => target.includes(col.id))

      const form = {...col?.form}
      const result = {...col, td: {hidden: hidden, ...col.td}, form, sort}

      return result
    })
    .transposeColumns()

  return data
}

// const
const ReadOnlyCustomerInfo = ({row, query}) => {
  const {mergeCandidatesIds} = row
  const isMergeAvailable = mergeCandidatesIds?.length > 0
  const href = HREF(`/shinren/admin/config/merge-customer`, {id: row.id}, query)

  return (
    <R_Stack className={` w-full justify-between`}>
      <div className={``}>
        {isMergeAvailable ? (
          <T_LINK href={href} simple>
            <IconBtnForSelect color={`red`}>NEO連携候補あり</IconBtnForSelect>
          </T_LINK>
        ) : (
          <IconBtnForSelect color="gray">アプリ発行</IconBtnForSelect>
        )}
      </div>
    </R_Stack>
  )
}

const RentaDailyReportCount = ({row, query}) => {
  const latestThreeDailyReport = (row?.RentaDailyReport ?? [])?.sort((a, b) => b.date - a.date).slice(0, 3)
  return (
    <R_Stack className={`gap-1`}>
      {latestThreeDailyReport.map((dailyReport, idx) => {
        const date = formatDate(new Date(dailyReport.date), 'M/D')
        const href = HREF(`/shinren/admin/config/rentaDailyReport/${dailyReport.id}`, {from: query.from}, query)

        return (
          <Fragment key={idx}>
            <R_Stack className={` gap-0.5`}>
              <T_LINK href={href}>
                <div className={`w-full text-center text-sm`}>{date}</div>
              </T_LINK>
              {idx !== latestThreeDailyReport.length - 1 && <span>{`,`}</span>}
            </R_Stack>
          </Fragment>
        )
      })}
    </R_Stack>
  )
}
