'use client'

import React from 'react'

import useSelectedUcarNotesGMF from '@app/(apps)/ucar/(parts)/templateHooks/useSelectedUcarNotesGMF'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Center, R_Stack} from '@cm/components/styles/common-components/common-components'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'

const UcarNotes = React.memo((props: {UcarData; className}) => {
  const {UcarData, className} = props

  const selectedUcarNotesGMF = useSelectedUcarNotesGMF()

  const {UcarPaperWorkNotes = []} = UcarData

  return (
    <div>
      <div onClick={() => selectedUcarNotesGMF.setGMF_OPEN(UcarData)} className={`    [&_*]:!text-sm ${className}`}>
        {(UcarPaperWorkNotes ?? []).length === 0 && <Center>備考なし</Center>}
        <table>
          <tbody>
            {UcarPaperWorkNotes.map((note, i) => {
              const codeItem = UCAR_CODE.PAPER_WORK_NOTE_TYPES.byCode(note.type)
              const rowColor = i % 2 === 1 ? 'bg-gray-300' : 'bg-white'
              return (
                <tr key={i} className={`${rowColor} py-0.5`}>
                  <td className={`w-[170px] p-0.5`}>
                    <R_Stack className={` items-start gap-0.5 gap-x-1 !text-xs leading-3 `}>
                      <div>{formatDate(note.createdAt, `YY年M月D日(ddd)`)}</div>
                      <div className={`w-fit`}>
                        <IconBtn className={`p-0 px-0.5 `} color={codeItem?.color}>
                          {codeItem?.label}
                        </IconBtn>
                      </div>
                    </R_Stack>
                  </td>

                  <td>
                    <span className={`text-[8px]`}>{note.content}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
})

export default UcarNotes
