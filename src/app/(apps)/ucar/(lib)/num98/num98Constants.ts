import {Prisma} from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'

// ============================================
// 定数・Prisma条件
// ============================================

/**
 * 利用可能な98番号の条件
 * - occupied: false
 * - Ucarに紐づいていないか、紐づいているUcarの98番号に価格未設定のOldCars_Baseがない
 * - 自身に紐づくOldCars_Baseがすべて値付け済み(KI_HANKAKA != '0')
 * - ZAIKO_Baseに紐づいていない
 */
export const availableNumberWhere: Prisma.Number98WhereInput = {
  AND: [
    {occupied: false},
    {
      Ucar: {
        none: {
          id: {gt: 0},
          Number98: {
            OldCars_Base: {some: {KI_HANKAKA: '0'}},
          },
        },
      },
    },
    {
      OldCars_Base: {
        every: {KI_HANKAKA: {not: '0'}},
      },
    },
    {
      ZAIKO_Base: {
        none: {},
      },
    },
  ],
}

export const number98Select: Prisma.Number98Select = {
  number: true,
  sortNumber: true,
  Ucar: {
    select: {sateiID: true},
  },
  OldCars_Base: {
    select: {
      NO_SIRETYUM: true,
      NO_SYARYOU: true,
      DD_SIIRE: true,
      KI_HANKAKA: true,
    },
    orderBy: [{DD_SIIRE: `asc`}],
  },
}

// ============================================
// ユーティリティ関数
// ============================================

/**
 * 98番号を正規化する
 * 例: "9800083", "98-00083", "98 00083", "00083" → "98 00083"
 */
export function normalizeNumber98(input: string): string {
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
    orderBy: [{createdAt: 'desc'}],
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
        number: {gt: afterNumber},
        ...availableNumberWhere,
      },
      orderBy: [{sortNumber: 'asc'}],
    })

    if (nextResult) {
      return nextResult.number
    }
  }

  // 後方に見つからない場合、または指定なしの場合は最初から検索
  const firstResult = await prisma.number98.findFirst({
    where: availableNumberWhere,
    orderBy: [{sortNumber: 'asc'}],
  })

  return firstResult?.number ?? null
}
