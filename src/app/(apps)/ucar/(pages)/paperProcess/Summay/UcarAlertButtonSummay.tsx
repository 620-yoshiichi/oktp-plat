import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'


import useSelectedUcarNotesGMF from '@app/(apps)/ucar/(parts)/templateHooks/useSelectedUcarNotesGMF'
import {Fragment} from 'react'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import EmptyPlaceholder from '@cm/components/utils/loader/EmptyPlaceHolder'
import {ScrollText} from 'lucide-react'

import Coloring from '@cm/lib/methods/Coloring'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'
import ShadPopover from '@cm/shadcn/ui/Organisms/ShadPopover'

export const FubiActionTrigger = ({UcarData, mutateRecords}: {UcarData: any; mutateRecords: any}) => {
  const selectedUcarNotesGMF = useSelectedUcarNotesGMF()
  return (
    <C_Stack className={` justify-between `} onClick={() => selectedUcarNotesGMF.setGMF_OPEN({UcarData, mutateRecords})}>
      {UCAR_CODE.PAPER_WORK_NOTE_TYPES.array.map((d, i) => {
        const {code: value} = d
        const NOTE_TYPE = UCAR_CODE.PAPER_WORK_NOTE_TYPES.byCode(value)
        const list = UcarData.UcarPaperWorkNotes?.filter(note => note.type === value)

        const remainCount = list.filter(note => !note.resolvedAt).length
        const totalCount = list.length

        const PopOverBody = () => {
          return (
            <div className={`w-full`}>
              <Coloring mode={remainCount ? 'bg' : 'text'} color={remainCount ? NOTE_TYPE?.color : ''}>
                <R_Stack key={i} className={` flex-nowrap`}>
                  <div className={`min-w-[40px] text-[11px]  `}>
                    <R_Stack className={`gap-0.5 `}>
                      <ScrollText className={`w-3 h-3`} />
                      <span>{NOTE_TYPE?.label}</span>
                    </R_Stack>
                  </div>
                  <span className={`${remainCount ? 'font-bold ' : 'opacity-20 text-xs'} gap-0  rounded-full  `}>
                    <span>
                      {remainCount} / {totalCount}
                    </span>
                  </span>
                </R_Stack>
              </Coloring>
            </div>
          )
        }

        return (
          <Fragment key={i}>
            <ShadPopover {...{Trigger: <PopOverBody />}}>
              <div>
                {totalCount > 0 ? (
                  <div>
                    {CsvTable({
                      records: list.map(d => {
                        const codeItem = UCAR_CODE.PAPER_WORK_NOTE_TYPES.byCode(d.type)
                        return {
                          csvTableRow: [
                            //

                            {label: '申請区分', cellValue: codeItem?.label},
                            {label: '登録日', cellValue: formatDate(d.createdAt, `short`)},
                            {label: '登録者', cellValue: d?.User?.name},
                            {label: '内容', cellValue: d.content},
                            {label: '解決日', cellValue: formatDate(d.resolvedAt, `short`)},
                          ],
                        }
                      }),
                    }).WithWrapper({className: `max-h-[100px]  !text-xs !rounded-none [&_td]:text-xs`})}
                  </div>
                ) : (
                  <EmptyPlaceholder />
                )}
              </div>
            </ShadPopover>
          </Fragment>
        )
      })}
    </C_Stack>
  )
}

// export default function UcarAlertButtonSummay({UcarData, mutateRecords}) {
//   const statuses = getCurrentStatuses({UcarData})
//   const selectedUcarNotesGMF = useSelectedUcarNotesGMF()

//   return (
//     <div>
//       <C_Stack className={` justify-between `}>
//         <R_Stack className={` justify-between  flex-nowrap`}>
//           <C_Stack className={` justify-center gap-1`} style={{height: UCAR_TABLE_ROW_HEIGHT}}>
//             {statuses.map((status, i) => {
//               const active = !!status.isTrue(UcarData)

//               const PopOverBtn = (
//                 <IconBtn className={cl(`w-[70px] text-center p-0.5 text-xs`)} active={active} key={i} color={status.color}>
//                   {status.value}
//                 </IconBtn>
//               )

//               if (status.popOver) {
//                 return (
//                   <MyPopover {...{button: <button>{PopOverBtn}</button>}} mode={`click`}>
//                     <Paper>{status.popOver()}</Paper>
//                   </MyPopover>
//                 )
//               } else {
//                 return PopOverBtn
//               }
//             })}
//           </C_Stack>

//           <C_Stack
//             className={` justify-between h-full gap-2`}
//             style={{height: UCAR_TABLE_ROW_HEIGHT}}
//             onClick={() => selectedUcarNotesGMF.setGMF_OPEN({UcarData, mutateRecords})}
//           >
//             {UCAR_CODE.PAPER_WORK_NOTE_TYPES.array.map((d, i) => {
//               const {code: value} = d
//               const NOTE_TYPE = UCAR_CODE.PAPER_WORK_NOTE_TYPES.byCode(value)
//               const list = UcarData.UcarPaperWorkNotes?.filter(note => note.type === value)

//               const remainCount = list.filter(note => !note.resolvedAt).length
//               const totalCount = list.length

//               const PopOverBody = () => {
//                 return (
//                   <Coloring mode={remainCount ? 'bg' : 'text'} color={remainCount ? NOTE_TYPE?.color : ''}>
//                     <R_Stack key={i} className={` flex-nowrap`}>
//                       <div className={`min-w-[40px] text-[11px]  `}>
//                         <R_Stack className={`gap-0.5 `}>
//                           <ScrollText className={`w-3 h-3`} />
//                           <span>{NOTE_TYPE?.label}</span>
//                         </R_Stack>
//                       </div>
//                       <span className={`${remainCount ? 'font-bold ' : 'opacity-20 text-xs'} gap-0  rounded-full w-[30px]`}>
//                         <span>
//                           {remainCount} / {totalCount}
//                         </span>
//                       </span>
//                     </R_Stack>
//                   </Coloring>
//                 )
//               }

//               return (
//                 <Fragment key={i}>
//                   <ShadPopover {...{Trigger: <PopOverBody />}}>
//                     <div>
//                       {totalCount > 0 ? (
//                         <div>
//                           {CsvTable({
//                             records: list.map(d => {
//                               const codeItem = UCAR_CODE.PAPER_WORK_NOTE_TYPES.byCode(d.type)
//                               return {
//                                 csvTableRow: [
//                                   //

//                                   {label: '申請区分', cellValue: codeItem?.label},
//                                   {label: '登録日', cellValue: formatDate(d.createdAt, `short`)},
//                                   {label: '登録者', cellValue: d?.User?.name},
//                                   {label: '内容', cellValue: d.content},
//                                   {label: '解決日', cellValue: formatDate(d.resolvedAt, `short`)},
//                                 ],
//                               }
//                             }),
//                           }).WithWrapper({className: `max-h-[100px]  !text-xs !rounded-none [&_td]:text-xs`})}
//                         </div>
//                       ) : (
//                         <EmptyPlaceholder />
//                       )}
//                     </div>
//                   </ShadPopover>
//                 </Fragment>
//               )
//             })}
//           </C_Stack>
//         </R_Stack>
//       </C_Stack>
//     </div>
//   )
// }
