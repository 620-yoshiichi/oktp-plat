'use client'

import EasySearcher from '@cm/components/DataLogic/TFs/MyTable/components/EasySearcher/EasySearcher'
import {FitMargin} from '@cm/components/styles/common-components/common-components'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import React from 'react'

export default function PaperProcessFilter({serverFetchihngData}) {
  const useGlobalProps = useGlobal()

  const {easySearchPrismaDataOnServer} = serverFetchihngData

  return (
    <FitMargin>
      <EasySearcher
        {...{
          dataModelName: `ucar`,
          prismaDataExtractionQuery: {},
          easySearchPrismaDataOnServer,
          useGlobalProps,
        }}
      />
    </FitMargin>
  )
}
