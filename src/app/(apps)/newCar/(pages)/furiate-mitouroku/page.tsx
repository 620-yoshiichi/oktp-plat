import FuriateMitourokuCC from '@app/(apps)/newCar/(pages)/furiate-mitouroku/FuriateMitourokuCC/FuriateMitourokuCC'

import {Padding} from '@cm/components/styles/common-components/common-components'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Prisma} from '@prisma/generated/prisma/client'
import React from 'react'

export default async function Page(props) {
  const query = await props.searchParams
  const storeId = query.storeId ? Number(query.storeId) : undefined

  const baseWhere: Prisma.NewCarWhereInput = {
    DD_FR: {not: null},
    DD_TOUROKU: null,
    DD_TORIKESI: null,
  }

  const where: Prisma.NewCarWhereInput = {
    ...baseWhere,
    ...(storeId ? {storeId} : {}),
  }

  const {result: storeGroupBy} = await doStandardPrisma(`newCar`, `groupBy`, {
    by: ['storeId'],
    _count: true,
    where: baseWhere,
    orderBy: [],
  })

  let {result: stores} = await doStandardPrisma(`store`, `findMany`, {orderBy: [{code: `asc`}]})
  stores = stores.map(d => {
    const groupBy = storeGroupBy.find(s => s.storeId === d.id)
    return {...d, groupBy}
  })

  const {result: cars} = await doStandardPrisma('newCar', 'findMany', {
    where,
    include: {
      User: {},
      Store: {},
    } as Prisma.NewCarInclude,
    orderBy: [{Store: {code: `asc`}}, {User: {name: `asc`}}, {NO_CYUMON: `asc`}],
  })

  return (
    <Padding>
      <FuriateMitourokuCC {...{cars, stores}} />
    </Padding>
  )
}
