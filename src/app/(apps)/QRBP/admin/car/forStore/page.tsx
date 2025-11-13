import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {QueryBuilder} from '@app/(apps)/QRBP/class/QueryBuilder'

import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'

import {getWaitingList} from '@app/(apps)/QRBP/admin/car/scheduled/server-actions'

import Base from '@app/(apps)/QRBP/admin/car/forStore/Base'
import {QrbpEasySearchBuilder} from 'src/non-common/EsCollection/QRBP_EasySearchBuilder'
import {getInitModelRecordsProps} from '@cm/components/DataLogic/TFs/Server/fetchers/getInitModelRecordsProps'

export default async function Page(props) {
  const query = await props.searchParams
  const params = await props.params
  const acceptionProcess = await BP_Car.getProcessNameMasterByName('CR受入')
  const dataModelName = 'car'
  const {session, scopes} = await initServerComopnent({query})
  const {isStoreManager} = scopes.getNewCarProps()

  /**queryとは関係なく絞るやつ */
  const additionalWhere = isStoreManager
    ? {
        storeId: session.storeId,
        Process: {some: {processNameMasterId: acceptionProcess?.id}},
      }
    : {
        OR: [{storeId: session.storeId}, {userId: session?.id}],
        Process: {some: {processNameMasterId: acceptionProcess?.id}},
      }

  const where = await (await (await QrbpEasySearchBuilder()).car({session, query, additionalWhere})).onWaitingListCount?.CONDITION

  const waitingListObject = await getWaitingList({where})

  const include = QueryBuilder.getInclude({session, query}).car.include

  const serverFetchProps = {
    DetailePageId: params?.[`id`] ? Number(params?.[`id`]) : undefined,

    dataModelName,
    additional: {where: {...additionalWhere}},
    include,
    session,
    query,
    myTable: undefined,
    easySearchExtraProps: {},
  }

  const initialModelRecords = await getInitModelRecordsProps({
    ...serverFetchProps,
    query,
    rootPath: 'QRBP',
    env: 'forStore',
  })

  // const serverFetchihngData = await ES_Atom_Fetcher({
  //   DetailePageId: params?.[`id`] ? Number(params?.[`id`]) : undefined,
  //   EasySearchBuilder,
  //   dataModelName,
  //   additional: {where: {...additionalWhere}},
  //   include,
  //   session,
  //   query,
  //   myTable: undefined,
  //   easySearchExtraProps: {},
  // })

  return (
    <Base
      {...{
        waitingListObject,
        serverFetchProps,
        initialModelRecords,
        // easySearchPrismaDataOnServer,
        // prismaDataExtractionQuery,
        // easySearchWhereAnd,
        // easySearchObject,
      }}
    />
  )
}
