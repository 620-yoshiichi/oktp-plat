import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import {cl} from '@cm/lib/methods/common'
import {getCurrentStatuses} from '@app/(apps)/ucar/(parts)/statusAndAlerts'
import MyPopover from '@cm/components/utils/popover/MyPopover'
import {Paper} from '@cm/components/styles/common-components/paper'
import {ColoredText} from '@cm/components/styles/common-components/colors'
import useSelectedUcarNotesGMF from '@app/(apps)/ucar/(parts)/templateHooks/useSelectedUcarNotesGMF'
import {Fragment} from 'react'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import EmptyPlaceholder from '@cm/components/utils/loader/EmptyPlaceHolder'
import {ScrollText} from 'lucide-react'
import {UCAR_TABLE_ROW_HEIGHT} from '@app/(apps)/ucar/class/ColBuilder/UcarColBuilder'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import Coloring from '@cm/lib/methods/Coloring'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'

export default function UcarAlertButtonSummay({UcarData, mutateRecords}) {
  const statuses = getCurrentStatuses({UcarData})
  const selectedUcarNotesGMF = useSelectedUcarNotesGMF()

  return (
    <div>
      <C_Stack className={` justify-between `}>
        <R_Stack className={` justify-between  flex-nowrap`}>
          <C_Stack className={` justify-center gap-1`} style={{height: UCAR_TABLE_ROW_HEIGHT}}>
            {statuses.map((status, i) => {
              const active = !!status.isTrue(UcarData)

              const PopOverBtn = (
                <IconBtn className={cl(`w-[70px] text-center p-0.5 text-xs`)} active={active} key={i} color={status.color}>
                  {status.value}
                </IconBtn>
              )

              if (status.popOver) {
                return (
                  <MyPopover {...{button: <button>{PopOverBtn}</button>}} mode={`click`}>
                    <Paper>{status.popOver()}</Paper>
                  </MyPopover>
                )
              } else {
                return PopOverBtn
              }
            })}
          </C_Stack>

          <C_Stack
            className={` justify-between h-full gap-2`}
            style={{height: UCAR_TABLE_ROW_HEIGHT}}
            onClick={() => selectedUcarNotesGMF.setGMF_OPEN({UcarData, mutateRecords})}
          >
            {UCAR_CODE.PAPER_WORK_NOTE_TYPES.array.map((d, i) => {
              const {color, code: value} = d
              const list = UcarData.UcarPaperWorkNotes?.filter(note => note.type === value)
              const count = list.length

              const PopOverBody = () => {
                return (
                  <R_Stack key={i} className={`border-b flex-nowrap`}>
                    <div className={`min-w-[40px] text-[11px]  text-gray-600`}>
                      <R_Stack className={`gap-0.5 `}>
                        <ScrollText className={`w-3 h-3`} />
                        {value}
                      </R_Stack>
                    </div>
                    <Coloring
                      mode="text"
                      asLink={!!count}
                      color={count ? color : ''}
                      className={`${count ? 'font-bold ' : 'opacity-20 text-xs'} gap-0  rounded-full w-[30px]`}
                    >
                      <span>{count}</span>
                    </Coloring>
                  </R_Stack>
                )
              }

              const PopOverContent = () => {
                return (
                  <div>
                    {CsvTable({
                      records: list.map(d => {
                        const codeItem = UCAR_CODE.PAPER_WORK_NOTE_TYPES.byCode(d.type)
                        return {
                          csvTableRow: [
                            //
                            {
                              label: undefined,
                              cellValue: (
                                <small className={` leading-3`}>
                                  <div>{formatDate(d.createdAt, `short`)}</div>
                                  <div>{d?.User?.name}</div>
                                  <ColoredText bgColor={codeItem?.color}>{codeItem?.label}</ColoredText>
                                  <div>{formatDate(d.resolvedAt, `short`)}</div>
                                </small>
                              ),
                              style: {width: 80},
                            },

                            {label: undefined, cellValue: d.content, style: {width: 300}},
                          ],
                        }
                      }),
                    }).WithWrapper({className: `max-h-[100px]  !text-xs !rounded-none [&_td]:text-xs`})}
                  </div>
                )
              }

              return (
                <Fragment key={i}>
                  <MyPopover {...{button: <PopOverBody />, mode: `hover`}}>
                    <Paper>{count ? <PopOverContent /> : <EmptyPlaceholder />}</Paper>
                  </MyPopover>
                </Fragment>
              )
            })}
          </C_Stack>
        </R_Stack>
      </C_Stack>
    </div>
  )
}
