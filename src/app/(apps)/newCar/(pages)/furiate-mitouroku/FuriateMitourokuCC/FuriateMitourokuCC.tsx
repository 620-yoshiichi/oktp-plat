'use client'

import { StoreSidebar } from '@app/(apps)/newCar/(pages)/furiate-mitouroku/FuriateMitourokuCC/StoreSidebar'
import Table from '@app/(apps)/newCar/(pages)/furiate-mitouroku/FuriateMitourokuCC/Table'
import { EditPanel } from '@app/(apps)/newCar/(pages)/furiate-mitouroku/FuriateMitourokuCC/EditPanel'

import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { Paper } from '@cm/components/styles/common-components/paper'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import React, { useState } from 'react'

export default function FuriateMitourokuCC({ cars, stores }) {
  const { addQuery, query } = useGlobal()
  const [selectedCar, setSelectedCar] = useState<any | null>(null)

  return (
    <div className={`mx-auto max-w-[1600px]`}>
      <small>{cars.length}件</small>
      <C_Stack>

        <R_Stack className={`flex-nowrap items-start gap-8  `}>
          <div className={`pr-4 border-r `}><StoreSidebar {...{ stores, query, addQuery }} /></div>
          <div className={`min-w-0 flex-1`}>

            <R_Stack className={`flex-nowrap items-start gap-4`}>
              <div className={selectedCar ? `w-[60%] min-w-0` : `w-full`}>
                <Table {...{ cars, onRowClick: setSelectedCar, selectedCarId: selectedCar?.id }} />
              </div>

              {selectedCar && (
                <div className={`w-[40%] min-w-[350px]`}>
                  <EditPanel {...{ car: selectedCar, onClose: () => setSelectedCar(null) }} />
                </div>
              )}
            </R_Stack>

          </div>
        </R_Stack>
      </C_Stack>
    </div>
  )
}
