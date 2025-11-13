import TenpoTsuikoShinseiDetail from '@app/(apps)/newCar/(pages)/tenpo-tsuiko-shinsei/[newCarId]/TenpoTsuikoShinseiDetail'
import Redirector from '@cm/components/utils/Redirector'

import React from 'react'
import {initServerComopnent} from 'src/non-common/serverSideFunction'

export default async function page(props) {
  const {newCarId} = await props.params
  const searchParams = await props.searchParams
  const headerId = searchParams?.headerId

  const {session} = await initServerComopnent({query: searchParams})
  if (!session.id) {
    return <Redirector {...{redirectPath: '/login?rootPath=newCar'}} />
  }

  return (
    <div>
      <TenpoTsuikoShinseiDetail newCarId={Number(newCarId)} headerId={headerId} />
    </div>
  )
}
