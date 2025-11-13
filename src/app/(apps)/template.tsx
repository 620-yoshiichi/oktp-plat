'use client'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import Redirector from '@cm/components/utils/Redirector'
import React from 'react'

const test = false

export default function RootPathRedirector({children}) {
  const {session, query} = useGlobal()
  const {rootPath} = query

  if (session?.id && rootPath) {
    return <Redirector {...{redirectPath: `/${rootPath}`}} />
  }
  return <>{children}</>
}
