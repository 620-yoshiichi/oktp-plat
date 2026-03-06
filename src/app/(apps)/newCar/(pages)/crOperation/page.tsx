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

  const {newCars, pendingCars} = await getAllCarsForCrOperation({from, to})

  return (
    <div className={` p-2 max-w-[100vw] overflow-auto`}>
      <CrOperationCC {...{crHolidays, from, to, newCars, pendingCars}} />
    </div>
  )
}

// 着工予定 + 保留を1クエリで取得
const getAllCarsForCrOperation = async ({from, to}) => {
  const allCars = await prisma.newCar.findMany({
    where: {
      DD_TORIKESI: null,
      OR: [
        {DD_SAGTYYO: {gte: from, lt: to}},
        {CrInspectionHistory: {some: {date: {gte: from, lt: to}}}},
        {CrInspectionHistory: {some: {id: {gt: 0}}}},
      ],
    },
    include: {
      CrInspectionHistory: {take: 1, include: {User: {}}, orderBy: {createdAt: 'desc'}},
      User: {},
      Store: {},
    },
    orderBy: [{NO_CYUMON: `asc`}],
  })

  const newCars: typeof allCars = []
  const pendingCars: typeof allCars = []

  allCars.forEach(car => {
    const isPending = new NewCarClass(car).chakko.getLatestCrInspectionHistory()?.status?.includes('保留')
    if (isPending) {
      pendingCars.push(car)
    } else {
      const inPeriod =
        (car.DD_SAGTYYO && car.DD_SAGTYYO >= from && car.DD_SAGTYYO < to) ||
        car.CrInspectionHistory?.some(h => h.date && h.date >= from && h.date < to)
      if (inPeriod) newCars.push(car)
    }
  })

  return {newCars, pendingCars}
}
