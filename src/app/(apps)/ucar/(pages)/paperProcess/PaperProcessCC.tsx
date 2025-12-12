// 'use client'

// import React from 'react'
// import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'
// import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'

// import useUcarDetailUpdatorGMF from '@app/(apps)/ucar/(parts)/templateHooks/useUcarDetailUpdatorGMF'
// import {shorten} from '@cm/lib/methods/common'
// import EmptyPlaceholder from '@cm/components/utils/loader/EmptyPlaceHolder'
// import TaxProcessSummary from '@app/(apps)/ucar/(pages)/paperProcess/Summay/TaxProcessSummary'
// import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
// export default function PaperProcessCC({ucar}) {
//   const GMF_UcrDetailUpdater = useUcarDetailUpdatorGMF()

//   const ucarInst = new UcarCL(ucar)

//   const openEditModal = (sateiID: string) => {
//     GMF_UcrDetailUpdater.setGMF_OPEN({sateiID: sateiID})
//   }

//   return (
//     <>
//       <div className={`p-4`}>
//         {CsvTable({
//           records: ucar.map(car => {
//             const garageLocation = car.AppliedUcarGarageSlot?.UcarGarageSlotMaster?.UcarGarageLocationMaster?.name
//             return {
//               csvTableRow: [
//                 //

//                 {
//                   label: '車両情報',
//                   cellValue: (
//                     <C_Stack className={`gap-0`}>
//                       <R_Stack className={`gap-0`}>
//                         <small>98番号:</small>
//                         <div>{car?.Number98?.number ?? <EmptyPlaceholder />}</div>
//                       </R_Stack>
//                       <R_Stack className={`gap-0`}>
//                         <small>査定No.:</small>
//                         <div>
//                           <button
//                             {...{
//                               className: `text-blue-500`,
//                               onClick: () => openEditModal(car.sateiID),
//                             }}
//                           >
//                             {shorten(car.Assessment_ID, 10, `...`)}
//                           </button>
//                         </div>
//                       </R_Stack>

//                       <R_Stack className={`gap-0`}>
//                         <small>店舗:</small>
//                         {car?.Store?.name || <EmptyPlaceholder />}
//                       </R_Stack>
//                       <R_Stack className={`gap-0`}>
//                         <small>スタッフ:</small>
//                         {car.User?.name || <EmptyPlaceholder />}
//                       </R_Stack>
//                       <R_Stack className={`gap-0`}>
//                         <small>車名:</small>
//                         {car.Model_name || <EmptyPlaceholder />}
//                       </R_Stack>
//                       <R_Stack className={`gap-0`}>
//                         <small>お客様:</small>
//                         <span>{car.customerName || <EmptyPlaceholder />}</span>
//                       </R_Stack>
//                       <R_Stack className={`gap-0`}>
//                         <small>プレート:</small>
//                         <span>{ucarInst.notation.plate || <EmptyPlaceholder />}</span>
//                       </R_Stack>
//                       <R_Stack className={`gap-0`}>
//                         <small>車台番号:</small>
//                         {car.Barracks || <EmptyPlaceholder />}
//                       </R_Stack>
//                     </C_Stack>
//                   ),
//                 },

//                 // {
//                 //   label: '書類状況処理',
//                 //   cellValue: (
//                 //     <PaperProcessSummary
//                 //       {...{
//                 //         car,
//                 //         garageLocation,
//                 //         mutateRecords: () => undefined,
//                 //       }}
//                 //     />
//                 //   ),
//                 // },
//                 {
//                   label: '自動車税処理',
//                   cellValue: <TaxProcessSummary {...{car, garageLocation}} />,
//                 },

//                 //===========

//                 {label: '本部共有連絡事項', cellValue: car.remarksHq},
//               ].map(d => {
//                 return {
//                   ...d,
//                   style: {fontSize: 13},
//                 }
//               }),
//             }
//           }),
//         }).WithWrapper({
//           size: `base`,
//           className: `t-paper max-h-[80vh] max-w-[98vw] mx-auto`,
//         })}
//       </div>
//     </>
//   )
// }
