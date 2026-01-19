'use client'
import useCheckPointGMF from '@app/(apps)/newCar/templateHooks/useCheckPointGMF'
import {useCrScheduleSwitcherModal} from '@app/(apps)/newCar/templateHooks/useCrScheduleSwitcherModal'
import useStuffSwitcher from '@app/(apps)/newCar/templateHooks/useStuffSwitcher'

import {usetorokuDateApplicationModal} from '@app/(apps)/newCar/templateHooks/usetorokuDateApplicationModal'
import {useTorokuMikomiFormModal} from '@app/(apps)/newCar/templateHooks/useTorokuMikomiFormModal'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import React from 'react'
import useTempoTsuikoGMF from '@app/(apps)/newCar/templateHooks/useTempoTsuikoGMF'

export default function NewCarTemplate({children}) {
  const crScheduleSwitcherModal_HK = useCrScheduleSwitcherModal()
  const torokuDateApplicationFormOpen_HK = usetorokuDateApplicationModal()
  const torokuMikomiFormModal_HK = useTorokuMikomiFormModal()
  const checkPointModalGMF = useCheckPointGMF()
  const stuffSwitcherGMF = useStuffSwitcher()
  const tempoTsuikoGMF = useTempoTsuikoGMF()
  const {accessScopes} = useGlobal()
  const scopes = accessScopes()
  const {isStoreManager} = scopes.getNewCarProps()

  return (
    <>
      <section>
        {/* モーダルの順番大事 */}
        <stuffSwitcherGMF.Modal />
        <checkPointModalGMF.Modal />
        <crScheduleSwitcherModal_HK.Modal />
        <torokuDateApplicationFormOpen_HK.Modal />
        <torokuMikomiFormModal_HK.Modal />
        <tempoTsuikoGMF.Modal />
      </section>

      {children}
    </>
  )
}
