'use client'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Fields} from '@cm/class/Fields/Fields'
import {Button} from '@cm/components/styles/common-components/Button'

import {Paper} from '@cm/components/styles/common-components/paper'
import {Circle, C_Stack, Padding, R_Stack} from '@cm/components/styles/common-components/common-components'
import MyPopover from '@cm/components/utils/popover/MyPopover'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'
import {InformationCircleIcon} from '@heroicons/react/20/solid'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {getColorStyles} from '@cm/lib/methods/colors'

import {Fragment} from 'react'
import {Alert} from '@cm/components/styles/common-components/Alert'
import {CssString} from '@cm/components/styles/cssString'
import {NumHandler} from '@cm/class/NumHandler'

const fix = 'éå¸¸'
const SettlementTool = ({Car, CarForShanaiJikan}) => {
  const columns = Fields.transposeColumns([
    {
      id: 'bpNumber',
      label: 'BP番号',
      form: {},
    },
  ])
  const {addQuery, query, toggleLoad} = useGlobal()
  const {BasicForm, formRef, latestFormData} = useBasicFormProps({
    columns,
    formData: {...query},
  })

  return (
    <Padding>
      <Paper>
        <div>
          <R_Stack className={` flex justify-start`}>
            <BasicForm
              latestFormData={latestFormData}
              alignMode="row"
              onSubmit={data => {
                toggleLoad(async () => {
                  addQuery({bpNumber: data.bpNumber})
                })
              }}
            >
              <Button type="submit">検索</Button>
            </BasicForm>
          </R_Stack>
        </div>
      </Paper>
      <Paper>
        {Car ? (
          <C_Stack>
            <BasicTabs
              {...{
                id: 'settlementTool',
                showAll: false,
                TabComponentArray: [
                  {
                    label: (
                      <R_Stack className={`mx-auto  w-full justify-center text-lg`}>
                        <span>通常処理</span>
                        <Circle width={30} color={`red`}>
                          {Car.Process.length}
                        </Circle>
                      </R_Stack>
                    ),
                    component: <ProcessResult {...{Car}} />,
                  },
                  {
                    label: (
                      <R_Stack className={`mx-auto  w-full justify-center text-lg`}>
                        <span>社内時間</span>
                        <Circle width={30} color={`red`}>
                          {CarForShanaiJikan.Process.length}
                        </Circle>
                      </R_Stack>
                    ),
                    component: <ProcessResult {...{Car: CarForShanaiJikan}} />,
                  },
                ],
              }}
            />
          </C_Stack>
        ) : (
          <Alert>BP番号を選択してください</Alert>
        )}
      </Paper>
    </Padding>
  )
}

export default SettlementTool

const ProcessResult = ({Car}) => {
  const {Process} = Car
  const B = Process.filter(p => {
    return p?.ProcessNameMaster?.type === '板金'
  })
  const P = Process.filter(p => {
    return p?.ProcessNameMaster?.type === '塗装'
  })

  const ELSE = Process.filter(p => {
    return p?.ProcessNameMaster?.type !== '塗装' && p?.ProcessNameMaster?.type !== '板金'
  })

  const data = {
    B: {
      Process: B,
      label: '板金',
      totalTime: B.reduce((acc, cur) => acc + cur.time, 0),
    },
    P: {
      Process: P,
      label: '塗装',
      totalTime: P.reduce((acc, cur) => acc + cur.time, 0),
    },

    ELSE: {
      Process: ELSE,
      label: 'その他',
      totalTime: ELSE.reduce((acc, cur) => acc + cur.time, 0),
    },
  }

  const tableRows: any[] = []

  Process.forEach((p, i) => {
    const B = data.B.Process[i]
    const P = data.P.Process[i]
    const ELSE = data.ELSE.Process[i]
    if (B || P || ELSE) {
      tableRows.push({B, P, ELSE})
    }
  })

  const getCellProps = type => {
    const baseColor = (type === 'B' ? '#ADC764' : type === 'P' ? '#99BBE0' : '#FFFFFF') + '60'
    return {
      style: {...getColorStyles(baseColor)},
      className: `p-1 w-[100px] `,
    }
  }

  const ProcessTypes = ['B', 'P', 'ELSE']

  return (
    <C_Stack>
      <div>
        <div className={`${CssString.table.borderCerlls} table-wrapper w-fit text-center`}>
          <table>
            <thead>
              <tr>
                <th>BPNo</th>
                <th>車名</th>
                <th>作業時間合計</th>
                <th>板金時間合計</th>
                <th>塗装時間合計</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{Car.bpNumber}</td>
                <td>{Car.carName}</td>
                <td>{NumHandler.round(data.B.totalTime + data.P.totalTime)}</td>
                <td>{NumHandler.round(data.B.totalTime)}</td>
                <td>{NumHandler.round(data.P.totalTime)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <div className={`${CssString.table.borderCerlls} table-wrapper w-fit text-center`}>
          <table>
            <thead>
              <tr>
                {ProcessTypes.map(type => {
                  return (
                    <Fragment key={type}>
                      <th colSpan={5} {...getCellProps(type)} key={type}>
                        {data[type].label}
                      </th>
                    </Fragment>
                  )
                })}
              </tr>
              <tr>
                {ProcessTypes.map(type => {
                  return (
                    <Fragment key={type}>
                      <th {...getCellProps(type)} key={type}>
                        {data[type].label}
                      </th>
                      <th {...getCellProps(type)}>作業日</th>
                      <th {...getCellProps(type)}>作業内容</th>
                      <th {...getCellProps(type)}>作業時間</th>
                      <th {...getCellProps(type)}>区分</th>
                    </Fragment>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => {
                return (
                  <Fragment key={i}>
                    <tr>
                      {ProcessTypes.map(type => {
                        const note = row[type]?.note

                        return (
                          <Fragment key={type}>
                            <td {...getCellProps(type)}>{row[type]?.User?.name}</td>
                            <td {...getCellProps(type)}>{formatDate(row[type]?.date)}</td>
                            <td {...getCellProps(type)} className={`w-[250px]`}>
                              <R_Stack>
                                <div>{row[type]?.ProcessNameMaster?.name}</div>
                                {note && (
                                  <MyPopover
                                    {...{
                                      positionFree: true,
                                      button: <InformationCircleIcon className={`text-error-main w-5`} />,
                                      children: <Paper>{row[type]?.note}</Paper>,
                                    }}
                                  ></MyPopover>
                                )}
                              </R_Stack>
                            </td>
                            <td {...getCellProps(type)}>{row[type]?.time}</td>
                            <td {...getCellProps(type)}>{row[type]?.type.replace('éå¸¸', '通常')}</td>
                          </Fragment>
                        )
                      })}
                      {/* <td>{row.B?.User.name}</td>
                      <td>{formatDate(row.B?.date)}</td>
                      <td>{row.B?.ProcessNameMaster?.name}</td>
                      <td>{row.B?.time}</td>
                      <td>{row.B?.type}</td>

                      <td>{row.P?.User.name}</td>
                      <td>{formatDate(row.P?.date)}</td>
                      <td>{row.P?.ProcessNameMaster?.name}</td>
                      <td>{row.P?.time}</td>
                      <td>{row.P?.type}</td> */}
                    </tr>
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </C_Stack>
  )
}
