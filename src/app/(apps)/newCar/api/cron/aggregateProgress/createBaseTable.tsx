// import {getMidnight} from '@cm/class/Days/date-utils/calculations'
// import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
// import {Prisma} from '@prisma/client'

// export const createBaseTable = async ({stores}) => {
//   const transactionQueryList: transactionQuery[] = []

//   /** 進捗集計テーブルを作成 */
//   const ProgressAggregationTable = stores.map(async store => {
//     const payload = {date: getMidnight(), storeId: store.id}

//     const args: Prisma.ProgressAggregationTableUpsertArgs = {
//       where: {date_storeId_unique: payload},
//       create: payload,
//       update: payload,
//     }
//     transactionQueryList.push({
//       model: `progressAggregationTable`,
//       method: `upsert`,
//       queryObject: args,
//     })
//   })

//   const res = await doTransaction({transactionQueryList})

//   return res
// }
