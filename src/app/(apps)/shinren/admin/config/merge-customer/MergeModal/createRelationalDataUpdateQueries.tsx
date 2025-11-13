import {StrHandler} from '@cm/class/StrHandler'
import {PrismaModelNames} from '@cm/types/prisma-types'
import {transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

export function createRelationalDataUpdateQueries({CstmrFrom, CstmTo}) {
  const queriFromClient: transactionQuery[] = []
  addToQueriesFromClient(`alternateInfo`)
  addToQueriesFromClient(`extraInfo`)
  addToQueriesFromClient(`insuranceInfo`)
  addToQueriesFromClient(`rentaDailyReport`)
  addToQueriesFromClient(`rentaReference`)

  function addToQueriesFromClient(ModelName: PrismaModelNames) {
    const capitalizedModelName = StrHandler.capitalizeFirstLetter(ModelName)
    CstmrFrom[capitalizedModelName].forEach(async d => {
      queriFromClient.push({
        model: ModelName,
        method: `update`,
        queryObject: {where: {id: d.id}, data: {rentaCustomerId: CstmTo.id}},
      })
    })
  }

  return queriFromClient
}
