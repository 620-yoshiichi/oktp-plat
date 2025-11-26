import CrOperationCC from '@app/(apps)/newCar/(pages)/crOperation/crOperationCC'
import {NewCarClass} from '@app/(apps)/newCar/class/NewCarClass/NewCarClass'
import {Days} from '@cm/class/Days/Days'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import Redirector from '@cm/components/utils/Redirector'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {getWhereQuery} from '@cm/lib/methods/redirect-method'
import prisma from 'src/lib/prisma'
import React from 'react'

export default async function Page(props) {
  const query = await props.searchParams
  const {whereQuery, redirectPath} = await getWhereQuery({query, defaultQuery: {from: new Date()}})

  if (redirectPath) return <Redirector {...{redirectPath}} />

  const crHolidays = await (
    await doStandardPrisma(`calendar`, `findMany`, {
      select: {date: true},
      where: {cr: true},
    })
  ).result.map(d => d.date)

  const today = toUtc(query.from)
  const from = today
  const to = Days.day.addBusinessDays(from, 5, crHolidays)

  const newCars = await getNewCarsScheduledInPeriods({from, to})
  const pendingCars = await getPendingCars({from, to})

  return (
    <div className={` p-2 max-w-[100vw] overflow-auto`}>
      <CrOperationCC {...{crHolidays, from, to, newCars, pendingCars}} />
    </div>
  )
}

const getNewCarsScheduledInPeriods = async ({from, to}) => {
  const ChakkoInPeriod = {DD_SAGTYYO: {gte: from, lt: to}}
  const SchedulePendingOnPeriod = {
    CrInspectionHistory: {
      some: {date: {gte: from, lt: to}},
    },
  }

  let newCars = await prisma.newCar.findMany({
    where: {
      DD_TORIKESI: null,
      OR: [
        //
        ChakkoInPeriod,
        SchedulePendingOnPeriod,
      ],
    },
    include: {
      CrInspectionHistory: {take: 1, include: {User: {}}, orderBy: {createdAt: 'desc'}},
      User: {},
      Store: {},
    },
    orderBy: [{NO_CYUMON: `asc`}],
  })
  newCars = newCars.filter(d => {
    return !new NewCarClass(d).chakko.getLatestCrInspectionHistory()?.status?.includes('保留')
  })

  return newCars
}

const getPendingCars = async ({from, to}) => {
  const newCars = await prisma.newCar.findMany({
    where: {
      DD_TORIKESI: null,
      CrInspectionHistory: {some: {id: {gt: 0}}},
    },
    include: {
      CrInspectionHistory: {include: {User: {}}, orderBy: {createdAt: 'desc'}, take: 1},
      User: {},
      Store: {},
    },
    orderBy: [{NO_CYUMON: `asc`}],
  })

  const pendingCars = newCars.filter(car => {
    const hit = new NewCarClass(car).chakko.getLatestCrInspectionHistory()?.status?.includes('保留')

    return hit
  })

  return pendingCars
}
