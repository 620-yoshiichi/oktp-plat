import {P_Query} from '@cm/class/PQuery'
import Base from './Base'
import {initServerComopnent} from 'src/non-common/serverSideFunction'

import {QueryBuilder} from '@app/(apps)/QRBP/class/QueryBuilder'

import {addDays} from 'date-fns'
import {getWhereQuery} from '@cm/lib/methods/redirect-method'

import {HREF} from '@cm/lib/methods/urls'
import Redirector from '@cm/components/utils/Redirector'
import {prismaDataExtractionQueryType} from '@cm/components/DataLogic/TFs/Server/Conf'

import {QrbpEasySearchBuilder} from 'src/non-common/EsCollection/QRBP_EasySearchBuilder'
import {getInitModelRecordsProps, serverFetchProps} from '@cm/components/DataLogic/TFs/Server/fetchers/getInitModelRecordsProps'

export default async function Page(props) {
  const params = await props.params
  let query = await props.searchParams
  const {session} = await initServerComopnent({query})

  // const EasySearch = QueryBuilder.EasySearch({session, query})

  query = {...query, isRepairAllowed: true}
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

  if (query['where-car-bpNumber-contains-text']) {
    const bpNumber = query['where-car-bpNumber-contains-text']
    const path = HREF(
      `/QRBP/engineer`,
      {
        ...query,
        'where-car-bpNumber-contains-text': undefined,
        search: `car[contains:bpNumber]=${bpNumber}`,
      },
      query
    )

    return <Redirector redirectPath={path} />
  }

  const userId = Number(query.userId)

  const {page, take, skip} = P_Query.getPaginationPropsByQuery({
    query,
    tableId: undefined,
    countPerPage: undefined,
  })
  const flexQueryForCar = P_Query.createFlexQuery({
    query,
    dataModelName: 'car',
    page,
    take,
    skip,
  })

  const favMode = query?.favorite === 'true' && userId

  const isRepairAllowedCondition = await (await (await QrbpEasySearchBuilder()).car({session, query})).isRepairAllowed?.CONDITION

  const prismaDataExtractionQueryCar: prismaDataExtractionQueryType = {
    include: QueryBuilder.getInclude({
      session,
      query,
      QueryBuilderExtraProps: {isRepairAllowedWhereQuery: isRepairAllowedCondition},
    }).car.include,
    ...flexQueryForCar,
    where: {
      ...(favMode ? {favoredByUserIds: {has: userId ?? 0}} : undefined),
      AND: [...flexQueryForCar.AND],
    },
  }

  //

  const serverFetchProps: serverFetchProps = {
    withEasySearch: false,
    DetailePageId: params?.[`id`] ? Number(params?.[`id`]) : undefined,

    dataModelName: 'car',
    additional: {
      where: {
        ...(favMode ? {favoredByUserIds: {has: userId ?? 0}} : undefined),
        AND: [...flexQueryForCar.AND],
      },
    },
    include: QueryBuilder.getInclude({
      session,
      query,
      QueryBuilderExtraProps: {isRepairAllowedWhereQuery: isRepairAllowedCondition},
    }).car.include,
    session,
    myTable: undefined,
    easySearchExtraProps: {},
  }

  const initialModelRecords = await getInitModelRecordsProps({
    ...serverFetchProps,
    query,
    rootPath: 'QRBP',
    env: 'engineer',
  })
  return (
    <div
      style={{
        width: 500,
        maxWidth: '95vw',
        margin: 'auto',
        padding: 5,
      }}
    >
      <Base {...{serverFetchProps, initialModelRecords, prismaDataExtractionQueryCar}} />
    </div>
  )
}
