import {initServerComopnent} from 'src/non-common/serverSideFunction'

import {QueryBuilder} from '@app/(apps)/QRBP/class/QueryBuilder'

import {toUtc} from '@cm/class/Days/date-utils/calculations'

import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'
import {getWaitingList} from '@app/(apps)/QRBP/admin/car/scheduled/server-actions'
import Base from '@app/(apps)/QRBP/admin/car/forCr/Base'

import {QrbpEasySearchBuilder} from 'src/non-common/EsCollection/QRBP_EasySearchBuilder'
import {getInitModelRecordsProps} from '@cm/components/DataLogic/TFs/Server/fetchers/getInitModelRecordsProps'
import prisma from 'src/lib/prisma'

export default async function Page(props) {
  const query = await props.searchParams
  const params = await props.params
  const dataModelName = 'car'
  const {session} = await initServerComopnent({query})

  const gte = toUtc('2023-12-1')

  const storeQueryObj = await (async () => {
    const stores = await prisma.store.findMany({where: {Car: {some: {id: {}}}}, orderBy: {code: 'asc'}})
    const paramKey = 'storeIds'
    const storeIdsStr = query[paramKey] ?? undefined
    const storeIdArr = storeIdsStr?.split(',')
    // prismaでorqueryを作成したい
    const StoreOR: any[] = []
    storeIdArr?.forEach(storeId => StoreOR.push({storeId: Number(storeId)}))
    return {stores, StoreOR, paramKey, storeIdsStr, storeIdArr}
  })()

  const additionalWhere = {
    AND: [
      {
        OR: [
          //
          {customerName: {not: {contains: '（下）'}}},
          {orderedAt: {gte}},
        ],
      },
      storeQueryObj.StoreOR.length === 0 ? {} : {OR: [...storeQueryObj.StoreOR]},
    ],
  }

  const where = await (await (await QrbpEasySearchBuilder()).car({session, query, additionalWhere})).onWaitingListCount?.CONDITION

  const waitingListObject = await getWaitingList({where})
  const include = QueryBuilder.getInclude({session, query}).car.include

  const myTable = {pagination: {countPerPage: BP_Car.const.defaultCountPerPage}}
  const serverFetchProps = {
    DetailePageId: params?.[`id`] ? Number(params?.[`id`]) : undefined,
    dataModelName,
    additional: {where: {...additionalWhere}},
    include,
    session,
    query,
    myTable,
    easySearchExtraProps: {},
  }

  const fetchTime = new Date()
  const initialModelRecords = await getInitModelRecordsProps({
    ...serverFetchProps,
    query,

    rootPath: 'QRBP',
    env: 'forCr',
  })

  return <Base {...{fetchTime, waitingListObject, serverFetchProps, initialModelRecords, storeQueryObj}} />
}
