'use client'

import useGarageEditorGMF from '@app/(apps)/ucar/(parts)/templateHooks/useGarageEditorGMF'
import useNumber98CandidateSelectorGMF from '@app/(apps)/ucar/(parts)/templateHooks/useNumber98CandidateSelectorGMF'
import useSelectedUcarNotesGMF from '@app/(apps)/ucar/(parts)/templateHooks/useSelectedUcarNotesGMF'
import useUcarDetailUpdatorGMF from '@app/(apps)/ucar/(parts)/templateHooks/useUcarDetailUpdatorGMF'
import {AppSwitcher} from '@app/AppSwitcher'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {Prisma} from '@prisma/client'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'

const Template = ({children}) => {
  const selectedUcarNotesGMF = useSelectedUcarNotesGMF()
  const GMF_UcrDetailUpdater = useUcarDetailUpdatorGMF()
  const GMF_GarageRegister = useGarageEditorGMF()
  const GMF_Number98CandidateSelector = useNumber98CandidateSelectorGMF()
  return (
    <>
      <section>
        {/* モーダルの順番大事 */}
        {/* 作業ノート */}
        {selectedUcarNotesGMF.Modal()}

        {GMF_UcrDetailUpdater.Modal()}

        {GMF_GarageRegister.Modal()}

        {GMF_Number98CandidateSelector.Modal()}
      </section>

      {/* main */}

      <div>{children}</div>

      <div style={{position: 'fixed', bottom: '20px', right: '20px'}}>
        <R_Stack>
          <AppSwitcher />
        </R_Stack>
      </div>
    </>
  )
}
export default Template

const Number98List = () => {
  const number98Where: Prisma.Number98WhereInput = {
    AND: [
      //
      {occupied: false},
      {
        OR: [
          //
          {OldCars_Base: {none: {id: {gt: 0}}}},
          {OldCars_Base: {every: {KI_HANKAKA: {not: '0'}}}}, //全て売れている
        ],
      },
    ],
  }

  const {data = []} = useDoStandardPrisma('number98', 'findMany', {
    where: number98Where,
  })
  return (
    <div className={`min-w-[200px]`}>
      <div>{data.length}件</div>
      {CsvTable({
        records: data.map(item => {
          return {
            csvTableRow: [
              //
              {label: 'number', cellValue: item.number},
            ],
          }
        }),
      }).WithWrapper({className: `max-h-none`})}
    </div>
  )
}
