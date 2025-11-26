// 'use client'
// import {fetchBigQuery} from '@app/api/google/big-query/BigQueryClientOperator'
// import {BQ_parser} from '@app/api/google/big-query/bigQueryParser'
// import {formatDate} from '@cm/class/Days/date-utils/formatters'
// import {sql} from '@cm/class/SqlBuilder/SqlBuilder'

// import {Button} from '@cm/components/styles/common-components/Button'
// import {C_Stack} from '@cm/components/styles/common-components/common-components'
// import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
// import {Paper} from '@cm/components/styles/common-components/paper'
// import {useGlobalModalForm} from '@cm/components/utils/modal/useGlobalModalForm'
// import useGlobal from '@cm/hooks/globalHooks/useGlobal'
// import useLocalLoading from '@cm/hooks/globalHooks/useLocalLoading'
// import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
// import {atomTypes} from '@cm/hooks/useJotai'

// import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
// import {Prisma, Ucar} from '@prisma/client'

// export default function useSateiConnection() {
//   const GMF = useGlobalModalForm<atomTypes[`sateiConnectionGMF`]>(`sateiConnectionGMF`, null, {
//     mainJsx: props => {
//       const {LocalLoader, toggleLocalLoading} = useLocalLoading()
//       const {toggleLoad} = useGlobal()
//       const {newCar, sateiNoList = []}: any = props.GMF_OPEN
//       const {data: Ucar} = useDoStandardPrisma(`ucar`, `findMany`, {
//         where: {newCarId: newCar.id},
//       })

//       GMF.GMF_OPEN
//       const setsateiNoList = newList =>
//         props.setGMF_OPEN(prev => {
//           return {...prev, sateiNoList: newList}
//         })

//       const FetchSateiNumberBtn = () => {
//         return (
//           <C_Stack>
//             <Button
//               {...{
//                 onClick: async () => {
//                   const rows = await toggleLocalLoading(async () => {
//                     const rows = await fetchBigQuery({
//                       datasetId: `OrdersDB`,
//                       tableId: `Orders_Base`,
//                       method: `GET`,
//                       args: {
//                         sqlString: sql`
//                           SELECT NO_SATEISYO
//                           FROM okayamatoyopet.OrdersDB.Satei_Base
//                           where  APPINDEX = '${newCar.APPINDEX}'
//                             AND NO_SATEISYO<>''
//                             AND NO_SATEISYO IS NOT NULL
//                           `,
//                       },
//                     })
//                     return rows
//                   })

//                   if (rows) {
//                     setsateiNoList(rows.map(row => row.NO_SATEISYO))
//                   }
//                 },
//               }}
//             >
//               ①査定番号取得
//             </Button>
//             <div>
//               <small>
//                 ai21注文情報に記載されている査定Noから、AI査定データと連携し情報を取得します。
//                 <br />
//                 <span className={` text-error-main font-bold`}>注文書記載の査定Noが間違っている場合</span>
//                 や、<span className={`text-error-main font-bold`}>査定データが見つからない場合</span>
//                 は、
//                 <span className={`text-base font-bold text-blue-800`}>正しい査定Noを手動で入力してください。</span>
//               </small>
//             </div>
//           </C_Stack>
//         )
//       }

//       return (
//         <>
//           <LocalLoader />
//           <C_Stack>
//             <div>
//               <span>注文番号: </span>
//               <strong>{newCar.NO_CYUMON}</strong>
//             </div>
//             <section>
//               <Paper>
//                 <FetchSateiNumberBtn />
//               </Paper>
//             </section>
//             <section>
//               <Paper>
//                 <C_Stack>
//                   <div className={`min-h-[200px] border  p-2`}>
//                     {CsvTable({
//                       records: new Array(sateiNoList.length + 1).fill(0).map((_, i) => {
//                         const ucar = Ucar?.find(ucar => {
//                           return ucar.Assessment_ID === sateiNoList[i]
//                         }) as Ucar

