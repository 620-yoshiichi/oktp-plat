// 'use client'
// import {getQueryByMonthType, Month, ProgressReportRecord} from '@app/(apps)/newCar/class/ProgressReport/(lib)/getWheres'
// import React, {CSSProperties} from 'react'

// import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

// import {Alert} from '@cm/components/styles/common-components/Alert'
// import {TableBordered, TableWrapper} from '@cm/components/styles/common-components/Table'

// import { formatDate} from '@cm/class/Days'

// import {TableHint} from '@app/(apps)/newCar/class/ProgressReport/TableHint'
// import {bodyRecordsType, CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
// import useGlobal from '@cm/hooks/globalHooks/useGlobal'
// import {HREF} from '@cm/lib/methods/urls'
// import {Calc} from '@cm/class/Calc'
// export default function ProgressReportClient(props: {
//   months: Month[]
//   ProgressReportRecords: ProgressReportRecord[]
//   queryByMonthList: getQueryByMonthType[]
// }) {
//   const {query, router} = useGlobal()
//   const {ProgressReportRecords, months, queryByMonthList} = props

//   const headerRecords: bodyRecordsType = [
//     {
//       csvTableRow: [
//         {cellValue: ``},
//         {cellValue: `出荷`, colSpan: 2},

//         {cellValue: `声かけ(2ヶ月前活動)`, colSpan: 3},

//         {cellValue: `書類（1ヶ月前活動）`, colSpan: 3},

//         // {cellValue: `登録`, colSpan: 4},
//         // {cellValue: `配送希望日`, colSpan: 3},
//         {cellValue: `納車日（振当時活動）`, colSpan: 4},
//       ].map(d => ({...d, style: {color: `black`}})),
//     },
//     {
//       csvTableRow: [
//         {cellValue: `月`},
//         {cellValue: `振当`},
//         {cellValue: `生産予定`},

//         //m2
//         {cellValue: `対象\n(達成率)`},
//         {cellValue: `済み`},
//         {cellValue: `未活動`},

//         // m1
//         {cellValue: `対象\n(達成率)`},
//         {cellValue: `済み`},
//         {cellValue: `未活動`},

//         // // toroku
//         // {cellValue: `対象\n(達成率)`},
//         // {cellValue: `申請承諾`},
//         // {cellValue: `未申請`},
//         // {cellValue: `実績`},

//         // // haisou
//         // {cellValue: `対象\n(達成率)`},
//         // {cellValue: `入力済み`},

//         // {cellValue: `達成率`},

//         {cellValue: `対象\n(達成率)`},
//         {cellValue: `済み`},
//         {cellValue: `未活動`},

//         {cellValue: `実績`},
//       ],
//     },
//   ]

//   const CalcNumber =
//     (key = `FR_THIS_MONTH`, showRatioBg?: any) =>
//     ({recordsOnMonth, month}) => {
//       const theQuery = queryByMonthList.find(d => formatDate(d.month, 'YYYY-MM') === formatDate(month, 'YYYY-MM'))
//       const cellValue = Number(recordsOnMonth.find(r => r.key === key)?.count ?? 0)

//       const getLinerBgStyle = () => {
//         const {doneKey = 'm1_Set', targetKey = 'm1_target'} = showRatioBg ?? {}
//         const done = Number(recordsOnMonth.find(r => r.key === doneKey)?.count ?? 0)
//         const target = Number(recordsOnMonth.find(r => r.key === targetKey)?.count ?? 0)
//         const ratio = target ? Calc.round((done / target) * 100) : 0
//         const bgStyle: CSSProperties = {
//           background: `linear-gradient(to right, rgba(34, 152, 255, 0.323) ${ratio}%, transparent ${ratio}%)`,
//         }
//         return {bgStyle, ratio}
//       }
//       const {ratio, bgStyle} = getLinerBgStyle()
//       const result = {
//         cellValue: showRatioBg ? (
//           <div className={` text-center leading-4`}>
//             <div>{cellValue}</div>
//             <small>({ratio}%)</small>
//           </div>
//         ) : (
//           cellValue
//         ),
//         className: `min-w-[50px] text-right `,
//         style: showRatioBg ? bgStyle : undefined,
//       }

//       if (theQuery && cellValue > 0) {
//         const onClick = () => {
//           const progressReportQ = [formatDate(month, 'YYYY-MM'), key].join('__')

