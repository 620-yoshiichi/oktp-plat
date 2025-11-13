import React from 'react'

export default function Page() {
  return <div>Page</div>
}

// import {processNameStr} from '@app/(apps)/ucar/(constants)/processesMaster'
// import Cell from '@app/(apps)/ucar/(pages)/zaikoTairyu/Cell'
// import ZaikoTairyuPageFilter from '@app/(apps)/ucar/(pages)/zaikoTairyu/ZaikoTairyuPageFilter'

// import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
// import {useRawSql} from '@cm/class/SqlBuilder/useRawSql'
// import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
// import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
// import Redirector from '@cm/components/utils/Redirector'
// import {shorten} from '@cm/lib/methods/common'
// import {HREF} from '@cm/lib/methods/urls'
// import prisma from 'src/lib/prisma'
// import React from 'react'

// export type ZaikoTairyuUcarRecrod = {
//   number98
//   Assessment_ID
//   NO_FRAME
//   MJ_SYAMEI
//   DD_SIIRE
//   CD_ZAIKOTEN
//   storeName
//   LastProcessName
//   LastProcessDate
//   LastProcessColor
//   LastProcessMasterId
//   days_since_receipt
//   KI_HANKAKA
// }
// const keikaNissuMaster = {
//   30: {label: '〜30日', ucarList: []},
//   60: {label: '〜60日', ucarList: []},
//   90: {label: '〜90日', ucarList: []},
//   120: {label: '〜120日', ucarList: []},
//   140: {label: '〜140日', ucarList: []},
//   141: {label: '141日以上', ucarList: []},
// }
// const cellStyle = {maxWidth: 80, minWidth: 80}
// export default async function ZaikoTairyu(props) {
//   const query = await props.searchParams

//   const selected = query.targetProcessIds ? String(query.targetProcessIds).split(`,`) : []

//   if (selected.length === 0) {
//     const defaultProcessList: processNameStr[] = ['検査終了', '写真終了', 'GAZOO', '拠点受取']
//     const defaultProcessIds = await prisma.ucarProcessMaster.findMany({
//       where: {name: {in: defaultProcessList}},
//     })
//     const newSelected = defaultProcessIds.map(d => d.id.toString())

//     return <Redirector {...{redirectPath: HREF(`/ucar/zaikoTairyu`, {targetProcessIds: newSelected.join(`,`)}, query)}} />
//   }

//   const now = new Date()
//   const {rows} = await getRecords({selected})
//   const now2 = new Date()
//   const diffInSeconds = (now2.getTime() - now.getTime()) / 1000
//   console.log(`diffInSeconds`, diffInSeconds)
//   const ucars = rows as ZaikoTairyuUcarRecrod[]

//   const relatedStoreCodeUniqueList = [...new Set(ucars.map(ucar => Number(ucar.CD_ZAIKOTEN)))]

//   const stores = await prisma.store.findMany({
//     where: {code: {in: relatedStoreCodeUniqueList}},
//     orderBy: {name: 'asc'},
//   })

//   const ucarProcessMaster = await prisma.ucarProcessMaster.findMany({orderBy: {sortOrder: 'asc'}})

//   return (
//     <div className={`p-4`}>
//       <C_Stack>
//         <ZaikoTairyuPageFilter {...{ucarProcessMaster}} />
//         <R_Stack className={` items-start`}>
//           {CsvTable({
//             records: [
//               ...Object.entries(keikaNissuMaster).map(([keikaNissuInt, data], i) => {
//                 const {label, ucarList} = data

//                 const prevKeikaNissu = Number(Object.entries(keikaNissuMaster)[i - 1]?.[0] ?? 0)
//                 const currentKeikaNissu = Number(keikaNissuInt)

//                 const ucarsOnThisNissu = ucars.filter(
//                   ucar => Number(ucar.days_since_receipt) >= prevKeikaNissu && Number(ucar.days_since_receipt) < currentKeikaNissu
//                 )

