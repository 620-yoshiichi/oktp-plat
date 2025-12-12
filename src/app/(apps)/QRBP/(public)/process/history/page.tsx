import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import {addDays} from 'date-fns'
import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'

import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import Table from '@app/(apps)/QRBP/(public)/process/history/Table/Table'
import {Prisma} from '@prisma/generated/prisma/client'
import {getWhereQuery} from '@cm/lib/methods/redirect-method'
import Redirector from '@cm/components/utils/Redirector'
export default async function Page(props) {
  const query = await props.searchParams
  const today = new Date()

  const defaultQuery = {from: today}

  const {redirectPath, whereQuery: dateWhere} = await getWhereQuery({
    defaultQuery,
    query,
    whereQueryConverter: whereQuery => ({
      gte: whereQuery?.gte,
      lt: addDays(whereQuery?.gte ?? new Date(), 1),
    }),
  })

  if (redirectPath) {
    return <Redirector redirectPath={redirectPath} />
  }

  const {STUFF_PROCESS, processNameMasterArr} = await Init({dateWhere})

  return (
    <div className={`p-2`}>
      <NewDateSwitcher selectPeriod={false} />
      {query.from && <Table {...{processNameMasterArr, STUFF_PROCESS, query}} />}
    </div>
  )
}

/**methods */

const Init = async ({dateWhere}) => {
  const where = {
    date: {...dateWhere},
  }
  const {prismaProcess, ProcessArray, engineerMaster, processNameMasterArr} = await getPrismaData({
    where,
  })

  const {result: aggregationsByUser} = await doStandardPrisma('process', 'groupBy', {
    where: {...where},
    by: ['userId', 'processNameMasterId'],

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    select: {_count: true, _sum: true},
  })

  const STUFF_PROCESS: {
    [key: string]: {
      User: any
      processArrayForUser: any[]
      time: any
      totalTime: number
      count: any
      totalCount: number
    }
  } = {}

  engineerMaster?.forEach(user => {
    const userIdKey = `userId-${user.id}`

    obj__initializeProperty(STUFF_PROCESS, userIdKey, {
      User: user,
      processArrayForUser: [],
      time: {},
      totalTime: 0,
      count: {},
      totalCount: 0,
    })
  })

  ProcessArray?.forEach(process => {
    const {userId, Car} = process
    const userIdKey = `userId-${userId}`
    if (!userId) return

    STUFF_PROCESS[userIdKey]?.processArrayForUser.push(process)
    const {ProcessNameMaster} = process ?? {}

    const aggregation = aggregationsByUser?.find(a => {
      return a?.userId === userId && a?.processNameMasterId === process?.processNameMasterId
    })
    const processKey = ProcessNameMaster.id

    if (!STUFF_PROCESS[userIdKey]) return
    STUFF_PROCESS[userIdKey]['time'][processKey] = aggregation?._sum?.time
    STUFF_PROCESS[userIdKey]['totalTime'] += aggregation?._sum?.time
    STUFF_PROCESS[userIdKey]['count'][processKey] = aggregation?._count?.time
    STUFF_PROCESS[userIdKey]['totalCount'] += aggregation?._count?.time
  })
  const result: any = {STUFF_PROCESS, ProcessArray, processNameMasterArr}
  return result
}

const getPrismaData = async ({where}) => {
  const {result: prismaProcess} = await doStandardPrisma('process', 'findMany', {
    where,
    orderBy: [{date: 'asc'}, {ProcessNameMaster: {sortOrder: 'asc'}}],
    include: {
      User: {},
      Car: {},
      ProcessNameMaster: {},
    },
  })

  const ProcessArray = prismaProcess?.filter(p => {
    return p?.ProcessNameMaster?.onEnginerProcess === true
  })

  const userFindMany: Prisma.UserFindManyArgs = {
    orderBy: [{type2: 'asc'}, {damageNameMasterId: 'asc'}, {sortOrder: 'asc'}],
    include: {
      DamageNameMaster: {},
      UserProcessConfirmation: {
        where: where,
      },
    },
    where: {
      UserRole: {some: {RoleMaster: {name: 'CRエンジニア'}}},
      active: {not: false},
    },
  }
  const {result: engineerMaster} = await doStandardPrisma('user', 'findMany', userFindMany)

  const {result: processNameMasterArr} = await doStandardPrisma('processNameMaster', 'findMany', {
    where: {onEnginerProcess: true},
    orderBy: [{sortOrder: 'asc'}],
  })

  return {prismaProcess, ProcessArray, engineerMaster, processNameMasterArr}
}