//           const newQuery = {
//             progressReportQ,
//           }
//           const href = HREF(`/newCar/newCar`, newQuery, query)
//           router.push(href)
//         }
//         result[`onClick`] = onClick
//         result.className += ` onHover underline `
//       }

//       return result
//     }

//   const CalcAchievementRatio =
//     (doneKey, targetKey) =>
//     ({recordsOnMonth, month}) => {
//       const done = Number(recordsOnMonth.find(r => r.key === doneKey)?.count ?? 0)
//       const target = Number(recordsOnMonth.find(r => r.key === targetKey)?.count ?? 0)
//       const cellValue = target ? Calc.round((done / target) * 100) + '%' : '-'

//       return {cellValue, className: `min-w-[50px] text-right `}
//     }

//   const keys = [
//     CalcNumber(`FR_THIS_MONTH`),
//     CalcNumber(`CUSTOM_DD_SEISANYOTEI`),

//     // //2ヶ月前
//     CalcNumber(`m2_target`, {doneKey: `m2_Set`, targetKey: `m2_target`}),
//     CalcNumber(`m2_Set`),
//     CalcNumber(`m2_remaining`),
//     // CalcAchievementRatio(`m2_Set`, `m2_target`),

//     // // 1ヶ月前
//     CalcNumber(`m1_target`, {doneKey: `m1_Set`, targetKey: `m1_target`}),
//     CalcNumber(`m1_Set`),
//     CalcNumber(`m1_remaining`),
//     // CalcAchievementRatio(`m1_Set`, `m1_target`),

//     // // // 登録
//     // // ['toroku_target'],
//     // // ['toroku_Set'],
//     // // [`toroku_remaining`],
//     // // ['toroku_Achieved'],

//     // // // 配送
//     // // ['haisou_target'],
//     // // ['haisou_Set'],
//     // // [`haisou_remaining`],

//     // // 納車
//     CalcNumber(`nousha_target`, {doneKey: `nousha_Set`, targetKey: `nousha_target`}),
//     CalcNumber(`nousha_Set`),
//     CalcNumber(`nousha_remaining`),
//     // CalcAchievementRatio(`nousha_Set`, `nousha_target`),
//     CalcNumber(`nousha_Avhieved`),
//   ]

//   const bodyRecords: bodyRecordsType = [
//     ...months.map((month, monthIdx) => {
//       const isThisMonth = formatDate(month, 'YYYY-MM') === formatDate(new Date(), 'YYYY-MM')
//       const recordsOnMonth = ProgressReportRecords.filter(d => {
//         return formatDate(d.month, 'YYYY-MM') === formatDate(month, 'YYYY-MM')
//       })

//       return {
//         className: isThisMonth ? 'bg-yellow-300' : '',
//         csvTableRow: [
//           {cellValue: formatDate(month, 'YYYY-MM')},
//           ...keys.map((getCellProps, idx) => {
//             return getCellProps({recordsOnMonth, month})
//           }),
//         ],
//       }
//     }),
//   ]

//   const stylesInColumns = {
//     4: {style: {color: '#3e5fcd'}},
//     5: {style: {color: '#cd3e4a', fontSize: 20}},

//     7: {style: {color: '#3e5fcd'}},
//     8: {style: {color: '#cd3e4a', fontSize: 20}},

//     10: {style: {color: '#3e5fcd'}},
//     11: {style: {color: '#cd3e4a', fontSize: 20}},

//     12: {style: {color: '#2c8221'}},
//   }
//   const TABLE = CsvTable({headerRecords, bodyRecords, stylesInColumns})

//   return (
//     <>
//       <C_Stack>
//         <section>
//           <C_Stack>
//             <R_Stack className={` justify-between`}>
//               <R_Stack>
//                 <h1>月別集計</h1>
//                 <TableHint />
//               </R_Stack>
//               <R_Stack>
//                 <div>色分け</div>
//                 <Alert color={`red`}>未活動データ</Alert>
//                 <Alert color={`blue`}>本アプリでの入力データ</Alert>
//                 <Alert color={`green`}>ai21の実績データ</Alert>
//               </R_Stack>
//             </R_Stack>

//             <TableWrapper>
//               <TableBordered {...{size: `lg`}}>
//                 {TABLE.Thead()}
//                 {TABLE.Tbody()}
//               </TableBordered>
//             </TableWrapper>
//           </C_Stack>
//         </section>
//       </C_Stack>
//     </>
//   )
// }
