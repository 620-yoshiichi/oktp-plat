import {QueryBuilder} from '@app/(apps)/QRBP/class/QueryBuilder'
import NewScheduleBoard from '@app/(apps)/QRBP/components/QRBP/scheduleBoard/NewScheduleBoard'

import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@cm/components/utils/Redirector'

import {getWhereQuery} from '@cm/lib/methods/redirect-method'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import prisma from 'src/lib/prisma'

import {addDays} from 'date-fns'

const ScheduldBoadrPage = async props => {
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
        <h3>過去10日のデータを表示しています。必要に応じて、開始日を変更してください</h3>
        <div className={`w-fit`}>
          <NewDateSwitcher />
        </div>
      </div>

      {query?.from && <NewScheduleBoard {...{targetCars, damageNameMaster, query}} />}
    </div>
  )
}

export default ScheduldBoadrPage
