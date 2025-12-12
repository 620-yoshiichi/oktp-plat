// import {toUtc} from '@cm/class/Days/date-utils/calculations'
// import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
// import { Ucar} from '@prisma/generated/prisma/client'
// import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'

// export const doTransactionUcarBaseList = async ({cleansedData, users, adminUser, processes}) => {
//   const ucarBaseTransactionQueryList: transactionQuery<'ucar', 'upsert'>[] = []

//   cleansedData.forEach(cleansed => {
//     const {
//       sateiId,
//       Sorting_results,
//       datetime_0,
//       email_0,
//       store_0,
//       runnable_0,
//       remarks_0,
//       shitadoriKubun_0,
//       orderNumber_0,
//       max_update,
//       ...rest
//     } = cleansed

//     const theUser = users.find(obj => obj.email === email_0) ?? adminUser

//     const userId = theUser.id
//     const storeId = theUser?.storeId ?? undefined

//     if (!userId || !storeId) {
//       // console.warn('データ欠損: ', {
//       //   sateiId,
//       //   email_0,
//       // })
//       return
//     }

//     const data = {
//       sateiID: sateiId,
//       userId,
//       storeId,
//       runnable: runnable_0 === `可` ? true : false,
//       remarks: remarks_0,
//       storeToPickUp: store_0,
//       destination: Sorting_results,
//     }

//     ucarBaseTransactionQueryList.push({
//       model: `ucar`,
//       method: `upsert`,
//       queryObject: {
//         where: {sateiID: sateiId},
//         create: data,
//         update: data,
//       },
//     })
//   })

//   const ucarBaseUpsertRes = await doTransaction({
//     transactionQueryList: ucarBaseTransactionQueryList,
//   })

//   // 取得したデータを、cleansedDataとprocessesを使用して、listを作成する。
//   // 作成したlistを、ucarBaseUpsertResのresultに追加する。

//   if (ucarBaseUpsertRes.result) {
//     ucarBaseUpsertRes.result = ucarBaseUpsertRes.result.map(data => {
//       const cleansed = cleansedData.find(d => d.sateiId === data.sateiID)

//       const list = getList({cleansed, processes})

//       return {
//         ...data,
//         list,
//       }
//     })
//   }

//   type ucarItem = Ucar & {
//     list: {theProcessMaster: any; date: Date}[]
//   }
//   return ucarBaseUpsertRes as {
//     success: boolean
//     result: ucarItem[] | null
//     message: string
//   }
// }

// function getList({cleansed, processes}) {
//   const processKeys = [
//     {name: 'datetime_0', type: 'DATETIME'},
//     {name: 'datetime_1', type: 'DATETIME'},
//     {name: 'datetime_2', type: 'DATETIME'},
//     {name: 'datetime_3', type: 'DATETIME'},
//     {name: 'datetime_4', type: 'DATETIME'},
//     {name: 'Sorting results', type: 'STRING'},
//     {name: 'datetime_6', type: 'DATETIME'},
//     {name: 'datetime_7', type: 'DATETIME'},
//     {name: 'datetime_8', type: 'DATETIME'},
//     {name: 'datetime_9', type: 'DATETIME'},
//     {name: 'datetime_11', type: 'DATETIME'},
//     {name: 'datetime_12', type: 'DATETIME'},
//     {name: 'datetime_13', type: 'DATETIME'},
//     {name: 'datetime_14', type: 'DATETIME'},
//   ]

//   const list = processKeys
//     .map(master => {
//       const key = master.name

//       const theValue = cleansed?.[key]
//       if (!theValue) return

//       const processCodeItem = UcarProcessCl.CODE.byCode(key)
//       // const theProcessName = PROCESS_MASTER.find(d => d.bigQueryFieldKey === key)?.value

//       const hasProcess = processes.find(obj => obj.name === processCodeItem?.label)

//       if (!hasProcess) return
//       if (!theValue) return

//       return {
//         theProcessMaster: hasProcess,
//         date: toUtc(theValue),
//       }
//     })
//     .filter(Boolean)
//     .sort((a: any, b: any) => {
//       return a.date && b.date && new Date(a.date).getTime() - new Date(b.date).getTime()
//     })

//   return list
// }
