'use client'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'

import useRecharts from '@cm/hooks/useRecharts'

import React from 'react'
import {Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart} from 'recharts'

import {Button} from '@cm/components/styles/common-components/Button'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

import {getUniqueColorById} from '@cm/lib/methods/common'

import {Fragment, useState} from 'react'
import {RELEVANT_KEYS} from '@app/(apps)/QRBP/admin/summary/constants'
import {PaperLarge} from '@cm/components/styles/common-components/paper'
import useWindowSize from '@cm/hooks/useWindowSize'
import {getColorStyles} from '@cm/lib/methods/colors'

const ClientTable = ({days, summariesInPeriod, CONDITIONS}) => {
  const {width} = useWindowSize()
  const USE_RECHART = useRecharts()
  const {axis, style} = USE_RECHART
  const filterdConditions = [...CONDITIONS.filter(CON => RELEVANT_KEYS.includes(CON?.id))]

  const [ActiveKeys, setActiveKeys] = useState<any>([...filterdConditions.map(con => con.id)])

  const dateMappedSummariesInPeriod = summariesInPeriod.map(data => {
    return {...data, date: formatDate(data.date, 'MM-DD(ddd)'), count: Number(data._sum.count)}
  })

  const CAHRTDATA = {}
  dateMappedSummariesInPeriod.forEach(data => {
    const {date, key, count} = data

    obj__initializeProperty(CAHRTDATA, date, {
      date,
    })

    obj__initializeProperty(CAHRTDATA[date], key, 0)
    CAHRTDATA[date][key] += count
  }) as any

  const chartData = Object.values(CAHRTDATA).map((data: any) => {
    const total = RELEVANT_KEYS.reduce((acc, cur) => acc + data[cur], 0)
    return {...data, total}
  })

  const chartSize = {
    width: width * 0.9,
    height: 300,
  }

  return (
    <div>
      <PaperLarge>
        <div>
          内訳グラフ表示
          <R_Stack>
            {filterdConditions.map((data, idx) => {
              const {id, label} = data
              const isActive = ActiveKeys.find(k => k === id)
              const color = getUniqueColorById(id)
              return (
                <div
                  key={idx}
                  className={isActive ? '' : 'opacity-20'}
                  onClick={e => {
                    const newActiveKeys = ActiveKeys.includes(id) ? ActiveKeys.filter(k => k !== id) : [...ActiveKeys, id]
                    setActiveKeys(newActiveKeys)
                  }}
                >
                  <Button style={{...getColorStyles(color)}}>{label}</Button>
                </div>
              )
            })}
          </R_Stack>
        </div>
      </PaperLarge>
      <PaperLarge>
        <ComposedChart
          {...{
            ...style.chartDefaultStyle,
            width: chartSize.width,
            height: chartSize.height,
            data: chartData,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Bar type="monotone" dataKey={'total'} name={'合計'} barSize={15} />
          {filterdConditions
            .filter(con => {
              return ActiveKeys.includes(con.id)
            })
            .map((con, idx) => {
              const {id, label} = con
              const color = getUniqueColorById(id)
              return (
                <Fragment key={idx}>
                  <Line name={label} type="monotone" dataKey={id} stroke={color} strokeWidth={4} activeDot={{r: 8}} />
                </Fragment>
              )
            })}

          <Tooltip />
          <Legend />
        </ComposedChart>
      </PaperLarge>
    </div>
  )
}

export default ClientTable
