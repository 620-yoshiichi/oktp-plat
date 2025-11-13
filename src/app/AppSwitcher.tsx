'use client'

import {T_LINK} from '@cm/components/styles/common-components/links'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useWindowSize from '@cm/hooks/useWindowSize'
import {isDev} from '@cm/lib/methods/common'

export const AppSwitcher = () => {
  const {PC} = useWindowSize()
  const {accessScopes} = useGlobal()
  const scopes = accessScopes()
  const {isStoreManager} = scopes.getNewCarProps()

  const allowed = isStoreManager || scopes.admin

  if (PC) {
    return (
      <>
        {isDev && allowed && <T_LINK {...{href: `/ucar`}}>QRシステム</T_LINK>}
        {allowed && <T_LINK {...{href: `/newCar`}}>納期CSアプリ</T_LINK>}
        {allowed && <T_LINK {...{href: `/QRBP`}}>BPアプリ</T_LINK>}
        {/* {allowed && <T_LINK {...{href: `/ucar`}}>Ucarアプリへ</T_LINK>} */}
      </>
    )
  }

  return <div></div>
}
