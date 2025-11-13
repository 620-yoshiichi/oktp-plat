'use client'


import GlobalTemplate from '@cm/components/layout/GlobalTemplate'

import React from 'react'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

export default function template({children}) {
  const {session} = useGlobal()

  return <GlobalTemplate>{children}</GlobalTemplate>
}

//
