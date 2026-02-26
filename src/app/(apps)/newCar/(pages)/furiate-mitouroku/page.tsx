import { NEW_CAR_CONST } from '@app/(apps)/newCar/(constants)/newCar-constants'
import FuriateMitourokuCC from '@app/(apps)/newCar/(pages)/furiate-mitouroku/FuriateMitourokuCC/FuriateMitourokuCC'

import { Padding } from '@cm/components/styles/common-components/common-components'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { Prisma } from '@prisma/generated/prisma/client'
import { subDays } from 'date-fns'
import React from 'react'

export default async function Page(props) {
  const query = await props.searchParams
  const storeId = query.storeId ? Number(query.storeId) : undefined

  const baseWhere: Prisma.NewCarWhereInput = {
    DD_FR: { lte: subDays(new Date(), 32) },
    DD_TOUROKU: null,
    DD_TORIKESI: null,
  }

  const where: Prisma.NewCarWhereInput = {
    AND: [
      baseWhere,
      {
        ...(storeId ? { storeId } : {}),
        ...NEW_CAR_CONST.NEW_CAR.WHERE.COMMON_WHERE,
      }
    ]
  }

  const { result: storeGroupBy } = await doStandardPrisma(`newCar`, `groupBy`, {
    by: ['storeId'],
    _count: true,
    where: baseWhere,
    orderBy: [],
  })

  let { result: stores } = await doStandardPrisma(`store`, `findMany`, { orderBy: [{ code: `asc` }] })
  stores = stores.map(d => {
    const groupBy = storeGroupBy.find(s => s.storeId === d.id)
    return { ...d, groupBy }
  })

  const { result: allCars } = await doStandardPrisma('newCar', 'findMany', {
    where: { ...baseWhere, ...NEW_CAR_CONST.NEW_CAR.WHERE.COMMON_WHERE },
    select: { id: true, storeId: true, furiate_chien_riyu: true, nouki_mishitei_riyu: true },
  })

  const args: Prisma.NewCarFindManyArgs = {
    where,
    include: {
      User: {},
      Store: {},
    },
    orderBy: [{ Store: { code: `asc` } }, { User: { name: `asc` } }, { NO_CYUMON: `asc` }],
  }

  const { result: cars } = await doStandardPrisma('newCar', 'findMany', args)

  return (
    <Padding>
      <FuriateMitourokuCC {...{ cars, allCars, stores }} />
    </Padding>
  )
}
