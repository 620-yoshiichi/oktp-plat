'use client'
const isTest = true

import React from 'react'

import {TableWrapper} from '@cm/components/styles/common-components/Table'
import {storeMonthsWhereListType} from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/constants'

import {R_Stack} from '@cm/components/styles/common-components/common-components'

import {cl} from '@cm/lib/methods/common'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {TableInCell} from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/TableInCell'

export const grayText = `opacity-40 text-[12px]`

export const NextCreateCellValueComponent = (props: {item: storeMonthsWhereListType; query}) => {
  const {item, query} = props

  const {count, children: myChildren, theFiveMikomiLabel, theFourSourceLabel} = item ?? {}

  const TableContent = () => {
    const LinkCounterCommonProps = {theFourSourceLabel, query}

    if (theFiveMikomiLabel === `total`) {
      return (
        <>
          <TableInCell {...{item, LinkCounterCommonProps, myChildren}} />
        </>
      )
    }
    return null
  }

  return (
    <div className={`mx-auto  w-full !text-center [&_td]:!px-0.5 `}>
      <table>
        <TableContent />
      </table>
    </div>
  )
}

export const Guidance = () => {
  const {router, pathname} = useGlobal()

  return (
    <div className={`w-fit`}>
      <R_Stack>
        <section>
          <div className={`mx-auto w-fit `}>
            <p>月毎の枠の内訳</p>
            <TableWrapper className={`mx-auto  w-fit  text-center !text-[10px]  `}>
              <table className={cl(`border-collapse border-2 border-black [&_td]:border`)}>
                <tbody>
                  <tr>
                    <td className={` font-bold`} colSpan={5}>
                      見込み計(①+②)
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={3} className={`font-bold text-blue-800`}>
                      確定(①)
                    </td>

                    <td colSpan={2} className={`text-error-main font-bold`} rowSpan={2}>
                      見込(②)
                    </td>
                    {/* <td>見込み（未出荷）</td> */}
                  </tr>
                  <tr>
                    <td rowSpan={2} className={`text-green-700`}>
                      登録済
                    </td>
                    <td colSpan={2}>登録申請</td>
                  </tr>
                  <tr>
                    <td>振当</td>
                    <td>未振当</td>
                    <td>振当</td>
                    <td>未振当</td>
                  </tr>
                </tbody>
              </table>
            </TableWrapper>
          </div>
        </section>
        <section>
          <small>
            <div className={`text-error-main`}>
              数値はアプリ上の速報値です。(※軽含む・法人等で入金をもって登録読みとするものは含まず)
            </div>
            <div className={`text-error-main`}>登録の確定実績はai21をご参照ください</div>
            <div>「登録済」:ai21登録実績を反映。※軽自動車含み</div>
            <div>「確定」: すでに登録済みのものと、 本アプリで登録申請かつ承認済みの件数の合計</div>
            <div>「見込」:本アプリでの見込み入力件数</div>
            <div>
              *「登録済」:ai21登録日の有無を元に計算。法人等、「入金」によって登録カウントされるデータは集計に含まれません
            </div>
          </small>
        </section>
      </R_Stack>
    </div>
  )
}
