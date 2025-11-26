// 'use server'
// import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
// import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

// export const initLoadingVehicles = async () => {
//   const makeLoadingVehilceQuery: transactionQuery[] = []
//   const {result: areas} = await doStandardPrisma('area', 'findMany', {})
//   areas.forEach(area => {
//     makeLoadingVehilceQuery.push({
//       model: `loadingVehicle`,
//       method: 'create',
//       queryObject: {
//         data: {areaId: area.id, slot: 6, deliverScheduleId: 0},
//       },
//     })
//   })
//   const res = await doTransaction({transactionQueryList: makeLoadingVehilceQuery})
//   return res
// }
