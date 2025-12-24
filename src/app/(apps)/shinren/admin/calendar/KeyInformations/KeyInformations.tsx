'use client'
import {CalendarInfoType, CalendarInfoTypeAtom} from '@app/(apps)/shinren/admin/calendar/calendar-methods'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Button} from '@cm/components/styles/common-components/Button'

import ContentPlayer from '@cm/components/utils/ContentPlayer'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import {getColorStyles} from '@cm/lib/methods/colors'

import {PrismaModelNames} from '@cm/types/prisma-types'
import {Alert} from '@cm/components/styles/common-components/Alert'
import {generalDoStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

const KeyInformations = props => {
  const CalendarInfo = props.CalendarInfo as CalendarInfoType
  const {toggleLoad} = useGlobal()

  const allDataInSort = Object.keys(CalendarInfo)
    .map((date, i) => {
      const listsOnDate = CalendarInfo[date]
      return listsOnDate.flat()
    })
    .flat()
    .sort((a, b) => Number(a.date) - Number(b.date)) as CalendarInfoTypeAtom[]

  return (
    <div className="table-wrapper  mx-auto max-h-[50vh]  ">
      <table>
        <thead>
          <tr>
            <th>種別</th>
            <th>日付</th>
            <th>項目</th>

            <th>顧客</th>
            <th>担当</th>
            <th>画像</th>
            <th>区分</th>
            <th>既読</th>
          </tr>
        </thead>
        <tbody>
          {allDataInSort.map((list: CalendarInfoTypeAtom, j) => {
            const {item, date, RentaCustomer, calendarDataType, before90Days, record} = list

            //90日前の既読かどうか
            const isReadKey = before90Days ? 'isRead' : 'isRead2'
            const IS_READ = record[isReadKey]

            const {color, label} = calendarDataType ?? {}

            return (
              <tr key={j} className={`border-y `} style={{...getColorStyles(color + '80')}}>
                <td>{label}</td>
                <td>{formatDate(date, 'YY-MM-DD(ddd)')}</td>
                <td>{item}</td>
                <td>{RentaCustomer?.name ?? '---'}</td>
                <td>{RentaCustomer?.User?.name ?? '---'}</td>
                <td>
                  {record?.imageUrl !== undefined ? <ContentPlayer src={record?.imageUrl} options={{download: true}} /> : ''}
                </td>
                <td>{before90Days ? <Alert color="red">90日前</Alert> : ''}</td>
                <td>
                  <Button
                    onClick={async () => {
                      toggleLoad(async () => {
                        const Model = (calendarDataType?.value ?? ``) as PrismaModelNames
                        await generalDoStandardPrisma(Model, `update`, {
                          where: {id: record.id},
                          data: {[isReadKey]: !IS_READ},
                        })
                      })
                    }}
                    color={IS_READ ? 'green' : 'red'}
                  >
                    {IS_READ ? '済' : '未対応'}
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default KeyInformations
