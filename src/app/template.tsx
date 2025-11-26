'use client'

import GlobalTemplate from '@cm/components/layout/GlobalTemplate'

import React from 'react'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {useJotaiByKey} from '@cm/hooks/useJotai'

export default function template({children}) {
  const {session} = useGlobal()
  const [modals, setModals] = useJotaiByKey<string[]>('modals', [])

  return <GlobalTemplate>{children}</GlobalTemplate>
}

//
