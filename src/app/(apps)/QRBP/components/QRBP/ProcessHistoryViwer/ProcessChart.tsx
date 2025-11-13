import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'
import {anyObject} from '@cm/types/utility-types'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'

import useRecharts from '@cm/hooks/useRecharts'
import {ProcessNameMaster} from '@prisma/client'
import React from 'react'
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts'

const Engineer_Process_Chart_Main = (props: anyObject) => {
  const {ProcessByStuffObject} = props

  const data = getData({ProcessByStuffObject})

  const USE_RECHART = useRecharts()
  const {axis, style} = USE_RECHART

  const {data: processNameMaster} = useDoStandardPrisma(
    'processNameMaster',
    'findMany',
    {},
    {
      deps: [],
    }
  )

  return (
    <BarChart
      data={data}
      {...{
        ...style.chartDefaultStyle,
        width: 800,
        height: 800,
        layout: 'vertical',
        margin: {
          left: 50,
        },
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <YAxis
        {...{
          type: 'category',
          dataKey: 'name',
          ...axis.defaultProps,
        }}
      />
      <XAxis
        {...{
          type: 'number',
          ticks: axis.generateTicks(0, 20),
          ...axis.defaultProps,
        }}
      />
      <Tooltip />
      <Legend />
      {processNameMaster
        ?.filter((master: ProcessNameMaster) => master?.onEnginerProcess && master.name !== '作業完了')
        ?.sort((a, b) => {
          return a.sortOrder - b.sortOrder
        })
        ?.map((master: ProcessNameMaster, i: number) => {
          return (
            <Bar
              key={i}
              {...{
                dataKey: master.name,
                stackId: 'a',
                fill: master.color ?? '#8884d8',
              }}
            ></Bar>
          )
        })}
    </BarChart>
  )
}

export default Engineer_Process_Chart_Main

const getData = (props: {ProcessByStuffObject: any}) => {
  const {ProcessByStuffObject} = props
  const data: any[] = []
  Object.keys(ProcessByStuffObject).forEach(key => {
    const Process_Count_Object = {}
    const {User, processArrayForUser} = ProcessByStuffObject[key]

    processArrayForUser.forEach((process: anyObject) => {
      const {ProcessNameMaster} = process
      obj__initializeProperty(Process_Count_Object, ProcessNameMaster.name, 0)
      Process_Count_Object[ProcessNameMaster.name]++
    })

    const name = User.name
    if (key) {
      data.push({User, name, ...Process_Count_Object})
    }
  })
  data.sort((a, b) => {
    const typeA = a.User.type2
    const typeB = b.User.type2
    return String(typeA).localeCompare(String(typeB))
  })
  return data
}
