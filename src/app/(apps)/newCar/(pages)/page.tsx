import GoogleLogin from '@app/(apps)/newCar/GoogleLogin'
import TopPage from '@cm/components/layout/Navigation/TopPage'

import {CenterScreen} from '@cm/components/styles/common-components/common-components'

import SignOuter from '@cm/components/utils/SignOuter'

import React from 'react'
import {initServerComopnent} from 'src/non-common/serverSideFunction'

export default async function Page(props) {
  return (
    <div>
      <TopPage />
    </div>
  )
}