//                         return {
//                           csvTableRow: [
//                             {
//                               label: `査定No${i + 1}`,
//                               cellValue: (
//                                 <input
//                                   {...{
//                                     className: `border rounded p-1 `,
//                                   }}
//                                   type="text"
//                                   placeholder="査定Noを入力してください"
//                                   value={sateiNoList[i] ?? ''}
//                                   onChange={e => {
//                                     const newSateiNoList = [...sateiNoList]
//                                     newSateiNoList[i] = e.target.value
//                                     setsateiNoList(newSateiNoList)
//                                   }}
//                                 />
//                               ),
//                             },
//                             {
//                               label: `車名`,
//                               cellValue: (
//                                 <input
//                                   {...{
//                                     className: `border rounded p-1 `,
//                                   }}
//                                   type="text"
//                                   placeholder="査定Noを入力してください"
//                                   value={sateiNoList[i] ?? ''}
//                                   onChange={e => {
//                                     const newSateiNoList = [...sateiNoList]
//                                     newSateiNoList[i] = e.target.value
//                                     setsateiNoList(newSateiNoList)
//                                   }}
//                                 />
//                               ),
//                             },
//                             {label: `車名`, cellValue: ucar && formatDate(ucar.Model_name)},
//                             {label: `ブランド`, cellValue: ucar && formatDate(ucar.brand_name)},
//                             {label: `車庫`, cellValue: ucar && formatDate(ucar.Barracks)},
//                             {label: `年式`, cellValue: ucar && formatDate(ucar.Model_year)},
//                             {
//                               label: `連携解除`,
//                               cellValue: ucar && (
//                                 <Button
//                                   {...{
//                                     onClick: async () => {
//                                       toggleLoad(async () => {
//                                         await doStandardPrisma(`ucar`, `update`, {
//                                           where: {id: ucar.id},
//                                           data: {newCarId: null},
//                                         })
//                                         setsateiNoList(sateiNoList.filter(d => d !== ucar.sateiID))
//                                       })
//                                     },
//                                   }}
//                                 >
//                                   解除
//                                 </Button>
//                               ),
//                             },
//                           ],
//                         }
//                       }),
//                     }).WithWrapper({size: `lg`})}
//                   </div>
//                 </C_Stack>
//               </Paper>
//             </section>

//             <section>
//               <Paper>
//                 <C_Stack>
//                   <Button
//                     {...{
//                       active: sateiNoList.length > 0,
//                       onClick: async () => {
//                         toggleLoad(async () => {
//                           const rows = await fetchBigQuery({
//                             datasetId: `Ucar_QR`,
//                             tableId: `AI_satei`,
//                             method: `GET`,
//                             args: {
//                               sqlString: sql`
//                             SELECT
//                               Assessment_ID,
//                               Model_name,
//                               brand_name,
//                               Common_name_model,
//                               Barracks,
//                               Vehicle_length,
//                               Vehicle_width,
//                               Vehicle_height,
//                               Model_year,
//                               ${BQ_parser.castStrToDate(`Scheduled_arrival_date`)} AS Scheduled_arrival_date
//                             FROM okayamatoyopet.Ucar_QR.AI_satei
//                             where  Assessment_ID IN (${sateiNoList.map(d => `'${d}'`).join(`,`)})
//                         `,
//                             },
//                           })

//                           await Promise.all(
//                             rows.map(async row => {
//                               const payload = {
//                                 Assessment_ID: row.Assessment_ID,
//                                 Model_name: row.Model_name,
//                                 brand_name: row.brand_name,
//                                 Common_name_model: row.Common_name_model,
//                                 Barracks: row.Barracks,
//                                 Vehicle_length: Number(row.Vehicle_length),
//                                 Vehicle_width: Number(row.Vehicle_width),
//                                 Vehicle_height: Number(row.Vehicle_height),
//                                 Model_year: row.Model_year,
//                                 Scheduled_arrival_date: BQ_parser.parseDate(row.Scheduled_arrival_date),
//                                 newCarId: newCar.id,
//                                 userId: newCar.User.id,
//                                 storeId: newCar.Store.id,
//                               }
//                               const args: Prisma.UcarUpsertArgs = {
//                                 where: {sateiID: row.Assessment_ID},
//                                 create: payload,
//                                 update: payload,
//                               }
//                               const res = await doStandardPrisma(`ucar`, `upsert`, args)
//                             })
//                           )
//                         })
//                       },
//                     }}
//                   >
//                     ②査定データ紐付け
//                   </Button>
//                   <div>
//                     <small>
//                       上記の査定番号が正しいことを確認して、データ紐付けを実施してください。
//                       <br />
//                       本アプリに査定データの「入庫日情報」を連携します。
//                     </small>
//                   </div>
//                 </C_Stack>
//               </Paper>
//             </section>
//           </C_Stack>
//         </>
//       )
//     },
//   })

//   return {
//     GMF,
//   }
// }