//                 return {
//                   csvTableRow: [
//                     {cellValue: label, style: cellStyle},
//                     ...stores.map(store => {
//                       const ucarList = ucarsOnThisNissu.filter(ucar => Number(ucar.CD_ZAIKOTEN) === store.code)

//                       return {
//                         label: <small>{shorten(store?.name, 8)}</small>,
//                         cellValue: <Cell {...{ucarList}} />,
//                         style: cellStyle,
//                         className: 'text-center',
//                       }
//                     }),

//                     {
//                       label: '全店舗',
//                       cellValue: <Cell {...{ucarList: ucarsOnThisNissu}} />,
//                       style: cellStyle,
//                       className: 'text-center',
//                     },
//                   ],
//                 }
//               }),

//               {
//                 style: {background: `#f0f0f0`},
//                 csvTableRow: [
//                   {cellValue: '合計', style: cellStyle},
//                   ...stores.map(store => {
//                     const ucarList = ucars.filter(ucar => Number(ucar.CD_ZAIKOTEN) === store.code)
//                     return {
//                       label: <small>{shorten(store?.name, 8)}</small>,
//                       cellValue: <Cell {...{ucarList}} />,
//                       style: {maxWidth: 80, minWidth: 80},
//                       className: 'text-center',
//                     }
//                   }),
//                   {
//                     label: '全店舗',
//                     cellValue: <Cell {...{ucarList: ucars}} />,
//                     style: cellStyle,
//                     className: 'text-center',
//                   },
//                 ],
//               },
//             ],
//           }).WithWrapper()}
//         </R_Stack>
//       </C_Stack>
//     </div>
//   )
// }

// const getRecords = async ({selected}) => {
//   const upmWhereStr = selected.length ? `and (${selected.map(id => `LastProcess."processMasterId" = ${id}`).join(` or `)})` : ``

//   const {rows} = await useRawSql({
//     sql: sql`
//     with "ProcessByUcarId" as (
//       select
//       up."ucarId",
//       up."ucarProcessMasterId" as "processMasterId",
//       up."date" as "processDate",
//       upm."name" as "processName",
//       upm."color" as "processColor",
//       row_number() over (partition by up."ucarId" order by up."date" desc) as rn
//       from "UcarProcess" up
//       left join "UcarProcessMaster" upm on up."ucarProcessMasterId" = upm."id"
//     )

//       SELECT
//       s."code" as "storeCode",
//       s."name" as "storeName",
//       u."Assessment_ID",
//       u."number98",
//       k."NO_FRAME",
//       k."MJ_SYAMEI",
//       k."DD_SIIRE",
//       k."KI_HANKAKA",
//       z."CD_ZAIKOTEN",
//       LastProcess."processMasterId" as "LastProcessMasterId",
//       LastProcess."processName" as "LastProcessName",
//       LastProcess."processDate" as "LastProcessDate",
//       LastProcess."processColor" as "LastProcessColor",
//       EXTRACT(DAY FROM (CURRENT_DATE - LastProcess."processDate")) AS "days_since_receipt",
//       u.id

//       FROM "OldCars_Base" k
//         LEFT JOIN "ZAIKO_Base" z on z."NO_FRAME" = k."NO_FRAME" and z."NO_SYARYOU" = k."NO_SYARYOU" and z."NO_SIRETOSE" = k."NO_SIRETOSE"
//             LEFT JOIN "Store" s ON CAST(z."CD_ZAIKOTEN" AS INTEGER) = s."code"
//         LEFT JOIN "Ucar" u on u."Barracks"=k."NO_SYADAIBA" and u."number"=k."NO_SIRETOSE"
//             LEFT join "ProcessByUcarId" as LastProcess on LastProcess."ucarId" = u."id" and LastProcess.rn = 1

//       where 1=1
//       and LastProcess."processName" is not null --最終処理がある
//       ${upmWhereStr} --最終工程で絞る
//       and k."KI_HANKAKA" is null   --未販売
//       and u.id is not null --車両が存在する
//       ORDER BY  EXTRACT(DAY FROM (CURRENT_DATE - LastProcess."processDate")) DESC
//       --LIMIT 50
//     `,
//   })

//   return {rows}
// }
