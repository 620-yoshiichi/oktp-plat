import {NEW_CAR_CONST} from '@app/(apps)/newCar/(constants)/newCar-constants'
import TorokuListCC from '@app/(apps)/newCar/(pages)/torokuList/TorokuListCC/TorokuListCC'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

import {Padding} from '@cm/components/styles/common-components/common-components'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Prisma} from '@prisma/client'
import {addDays} from 'date-fns'
import React from 'react'

export default async function page(props) {
  const query = await props.searchParams
  const storeId = query.storeId ? Number(query.storeId) : undefined
  const orderNumberSearch = query.orderNumber
  const shinrenSearch = query[`shinren`]

  const searchBy_DD_HONBSYOK = query.searchBy_DD_HONBSYOK

  const baseWhere: Prisma.NewCarWhereInput = {
    DesiredTorokuDate: {some: {status: null}},
    DD_HONBSYOK: query.DD_HONBSYOK === '1' ? {not: null} : query.DD_HONBSYOK === '0' ? null : undefined,
  }

  let where = {}
  if (orderNumberSearch) {
    where = {NO_CYUMON: {contains: orderNumberSearch}}
  } else if (searchBy_DD_HONBSYOK) {
    where = {
      DesiredTorokuDate: {
        some: {
          updatedAt: {
            gte: toUtc(searchBy_DD_HONBSYOK),
            lt: addDays(toUtc(searchBy_DD_HONBSYOK), 1),
          },
        },
      },
    }
  } else if (shinrenSearch === `true`) {
    where = {
      KJ_KAINMEI1: {contains: `株式会社トヨタレンタリース新岡山`},
      ...baseWhere,
    }
  } else {
    where = {
      storeId,
      //申請があった車両のみ
      ...baseWhere,
    }
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

  const args: Prisma.NewCarFindManyArgs = {
    where: {...where},
    include: NEW_CAR_CONST.CR_OPERATION.INCLUDE,

    orderBy: [{Store: {code: `asc`}}, {NO_CYUMON: `asc`}],
  }

  const {result: cars} = await doStandardPrisma('newCar', 'findMany', args)

  return (
    <Padding>
      <TorokuListCC {...{cars, stores}} />
    </Padding>
  )
}
