import GoogleLogin from '@app/(apps)/newCar/GoogleLogin'

import {CenterScreen} from '@cm/components/styles/common-components/common-components'

import SignOuter from '@cm/components/utils/SignOuter'

import React from 'react'
import {initServerComopnent} from 'src/non-common/serverSideFunction'

export default async function Page(props) {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})
  const {rootPath} = query

  if (session.id && typeof session.id === `string`) {
    return <SignOuter {...{redirectPath: '/login'}} />
  }

  return (
    <div>
      <CenterScreen>
        {!scopes.login ? <GoogleLogin callbackUrl={`/${rootPath}`} /> : <div>メニューを選択してください</div>}
      </CenterScreen>
    </div>
  )
}
