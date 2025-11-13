'use client'
const isTest = true

import React from 'react'

import {Counter} from '@cm/components/styles/common-components/Table'
import {storeMonthsWhereListType} from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/constants'

import {HREF} from '@cm/lib/methods/urls'

import {R_Stack} from '@cm/components/styles/common-components/common-components'

import {grayText} from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/NextCreateCellValueComponent'
import {T_LINK} from '@cm/components/styles/common-components/links'

export const TableInCell = ({myChildren, item, LinkCounterCommonProps}) => {
  const total = item
  const confirmed = total.children?.[0]

  const completed = confirmed.children?.[0]

  const applied = confirmed?.children?.[1]

  const applied_FR = applied?.children?.[0]
  const applied_NO_FR = applied?.children?.[1]

  const predicted_Sum = total.children?.[1]
  const predicted_FR = predicted_Sum?.children?.[0]
  const predicted_NO_FR = predicted_Sum?.children?.[1]

  const fontSizes = {
    total: 20,
    confirmed: 28,
    completed: 28,
    applied: 28,
  }

  return (
    <tbody className={`text-sm [&_td]:!p-1.5`}>
      <tr>
        <td colSpan={5}>
          <R_Stack className={` justify-around  gap-0`}>
            <small>計:</small>
            <span className={`  font-bold`} style={{fontSize: fontSizes.total}}>
              <LinkCounter
                {...{
                  item: total,
                  dataLabel: `total`,
                  LinkCounterCommonProps,
                }}
              />
            </span>
          </R_Stack>
        </td>
      </tr>
      <tr>
        <td colSpan={3} className={` font-bold text-blue-800`} style={{fontSize: fontSizes.confirmed}}>
          <LinkCounter
            {...{
              item: confirmed,
              dataLabel: `confirmed`,
              LinkCounterCommonProps,
            }}
          />
        </td>
        <td colSpan={2} rowSpan={2} className={`text-error-main text-lg`}>
          <LinkCounter
            {...{
              item: predicted_Sum,
              dataLabel: `predicted_Sum`,
              LinkCounterCommonProps,
            }}
          />
        </td>
      </tr>
      <tr>
        <td rowSpan={2} className={`text-lg font-bold text-green-700 `} style={{fontSize: fontSizes.completed}}>
          <LinkCounter
            {...{
              item: completed,
              dataLabel: `completed`,
              LinkCounterCommonProps,
            }}
          />
        </td>
        <td colSpan={2} className={`   `} style={{fontSize: fontSizes.applied}}>
          <LinkCounter
            {...{
              item: applied,
              dataLabel: `torokuApplicationCompleted_Sum`,
              LinkCounterCommonProps,
            }}
          />
        </td>
      </tr>

      <tr className={`${grayText}`}>
        <td className={`border-b`}>
          <LinkCounter
            {...{
              item: applied_FR,
              dataLabel: `torokuApplicationCompleted_FR`,
              LinkCounterCommonProps,
            }}
          />
        </td>
        <td className={`border-r `}>
          <LinkCounter
            {...{
              item: applied_NO_FR,
              dataLabel: `torokuApplicationCompleted_NO_FR`,
              LinkCounterCommonProps,
            }}
          />
        </td>
        <td className={``}>
          <LinkCounter
            {...{
              item: predicted_FR,
              dataLabel: `predicted_FR`,
              LinkCounterCommonProps,
            }}
          />
        </td>
        <td className={``}>
          <LinkCounter
            {...{
              item: predicted_NO_FR,
              dataLabel: `predicted_NO_FR`,
              LinkCounterCommonProps,
            }}
          />
        </td>
      </tr>
    </tbody>
  )
}

export const LinkCounter = (props: {item: storeMonthsWhereListType; dataLabel; LinkCounterCommonProps}) => {
  const {
    dataLabel,
    LinkCounterCommonProps: {theFourSourceLabel, query},
  } = props

  const item = {...props.item}

  const {storeLabel, monthLabel} = item

  const mikomiSQueryStr = [storeLabel, monthLabel, theFourSourceLabel, dataLabel, item.jpLabel, storeLabel].join(`__`)
  const href = HREF(`/newCar/newCar`, {mikomiS: mikomiSQueryStr, showNosya: true}, query, {
    forceDelete: {
      g_storeId: undefined,
      g_selectedUserId: undefined,
    },
  })

  const Btn = () => {
    return (
      <T_LINK href={href} className={`onHover  text-inherit no-underline`}>
        <Counter>{item.count ?? 0}</Counter>
      </T_LINK>
    )
  }
  return <Btn />
}
