'use client'

import {TableBordered, TableWrapper} from '@cm/components/styles/common-components/Table'
import {Fragment} from 'react'
import {getColorStyles} from '@cm/lib/methods/colors'

import {arr__uniqArray} from '@cm/class/ArrHandler/array-utils/basic-operations'

export default function DailyReportAggregationTable({userWithCount}) {
  const bigCategories = [`visitTypeTellOnlyCount`, `visitTypeWithoutTellCount`, `visitTypeCount`]
  let categories: any[] = []
  let labels: any[] = []
  userWithCount.map((u: any, i: any) => {
    const {visitTypeCount, visitTypeTellOnlyCount, visitTypeWithoutTellCount} = u
    const groupByArr = visitTypeCount.groupByArr ?? []
    groupByArr.map((g, j) => {
      const {COUNT, label, key, date, color = ''} = g
      categories.push(label)
      labels.push({label, color})
    })
  })

  categories = arr__uniqArray(categories)
  labels = arr__uniqArray(labels)

  return (
    <TableWrapper className={`w-fit text-center text-xs`}>
      <TableBordered>
        <thead>
          <tr>
            <th>スタッフ</th>
            <th>大区分</th>
            {categories.map((c, i) => {
              const color = labels.find(l => l.label === c)?.color
              return (
                <th key={i} style={{...getColorStyles(color)}}>
                  {c}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {userWithCount.map((u: any, i: any) => {
            return (
              <Fragment key={i}>
                <tr>
                  <td rowSpan={4}>{u.name}</td>
                </tr>

                {bigCategories.map((bigCategory, j) => {
                  const data = u[bigCategory]
                  const {categoryName, groupByArr, columnOrigin} = data

                  return (
                    <tr key={j}>
                      <td>{categoryName}</td>
                      {categories.map((c, k) => {
                        const count = groupByArr
                          .filter(g => g.label === c)
                          .map(g => g.COUNT)
                          .reduce((a, b) => a + b, 0)
                        const color = labels.find(l => l.label === c)?.color
                        return (
                          <td key={k} style={{...getColorStyles(color)}} className={count ? '' : 'opacity-20'}>
                            {count}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </Fragment>
            )
          })}
        </tbody>
      </TableBordered>
    </TableWrapper>
  )
}
