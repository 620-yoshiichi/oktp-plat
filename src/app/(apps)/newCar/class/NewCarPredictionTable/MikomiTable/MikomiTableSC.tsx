'use client'
import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import React from 'react'

import {stylesInColumns} from '@cm/components/styles/common-components/CsvTable/CsvTable'

import {
  fiveMikomiFieldList,
  FourDataSourceList,
  storeMonthsWhereListType,
  zones,
} from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/constants'

import {
  Guidance,
  NextCreateCellValueComponent,
} from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/NextCreateCellValueComponent'

import {PaperLarge} from '@cm/components/styles/common-components/paper'

import MikomiTableCC from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/MikomiTableCC'
import useSWR from 'swr'
import {serverInitMikomiTableData} from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/serverInitMikomiTableData'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {arr__splitIntoGroups} from '@cm/class/ArrHandler/array-utils/basic-operations'

export default function MikomiTableSC({query}) {
  console.time('MikomiTableSC')

  const thisMonth = toUtc(query.month)

  const additionalMonthColCount = 1

  const from = toUtc(query.month)
  const to = Days.month.getNextMonthLastDate(from, additionalMonthColCount)

  const months = Days.month.getMonthsBetweenDates(thisMonth, to)

  const lasstMonth = months[months.length - 1]

  const FirstDateInAfterPeriod = lasstMonth

  const monthsQueryList = [
    ...Days.month.getMonthsBetweenDates(thisMonth, to).map(month => {
      const monthWhere = {gte: month, lt: Days.month.getNextMonthLastDate(month, 1)}

      return {month, monthLabel: formatDate(month, 'YYYY年M月'), monthWhere}
    }),
    {
      monthLabel: `${formatDate(FirstDateInAfterPeriod, 'YYYY年MM月')}以降`,
      monthWhere: {gte: FirstDateInAfterPeriod},
    },
  ]

  const key = JSON.stringify({monthsQueryList})
  const {data} = useSWR(key, async data => {
    const {dataList, storeQueryList} = await serverInitMikomiTableData({monthsQueryList, thisMonth})

    return {dataList, storeQueryList}
  })

  if (!data) return <div>Loading...</div>

  const {dataList, storeQueryList} = data

  // =============店舗別に表を作る=============
  const GetCsvTableInStoreGroup = ({targetStoreLabels}) => {
    const stylesInColumns: stylesInColumns = {}

    const allColumns = FourDataSourceList.map(four => {
      return monthsQueryList
        .map(obj => {
          const {monthLabel} = obj
          return fiveMikomiFieldList
            .filter(d => d.show)
            .map(five => {
              return {
                fourLabel: four.label,
                fiveLabel: five.jpLabel,
                monthLabel,
              }
            })
            .flat()
        })
        .flat()
    }).flat()

    const firstTrCategories = Object.keys(
      allColumns.reduce((acc, cur) => {
        if (acc[cur.fourLabel]) {
          acc[cur.fourLabel].push(cur)
        } else {
          acc[cur.fourLabel] = [cur]
        }
        return acc
      }, {})
    )

    const firstTrColSpan = allColumns.length / firstTrCategories.length
    const secondTrColSpan = firstTrColSpan / 2

    // const headerRecords = [
    //   {
    //     csvTableRow: [
    //       //
    //       {cellValue: `拠点`, rowSpan: 3},
    //       ...allColumns.map((d, i) => {
    //         const prev = allColumns[i - 1]
    //         if (prev?.fourLabel === d.fourLabel) {
    //           return {cellValue: '', colSpan: 0}
    //         }

    //         return {cellValue: d.fourLabel, colSpan: firstTrColSpan}
    //       }),
    //     ],
    //   },
    //   {
    //     csvTableRow: [
    //       // `拠点`,
    //       ...allColumns.map((d, i) => {
    //         if (allColumns[i - 1]?.monthLabel === d.monthLabel) {
    //           return {cellValue: '', colSpan: 0}
    //         }
    //         const thisYear = new Date().getFullYear()
    //         const display = String(d.monthLabel).replace(`${String(thisYear)}年`, '')
    //         return {cellValue: display, colSpan: secondTrColSpan}
    //       }),
    //     ],
    //   },
    //   {
    //     csvTableRow: [
    //       // `拠点`,
    //       ...allColumns.map((d, i) => {
    //         if (d.fiveLabel === `確定`) {
    //           return {cellValue: d.fiveLabel, colSpan: 2}
    //         } else {
    //           return {cellValue: '', colSpan: 0}
    //         }
    //       }),
    //     ],
    //   },
    // ]

    const records = storeQueryList
      .filter(sQuery => {
        return targetStoreLabels.includes(sQuery.storeLabel)
      })
      .map((storeQuery, storeIdx) => {
        const DataSourceArr: any = []

        FourDataSourceList.forEach((source, sourceIndex) => {
          monthsQueryList.forEach((obj, monthIndex) => {
            const {monthLabel} = obj

            fiveMikomiFieldList
              .filter(d => d.show)
              .forEach((mikomiField, mikomiFieldIndex) => {
                const theDataSourceObj = dataList.find(data => {
                  const {monthLabel: monthInData, theFourSourceLabel, theFiveMikomiLabel, jpLabel, storeLabel} = data

                  return (
                    storeLabel === storeQuery.storeLabel &&
                    monthInData === monthLabel &&
                    source.label === theFourSourceLabel &&
                    mikomiField.label === theFiveMikomiLabel
                  )
                }) as storeMonthsWhereListType

                DataSourceArr.push({
                  label: theDataSourceObj.jpLabel,
                  cellValue: (
                    <div className={`h-full `}>
                      <NextCreateCellValueComponent {...{item: theDataSourceObj, query}} />
                    </div>
                  ),
                })
              })
          })
        })

        const result = {
          csvTableRow: [
            {
              cellValue: (
                <div className={` px-1 text-sm`}>
                  <div>{storeQuery.storeLabel}</div>
                </div>
              ),
            },
            ...DataSourceArr,
          ],
        }

        return result
      })

    return <MikomiTableCC {...{records, stylesInColumns}} />
  }

  const wrapperWidth = 1300
  const rightWidth = 280
  const leftWidth = wrapperWidth - rightWidth - 50
  console.time('MikomiTableSC')

  return (
    <div {...{style: {width: wrapperWidth}}} className={`mx-auto  flex-nowrap  gap-1  `}>
      <R_Stack className={`flex-nowrap items-start`}>
        <section>
          <PaperLarge {...{style: {width: leftWidth}}} className={`max-h-[80vh]  overflow-auto`}>
            <C_Stack className={`items-center justify-around gap-0 gap-y-[60px] `}>
              {zones.map((group, i) => {
                const halfNumber = Math.ceil(group.storeLabels.length / 2)
                const columns = arr__splitIntoGroups(group.storeLabels, halfNumber)

                return (
                  <div key={i}>
                    <div>
                      <C_Stack className={`items-center  `}>
                        <strong className={`bg-blue-main w-full  p-1 text-center text-white`}>{group.label}</strong>

                        <div className={` grid grid-cols-2`}>
                          {columns.map((storeLabels, colIdx) => {
                            return (
                              <div
                                {...{
                                  style: {width: leftWidth / 2 - 50},
                                }}
                                key={colIdx}
                              >
                                {GetCsvTableInStoreGroup({targetStoreLabels: storeLabels})}
                              </div>
                            )
                          })}
                        </div>
                      </C_Stack>
                    </div>
                  </div>
                )
              })}
            </C_Stack>
          </PaperLarge>
        </section>
        <section>
          <PaperLarge {...{style: {width: rightWidth}}}>
            <Guidance />
          </PaperLarge>
        </section>
      </R_Stack>
    </div>
  )
}
