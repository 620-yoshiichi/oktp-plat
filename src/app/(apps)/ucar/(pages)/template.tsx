'use client'

import useGarageEditorGMF from '@app/(apps)/ucar/(parts)/templateHooks/useGarageEditorGMF'
import useSelectedUcarNotesGMF from '@app/(apps)/ucar/(parts)/templateHooks/useSelectedUcarNotesGMF'
import useUcarDetailUpdatorGMF from '@app/(apps)/ucar/(parts)/templateHooks/useUcarDetailUpdatorGMF'
import {AppSwitcher} from '@app/AppSwitcher'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

const Template = ({children}) => {
  const selectedUcarNotesGMF = useSelectedUcarNotesGMF()
  const GMF_UcrDetailUpdater = useUcarDetailUpdatorGMF()
  const GMF_GarageRegister = useGarageEditorGMF()
  return (
    <>
      <section>
        {/* モーダルの順番大事 */}
        {/* 作業ノート */}
        {selectedUcarNotesGMF.Modal()}

        {GMF_UcrDetailUpdater.Modal()}

        {GMF_GarageRegister.Modal()}
      </section>
      {/* main */}

      {children}

      <div style={{position: 'fixed', bottom: '20px', right: '20px'}}>
        <R_Stack>
          <AppSwitcher />
        </R_Stack>
      </div>
    </>
  )
}
export default Template
