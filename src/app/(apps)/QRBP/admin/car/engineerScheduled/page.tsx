import {QueryBuilder} from '@app/(apps)/QRBP/class/QueryBuilder'
import EngineerScheduleBoard from '@app/(apps)/QRBP/components/QRBP/scheduleBoard/EngineerScheduleBoard'

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
  })

  return (
    <div className={`p-4`}>
      <div className={`w-fit`}>
        <h3>エンジニアスケジュールボード</h3>
        <p className={`text-xs text-gray-500`}>※ このボードでの日付変更は、他のスケジュールボードには影響しません</p>
        <div className={`w-fit`}>
          <NewDateSwitcher />
        </div>
      </div>

      {query?.from && <EngineerScheduleBoard {...{targetCars, damageNameMaster, query}} />}
    </div>
  )
}

export default EngineerScheduledBoardPage
