import {QueryBuilder} from '@app/(apps)/QRBP/class/QueryBuilder'
import ScheduleBoard from '@app/(apps)/QRBP/components/QRBP/scheduleBoard/ScheduleBoard'

import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@cm/components/utils/Redirector'

import {getWhereQuery} from '@cm/lib/methods/redirect-method'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import prisma from 'src/lib/prisma'

import {addDays} from 'date-fns'

const EngineerScheduledBoardPage = async props => {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})
  const today = new Date()

  const defaultQuery = {
    from: addDays(today, -10),
    to: addDays(today, 30),
  }

  const {whereQuery, redirectPath} = await getWhereQuery({query, defaultQuery})

  if (redirectPath) {
    return <Redirector redirectPath={redirectPath} />
  }

  const targetCars = await prisma.car.findMany({
    orderBy: [{bpNumber: 'asc'}],
    where: {scheduledAt: {...whereQuery}},
    include: {...QueryBuilder.getInclude({session, query}).car.include},
  })

  const damageNameMaster = await prisma.damageNameMaster.findMany({
    where: {
      name: {not: 'QR'},
    },
    orderBy: {
      sortOrder: 'desc',
    },
  })

  const STATUS_LEGEND = [
    {label: '受付', color: '#B0B0B0'},
    {label: '作業中', color: '#F5A623'},
    {label: '外注', color: '#E05252'},
    {label: '完了', color: '#A364C7'},
  ]

  return (
    <div className={`px-4 pt-3 pb-2 max-w-[95vw] mx-auto overflow-auto`}>
      <div className={`mb-3 flex items-center justify-between gap-4`}>
        <div className={`flex items-center gap-4`}>
          <h2 className={`text-lg font-semibold text-gray-800`}>エンジニアスケジュールボード</h2>
          <NewDateSwitcher />
        </div>
        <div className={`flex items-center gap-3`}>
          <span className={`text-xs text-gray-400`}>※ 日付変更は他のボードに影響しません</span>
          {STATUS_LEGEND.map(s => (
            <div key={s.label} className={`flex items-center gap-1.5`}>
              <span className={`inline-block h-3 w-3 rounded-sm`} style={{backgroundColor: s.color}} />
              <span className={`text-xs text-gray-500`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {query?.from && (
        <div className={`max-h-[78vh] overflow-auto`}>
          <ScheduleBoard {...{targetCars, damageNameMaster, query}} mode="engineer" />
        </div>
      )}
    </div>
  )
}

export default EngineerScheduledBoardPage
