// import React from 'react'

// import {PencilSquareIcon} from '@heroicons/react/20/solid'
// import {SectionHeader} from '@app/(apps)/ucar/(pages)/paperProcess/Summay/PaperProcessSummary'
// import EmptyPlaceholder from '@cm/components/utils/loader/EmptyPlaceHolder'
// import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
// import {formatDate} from '@cm/class/Days/date-utils/formatters'
// import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
// import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'

// export default function UcarNotesList({UcarData, mutateRecords}) {
//   // const selectedUcarNotesGMF = useSelectedUcarNotesGMF()
//   return (
//     <div className={` flex h-full  items-start`} {...{style: {width: 300}}}>
//       <div>
//         <section>
//           <button>
//             <SectionHeader label={`不備履歴`} Icon={PencilSquareIcon} />
//             <small>
//               <div>
//                 {UcarData.UcarPaperWorkNotes.length === 0 ? (
//                   <EmptyPlaceholder className={`!text-xs`}>データがありません</EmptyPlaceholder>
//                 ) : (
//                   <div>
//                     {CsvTable({
//                       records: UcarData.UcarPaperWorkNotes.map(d => {
//                         const codeItem = UCAR_CODE.PAPER_WORK_NOTE_TYPES.byCode(d.type)
//                         return {
//                           csvTableRow: [
//                             //
//                             {
//                               label: undefined,
//                               cellValue: (
//                                 <small className={` leading-3`}>
//                                   <div>{formatDate(d.createdAt, `short`)}</div>
//                                   <div>{d?.User?.name}</div>
//                                   <IconBtn color={codeItem?.color}>{codeItem?.label}</IconBtn>
//                                 </small>
//                               ),
//                               style: {width: 80},
//                             },

//                             {label: undefined, cellValue: d.content, style: {width: 300}},
//                           ],
//                         }
//                       }),
//                     }).WithWrapper({className: `max-h-[100px]  !text-xs !rounded-none [&_td]:text-xs`})}
//                   </div>
//                 )}
//               </div>
//             </small>
//           </button>
//         </section>
//       </div>
//     </div>
//   )
// }
