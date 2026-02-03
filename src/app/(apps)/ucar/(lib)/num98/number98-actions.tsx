'use server'

import { superTrim } from '@cm/lib/methods/common'
import prisma from 'src/lib/prisma'

import {
  availableNumberWhere,
  number98Select,

} from '@app/(apps)/ucar/(lib)/num98/num98Constants'
import { Prisma } from '@prisma/generated/prisma/client'

export type getAvailable98NumbersReturn = Awaited<ReturnType<typeof getAvailable98Numbers>>
export type number98Item = Awaited<ReturnType<typeof getAvailable98Numbers>>['available98Numbers'][number]

export const getAvailable98Numbers = async (props: { take?: number; additionalWhere?: Prisma.Number98WhereInput }) => {
  const { take = 10, additionalWhere = {} } = props

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
export const inThisNumber98Available = async (number98: string) => {
  const hit = await prisma.number98.findUnique({
    where: {
      number: (number98 ?? '') as any,
      ...availableNumberWhere
    } as any,
    select: number98Select,
  })
  return hit ? true : false
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


// ============================================
// ユーティリティ関数
// ============================================

/**
 * 98番号を正規化する
 * 例: "9800083", "98-00083", "98 00083", "00083" → "98 00083"
 */
export async function normalizeNumber98(input: string): Promise<string> {
  const digitsOnly = input.replace(/\D/g, '')

  if (!digitsOnly) return input.trim()

  let numberPart = digitsOnly
  if (digitsOnly.startsWith('98') && digitsOnly.length > 2) {
    numberPart = digitsOnly.slice(2)
  }

  const paddedNumber = numberPart.padStart(5, '0')
  return `98 ${paddedNumber}`
}

// ============================================
// 共通データ取得関数
// ============================================

/**
 * 最後に使用した98番号の履歴を取得する
 */
export async function getLastNumber98History() {
  return prisma.number98IssueHistory.findFirst({
    orderBy: [{ createdAt: 'desc' }],
  })
}

/**
 * 次の利用可能な98番号を取得する（指定番号より後から検索、見つからなければ最初から）
 */
export async function findNextAvailableNumber98(afterNumber?: string | null): Promise<string | null> {
  if (afterNumber) {
    // 指定番号より後の利用可能な番号を検索
    const nextResult = await prisma.number98.findFirst({
      where: {
        number: { gt: afterNumber },
        ...availableNumberWhere,
      },
      orderBy: [{ sortNumber: 'asc' }],
    })

    if (nextResult) {
      return nextResult.number
    }
  }

  // 後方に見つからない場合、または指定なしの場合は最初から検索
  const firstResult = await prisma.number98.findFirst({
    where: availableNumberWhere,
    orderBy: [{ sortNumber: 'asc' }],
  })

  return firstResult?.number ?? null
}
