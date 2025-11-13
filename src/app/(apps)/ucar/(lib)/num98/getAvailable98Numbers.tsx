import {calcNextNumber98} from '@app/(apps)/ucar/(lib)/num98/calcNextNumber98'

import {superTrim} from '@cm/lib/methods/common'
import prisma from 'src/lib/prisma'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Prisma} from '@prisma/client'

const num98Select = {
  id: true,
  number: true,
}

export const getAvailable98Numbers = async (props: any) => {
  const {take = 30} = props

  const Last98NumberCar = await prisma.ucar.findFirst({
    select: {id: true, Number98: {select: num98Select}},
    where: {},
    orderBy: [{Number98: {number: `desc`}}, {id: `desc`}],
    take: 1,
  })

  const used98Numbers = (
    await doStandardPrisma(`number98`, `findMany`, {
      select: {...num98Select, Ucar: {select: {id: true}}},
      where: {
        OldCars_Base: {
          some: {
            OR: [{KI_HANKAKA: {equals: '0'}}, {KI_HANKAKA: null}],
          },
        },
      },
    } as Prisma.Number98FindManyArgs)
  ).result

  let available98Numbers: any[] = []

  const ucarGetArgs = {}

  const usedWhere = {number: {in: used98Numbers.map(d => d.number)}}
  const unusedWhere = {NOT: usedWhere}

  const proceeding98Numbers = await prisma.number98.findMany({
    select: {...num98Select, Ucar: ucarGetArgs},
    take,
    orderBy: [{number: `asc`}],
    where: {...unusedWhere, sortNumber: {gt: Number(superTrim(Last98NumberCar?.Number98?.number))}},
  } as Prisma.Number98FindManyArgs)

  available98Numbers = proceeding98Numbers

  if (available98Numbers.length < take) {
    const preCeeding98Numbers = await prisma.number98.findMany({
      select: {...num98Select, Ucar: ucarGetArgs},
      take,
      orderBy: [{number: `asc`}],
      where: {
        ...unusedWhere,
        sortNumber: {lte: Number(superTrim(Last98NumberCar?.Number98?.number))},
      },
    } as Prisma.Number98FindManyArgs)

    available98Numbers = [...available98Numbers, ...preCeeding98Numbers]
  }

  const isAvaiblae = available98Numbers.find(d => {
    return d.number === Last98NumberCar?.Number98?.number
  })

  const next98Number = isAvaiblae ? await calcNextNumber98(Last98NumberCar?.Number98?.number) : available98Numbers[0]?.number

  const next98NumberModel = await prisma.number98.findFirst({
    select: {id: true, number: true},
    where: {number: next98Number},
  })

  isAvaiblae ? await calcNextNumber98(Last98NumberCar?.Number98?.number) : available98Numbers[0]?.number

  return {
    available98Numbers,
    Last98NumberCar,
    used98Numbers,
    next98Number,
    next98NumberModel,
  }
}
