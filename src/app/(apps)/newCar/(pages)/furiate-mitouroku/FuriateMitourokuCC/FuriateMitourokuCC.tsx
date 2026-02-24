'use client'

import { StoreSidebar } from '@app/(apps)/newCar/(pages)/furiate-mitouroku/FuriateMitourokuCC/StoreSidebar'
import Table from '@app/(apps)/newCar/(pages)/furiate-mitouroku/FuriateMitourokuCC/Table'
import { EditPanel } from '@app/(apps)/newCar/(pages)/furiate-mitouroku/FuriateMitourokuCC/EditPanel'

import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import React, { useState } from 'react'

export default function FuriateMitourokuCC({ cars, allCars, stores }) {
  const { addQuery, query } = useGlobal()
  const [selectedCar, setSelectedCar] = useState<any | null>(null)

  const maxHeighClass = `h-[calc(100vh-200px)] overflow-y-auto`

  return (
    <div className={`mx-auto max-w-[1600px]`}>
      <small>{cars.length}件</small>
      <C_Stack>

        <R_Stack className={`flex-nowrap items-start gap-8  `}>
          <div className={`pr-4 border-r `}>
            <StoreSidebar {...{ stores, allCars, query, addQuery, maxHeighClass }} />
          </div>
          <div className={`relative min-w-0 flex-1`}>
            <Table {...{ cars, onRowClick: setSelectedCar, selectedCarId: selectedCar?.id, maxHeighClass }} />

            {selectedCar && (
              <div className={`absolute right-0 top-0 z-10 w-[400px] shadow-xl`}>
                <EditPanel {...{ car: selectedCar, onClose: () => setSelectedCar(null) }} />
              </div>
            )}
          </div>
        </R_Stack>
      </C_Stack>
    </div>
  )
}
