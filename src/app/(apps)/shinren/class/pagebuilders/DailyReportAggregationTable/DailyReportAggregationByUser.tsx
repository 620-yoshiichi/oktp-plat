'use client'

import React from 'react'
import {KeyIcon} from '@heroicons/react/20/solid'
import {Card} from '@cm/shadcn/ui/card'
import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'

export default function DailyReportAggregationByUser({u, i, theKey}) {
  const groupByArr = u[theKey].groupByArr ?? []
  const uniqueLabelObj = {}

  groupByArr.map((g, j) => {
    const {COUNT, label, key, date, color = ''} = g
    obj__initializeProperty(uniqueLabelObj, label, {label, color, COUNT: 0})
    uniqueLabelObj[label].COUNT += COUNT
  })

  return (
    <div>
      <Card className={` rounded-md`}>
        <div className={`w-[100px]`}>{u[theKey].categoryName}</div>
        <div className={`flex flex-col gap-1 sm:flex-row`}>
          {Object.keys(uniqueLabelObj).map((label, j) => {
            const {COUNT, color} = uniqueLabelObj[label]

            return (
              <div key={j} className={`w-[100px]`}>
                <IconBtn key={`${j}_${KeyIcon}`} color={color}>
                  {label}:{COUNT}
                </IconBtn>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
