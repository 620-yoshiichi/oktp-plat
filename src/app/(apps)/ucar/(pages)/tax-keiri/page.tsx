import {getWhereQuery} from '@cm/lib/methods/redirect-method'
import Redirector from '@cm/components/utils/Redirector'
import React from 'react'

import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'

import {toUtc} from '@cm/class/Days/date-utils/calculations'
import TaxKeiriTable from '@app/(apps)/ucar/(pages)/tax-keiri/TaxKeiriTable'

export default async function page(props) {
  const query = await props.searchParams
  const {whereQuery, redirectPath} = await getWhereQuery({query, defaultQuery: {from: new Date()}})

  if (redirectPath) return <Redirector redirectPath={redirectPath} />

  const ucarList = await UcarCL.fetcher.getUcarDataList({
    where: {paybackScheduledAt: toUtc(query.from)},
  })

  return <TaxKeiriTable ucarList={ucarList} />
}
