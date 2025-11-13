// 'use client'
// import {ZaikoTairyuUcarRecrod} from '@app/(apps)/ucar/(pages)/zaikoTairyu/page'
// import { formatDate } from '@cm/class/Days/date-utils/formatters'
// import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
// import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
// import useModal from '@cm/components/utils/modal/useModal'
// import React from 'react'

// export default function Cell({ucarList}: {ucarList: ZaikoTairyuUcarRecrod[]}) {
//   const {Modal, setopen, open} = useModal()

//   const count = ucarList.length
//   return (
//     <>
//       <button
//         {...{
//           className: count ? '' : ' opacity-20',
//           onClick: data => {
//             setopen({ucarList})
//           },
//         }}
//       >
//         {ucarList.length}
//       </button>

//       <Modal>
//         {CsvTable({
//           records: ucarList.map(ucar => {
//             const {
//               number98,
//               Assessment_ID,
//               NO_FRAME,
//               MJ_SYAMEI,
//               DD_SIIRE,
//               CD_ZAIKOTEN,
//               storeName,
//               LastProcessName,
//               LastProcessDate,
//               LastProcessColor,
//               LastProcessMasterId,
//               days_since_receipt,
//               KI_HANKAKA,
//             } = ucar

//             return {
//               csvTableRow: [
//                 {label: '査定ID', cellValue: Assessment_ID},
//                 {label: '98番号', cellValue: number98},
//                 {label: 'フレーム', cellValue: NO_FRAME},
//                 {label: '車名', cellValue: MJ_SYAMEI},
//                 {label: '仕入日', cellValue: DD_SIIRE},
//                 {label: '在庫店舗コード', cellValue: CD_ZAIKOTEN},
//                 {label: '在庫店舗名', cellValue: storeName},
//                 {label: '販売価格', cellValue: KI_HANKAKA},
//                 {label: '最終処理名', cellValue: <IconBtn color={LastProcessColor}>{LastProcessName}</IconBtn>},
//                 {label: '最終処理日', cellValue: formatDate(LastProcessDate)},
//                 {label: '最終処理日からの経過日数', cellValue: days_since_receipt},
//               ],
//             }
//           }),
//         }).WithWrapper({className: 'max-h-[60vh]'})}
//       </Modal>
//     </>
//   )
// }
