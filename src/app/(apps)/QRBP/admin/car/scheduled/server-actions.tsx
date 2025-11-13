import {QueryBuilder} from '@app/(apps)/QRBP/class/QueryBuilder'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import prisma from 'src/lib/prisma'

export const getCars = async body => {
  const {where} = body

  const carsOnBoard = await prisma.car.findMany({
    where,
    include: {...QueryBuilder.getInclude({query: {}, session: {}}).car.include},
  })

  return {carsOnBoard}
}

export const getWaitingList = async ({where}) => {
  // let waitingCars = []
  let groupedByDamage = []

  const res = await doStandardPrisma('car', 'findMany', {
    where: where,
    select: {id: true, DamageNameMaster: true},
  })
  // waitingCars = res.result

  const {result: damages} = await doStandardPrisma('damageNameMaster', 'findMany', {orderBy: {sortOrder: 'asc'}})

  const {result} = await doStandardPrisma('car', 'groupBy', {
    where: where,
    by: ['damageNameMasterId'],

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    select: {
      _count: {select: {id: true}},
      damageNameMasterId: true,
    },
  })
  groupedByDamage = result

  const waitingListObject = {
    // waitingCars,
    groupedByDamage,
    damages,
  }
  return waitingListObject
}
