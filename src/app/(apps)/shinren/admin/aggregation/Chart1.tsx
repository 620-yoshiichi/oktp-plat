'use client'

import {C_Stack} from '@cm/components/styles/common-components/common-components'

import {CSSProperties, Fragment} from 'react'

const Chart1 = ({days, userWithCount, outcomeMasters, purposeMaters}) => {
  const width = useWindowSize()?.width * 0.8
  const {id, name, RentaStore, ...theadCols} = userWithCount[0] ?? {}
  const wrapperWidth = Math.min(width, 1100)
  return (
    <C_Stack className={`gap-4`}>
      <></>
      <>
        <C_Stack className={`itemce gap-0`}>
          {Object.keys(theadCols).map((datakey, i) => {
            const object = theadCols[datakey] as countCagetory
            const {columnOrigin, categoryName} = object
            const chartWidth = 280
            const chartHeight = chartWidth * 0.8

            const ChartStyle: CSSProperties = {
              width: chartWidth,
              height: chartHeight,
              zIndex: 1,
              position: 'relative',
            }
            return (
              <div key={i}>
                <Accordion
                  {...{
                    defaultOpen: true,
                    style: {fontSize: 20, marginBottom: 40, background: '#f0f0f0'},
                    label: categoryName,
                  }}
                >
                  <div>
                    <h1 className={`bg-sub-main text-center  text-2xl font-bold text-white`}>{categoryName}</h1>
                    <AutoGridContainer {...{}}>
                      {columnOrigin.map((col, j) => {
                        const title = col.value ?? col.name
                        const chartData: any[] = []

                        userWithCount.forEach(user => {
                          const object = user[datakey] as countCagetory
                          const COUNT = object?.groupByArr
                            .filter(obj => {
                              return obj.label === title
                            })
                            .reduce((acc, cur) => {
                              return acc + cur.COUNT
                            }, 0)

                          const dailyReportCount = COUNT
                          chartData.push({
                            userName: user.name,
                            userId: user.id,
                            dailyReportCount,
                          })
                        })

                        const colors = getColorStyles(col.color)
                        const themeColor = colors.backgroundColor + '20'
                        const labelColor = colors.backgroundColor + '60'
                        return (
                          <Fragment key={j}>
                            <div className={`p-1`}>
                              <Paper className={``} style={{...ChartStyle, background: themeColor}}>
                                <div style={{background: labelColor, color: 'black', textAlign: 'center'}}>{title}</div>
                                <ResponsiveContainer width="100%" height="100%">
                                  <ComposedChart
                                    {...{fontSize: 14}}
                                    width={chartWidth}
                                    height={chartHeight}
                                    data={chartData}
                                    margin={{
                                      top: 10,
                                      right: 10,
                                      bottom: 80,
                                      left: 10,
                                    }}
                                  >
                                    <CartesianGrid stroke="#f5f5f5" />
                                    <XAxis
                                      {...{
                                        dataKey: 'userName',
                                        fontSize: 12,
                                        angle: 90,
                                        interval: 0,

                                        tickMargin: 40,
                                      }}
                                    />
                                    <YAxis label={{value: '件数', angle: -90, position: 'insideLeft'}} />
                                    <Tooltip />
                                    {/* <Legend /> */}
                                    {/* <Area type="monotone" dataKey="amt" fill={colors.color} stroke={colors.color} /> */}
                                    <Bar name="件数" dataKey="dailyReportCount" barSize={16} fill={colors.backgroundColor} />
                                    <Line type="monotone" dataKey="uv" stroke="#ff7300" />
                                  </ComposedChart>
                                </ResponsiveContainer>
                              </Paper>
                            </div>
                          </Fragment>
                        )
                      })}
                    </AutoGridContainer>
                  </div>
                </Accordion>
              </div>
            )
          })}
        </C_Stack>
      </>
    </C_Stack>
  )
}

export default Chart1

import React from 'react'
import {ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts'
import {getColorStyles} from '@cm/lib/methods/colors'
import Accordion from '@cm/components/utils/Accordions/Accordion'
import useWindowSize from '@cm/hooks/useWindowSize'
import {Paper} from '@cm/components/styles/common-components/paper'
import {countCagetory} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/types'
import AutoGridContainer from '@cm/components/utils/AutoGridContainer'

const Chart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        width={500}
        height={400}
        data={data}
        margin={{
          top: 20,
          right: 80,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis dataKey="name" label={{value: 'Pages', position: 'insideBottomRight', offset: 0}} scale="band" />
        <YAxis label={{value: 'Index', angle: -90, position: 'insideLeft'}} />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="amt" fill="#8884d8" stroke="#8884d8" />
        <Bar dataKey="dailyReportCount" barSize={20} fill="#413ea0" />
        <Line type="monotone" dataKey="uv" stroke="#ff7300" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

const data = [
  {
    name: 'Page A',
    uv: 590,
    dailyReportCount: 800,
    amt: 1400,
  },
  {
    name: 'Page B',
    uv: 868,
    dailyReportCount: 967,
    amt: 1506,
  },
  {
    name: 'Page C',
    uv: 1397,
    dailyReportCount: 1098,
    amt: 989,
  },
  {
    name: 'Page D',
    uv: 1480,
    dailyReportCount: 1200,
    amt: 1228,
  },
  {
    name: 'Page E',
    uv: 1520,
    dailyReportCount: 1108,
    amt: 1100,
  },
  {
    name: 'Page F',
    uv: 1400,
    dailyReportCount: 680,
    amt: 1700,
  },
]
