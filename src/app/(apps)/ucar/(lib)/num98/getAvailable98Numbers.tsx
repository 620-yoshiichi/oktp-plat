'use server'

import {superTrim} from '@cm/lib/methods/common'
import prisma from 'src/lib/prisma'

import {
  availableNumberWhere,
  number98Select,
  getLastNumber98History,
  findNextAvailableNumber98,
} from '@app/(apps)/ucar/(lib)/num98/num98Constants'
import {Prisma} from '@prisma/generated/prisma/client'

export type getAvailable98NumbersReturn = Awaited<ReturnType<typeof getAvailable98Numbers>>
export type number98Item = Awaited<ReturnType<typeof getAvailable98Numbers>>['available98Numbers'][number]

export const getAvailable98Numbers = async (props: {take?: number; additionalWhere?: Prisma.Number98WhereInput}) => {
  const {take = 10, additionalWhere = {}} = props

  // 共通関数で次の利用可能な番号を取得
  const lastHistory = await getLastNumber98History()
  const nextNumber98 = await findNextAvailableNumber98(lastHistory?.number)

  const available98ProceedingNumbers = await prisma.number98.findMany({
    select: number98Select,
    where: {
      AND: [
        // 利用中の98番号を除外
        { ...availableNumberWhere },
        { sortNumber: { gte: Number(superTrim(nextNumber98)) } },
        additionalWhere,
      ],
    },

    orderBy: [{ sortNumber: `asc` }],
    take,
  })

  let available98Numbers = [...available98ProceedingNumbers]
  if (available98Numbers.length === 0) {
    const availablePreviousNumbers = await prisma.number98.findMany({
      select: number98Select,
      where: {
        AND: [
          // 利用中の98番号を除外
          { ...availableNumberWhere },
          { sortNumber: { lte: Number(superTrim(nextNumber98)) } },
          additionalWhere,
        ],
      },
      take,
      orderBy: [{ sortNumber: `asc` }],
    })
    available98Numbers = [...availablePreviousNumbers, ...available98Numbers]
  }

  return {
    nextNumber98,
    available98Numbers,
  }
}

export const getNonAvailable98Numbers = async (props: { take?: number }) => {
  const { take = 10 } = props
  const nonAvailable98Numbers = await prisma.number98.findMany({
    select: number98Select,
    where: {
      NOT: availableNumberWhere,
    },
    take,
  })
  return { nonAvailable98Numbers }
}
