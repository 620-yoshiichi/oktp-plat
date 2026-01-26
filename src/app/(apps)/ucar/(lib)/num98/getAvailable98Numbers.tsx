'use server'

import { superTrim } from '@cm/lib/methods/common'
import prisma from 'src/lib/prisma'

import { availableNumberWhere, number98Select } from '@app/(apps)/ucar/(lib)/num98/num98Constants'
import { Prisma } from '@prisma/generated/prisma/client'

export type getAvailable98NumbersReturn = Awaited<ReturnType<typeof getAvailable98Numbers>>
export type number98Item = Awaited<ReturnType<typeof getAvailable98Numbers>>['available98Numbers'][number]

export const getAvailable98Numbers = async (props: { take?: number; additionalWhere?: Prisma.Number98WhereInput }) => {
  const { take = 10, additionalWhere = {} } = props
  const lastnNmber98History = await prisma.number98IssueHistory.findFirst({
    orderBy: [{ createdAt: `desc` }],
    take: 1,
  })

  let nextNumber98
  if (lastnNmber98History?.number) {
    const nextNumber98Result = await prisma.number98.findFirst({
      where: { number: { gt: lastnNmber98History.number } },
      orderBy: [{ sortNumber: `asc` }],
      take: 1,
    })

    nextNumber98 = nextNumber98Result?.number
  } else {
    const firstNumber98Result = await prisma.number98.findFirst({
      orderBy: [{ sortNumber: `asc` }],
      take: 1,
    })

    nextNumber98 = firstNumber98Result?.number
  }

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
