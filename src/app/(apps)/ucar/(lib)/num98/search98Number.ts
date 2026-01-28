'use server'

import prisma from 'src/lib/prisma'
import {Prisma} from '@prisma/generated/prisma/client'

/**
 * 98番号を正規化する
 * 例: "9800083", "98-00083", "98 00083", "00083" → "98 00083"
 */
function normalizeNumber98(input: string): string {
  // 数字のみ抽出
  const digitsOnly = input.replace(/\D/g, '')

  // 空の場合はそのまま返す
  if (!digitsOnly) return input.trim()

  // "98"で始まる場合は除去
  let numberPart = digitsOnly
  if (digitsOnly.startsWith('98') && digitsOnly.length > 2) {
    numberPart = digitsOnly.slice(2)
  }

  // 5桁にゼロパディング
  const paddedNumber = numberPart.padStart(5, '0')

  return `98 ${paddedNumber}`
}

/**
 * 利用不可理由の型
 */
export type UnavailableReason = {
  /** 条件名 */
  condition: string
  /** 詳細説明 */
  detail: string
  /** 該当しているか */
  matched: boolean
}

/**
 * 98番号検索結果の型
 */
export type Search98NumberResult = {
  /** 検索した98番号の情報 */
  number98: {
    id: number
    number: string
    sortNumber: number | null
    occupied: boolean | null
    createdAt: Date
    updatedAt: Date | null
  } | null
  /** 利用可能かどうか */
  isAvailable: boolean
  /** 利用不可の理由リスト（すべての条件のチェック結果） */
  unavailableReasons: UnavailableReason[]
  /** 紐づくUcar履歴 */
  ucarHistory: {
    id: number
    sateiID: string
    createdAt: Date
    number98: string | null
    NO_SIRETYUM: string | null
    DD_SIIRE: Date | null
    plate: string | null
    destination: string | null
  }[]
  /** 紐づくOldCars_Base履歴 */
  oldCarsHistory: {
    id: number
    APPINDEX: string
    NO_SIRETYUM: string | null
    NO_SYARYOU: string | null
    MJ_SYAMEI: string | null
    DD_SIIRE: Date | null
    KI_SIIREKA: string | null
    KI_HANKAKA: string | null
    DD_URIAGE: Date | null
    NO_SYADAIBA: string | null
    KB_URIAGE: string | null
  }[]
  /** 紐づくZAIKO_Base履歴 */
  zaikoHistory: {
    id: number
    APPINDEX: string
    NO_SYARYOU: string | null
    DD_SIIRE: Date | null
    MJ_FURUSYAM: string | null
    NO_SYADAIBA: string | null
    MJ_ZAIKOST: string | null
    CD_ZAIKOTEN: string | null
  }[]
}

/**
 * 利用可能な98番号の条件（num98Constants.tsと同じ条件）
 * - occupied: false
 * - Ucarに紐づいていないか、紐づいているUcarの98番号に価格未設定のOldCars_Baseがない
 * - 自身に紐づくOldCars_Baseがすべて値付け済み(KI_HANKAKA != '0')
 * - ZAIKO_Baseに紐づいていない
 */
const availableNumberWhere: Prisma.Number98WhereInput = {
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
    // ZAIKO_Baseに紐づいていないこと
    {
      ZAIKO_Base: {none: {}},
    },
  ],
}

/**
 * 98番号を検索し、関連データと利用可否を返す
 */
export async function search98Number(searchNumber: string): Promise<Search98NumberResult> {
  if (!searchNumber || searchNumber.trim() === '') {
    return {
      number98: null,
      isAvailable: false,
      unavailableReasons: [{condition: '検索番号', detail: '検索番号が指定されていません', matched: true}],
      ucarHistory: [],
      oldCarsHistory: [],
      zaikoHistory: [],
    }
  }

  // 入力を正規化（例: "9800083" → "98 00083"）
  const normalizedNumber = normalizeNumber98(searchNumber)

  // 98番号を検索（完全一致）
  const number98 = await prisma.number98.findUnique({
    where: {number: normalizedNumber},
    select: {
      id: true,
      number: true,
      sortNumber: true,
      occupied: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!number98) {
    return {
      number98: null,
      isAvailable: false,
      unavailableReasons: [{condition: '存在確認', detail: `98番号「${normalizedNumber}」は存在しません`, matched: true}],
      ucarHistory: [],
      oldCarsHistory: [],
      zaikoHistory: [],
    }
  }

  // すべての条件を並列でチェック
  const [hasZaiko, nonPricedOldCars, ucarWithNonPricedOldCars] = await Promise.all([
    // ZAIKO_Baseに紐づいているかチェック
    prisma.zAIKO_Base.findFirst({
      where: {NO_SYARYOU: normalizedNumber},
      select: {id: true, MJ_FURUSYAM: true},
    }),
    // OldCars_Baseに価格未設定があるかチェック
    prisma.oldCars_Base.findMany({
      where: {
        NO_SYARYOU: normalizedNumber,
        KI_HANKAKA: '0',
      },
      select: {id: true, NO_SIRETYUM: true, MJ_SYAMEI: true},
    }),
    // Ucarに紐づく98番号に価格未設定のOldCars_Baseがあるかチェック
    prisma.ucar.findMany({
      where: {
        number98: normalizedNumber,
        Number98: {
          OldCars_Base: {some: {KI_HANKAKA: '0'}},
        },
      },
      select: {sateiID: true},
    }),
  ])

  // 条件チェック結果を構築
  const unavailableReasons: UnavailableReason[] = [
    {
      condition: '占有フラグ',
      detail: number98.occupied ? 'ONになっています' : 'OFF（OK）',
      matched: !!number98.occupied,
    },
    {
      condition: '在庫データ(ZAIKO_Base)',
      detail: hasZaiko ? `紐づいています（${hasZaiko.MJ_FURUSYAM ?? '車名不明'}）` : '紐づきなし（OK）',
      matched: !!hasZaiko,
    },
    {
      condition: '古物データ売上金額',
      detail:
        nonPricedOldCars.length > 0
          ? `未設定(0)が${nonPricedOldCars.length}件あります（${nonPricedOldCars.map(o => o.NO_SIRETYUM || o.MJ_SYAMEI || 'ID:' + o.id).join(', ')}）`
          : 'すべて設定済み（OK）',
      matched: nonPricedOldCars.length > 0,
    },
    {
      condition: 'Ucar経由の古物データ',
      detail:
        ucarWithNonPricedOldCars.length > 0
          ? `売上金額未設定の古物に紐づくUcarがあります（${ucarWithNonPricedOldCars.map(u => u.sateiID).join(', ')}）`
          : '問題なし（OK）',
      matched: ucarWithNonPricedOldCars.length > 0,
    },
  ]

  // 利用可能かどうかは、すべての条件がmatchedでないこと
  const isAvailable = unavailableReasons.every(r => !r.matched)

  // 関連データを取得
  const [ucarHistory, oldCarsHistory, zaikoHistory] = await Promise.all([
    // Ucar履歴
    prisma.ucar.findMany({
      where: {number98: normalizedNumber},
      select: {
        id: true,
        sateiID: true,
        createdAt: true,
        number98: true,
        NO_SIRETYUM: true,
        DD_SIIRE: true,
        plate: true,
        destination: true,
      },
      orderBy: {createdAt: 'desc'},
    }),
    // OldCars_Base履歴
    prisma.oldCars_Base.findMany({
      where: {NO_SYARYOU: normalizedNumber},
      select: {
        id: true,
        APPINDEX: true,
        NO_SIRETYUM: true,
        NO_SYARYOU: true,
        MJ_SYAMEI: true,
        DD_SIIRE: true,
        KI_SIIREKA: true,
        KI_HANKAKA: true,
        DD_URIAGE: true,
        NO_SYADAIBA: true,
        KB_URIAGE: true,
      },
      orderBy: {DD_SIIRE: 'desc'},
    }),
    // ZAIKO_Base履歴
    prisma.zAIKO_Base.findMany({
      where: {NO_SYARYOU: normalizedNumber},
      select: {
        id: true,
        APPINDEX: true,
        NO_SYARYOU: true,
        DD_SIIRE: true,
        MJ_FURUSYAM: true,
        NO_SYADAIBA: true,
        MJ_ZAIKOST: true,
        CD_ZAIKOTEN: true,
      },
      orderBy: {DD_SIIRE: 'desc'},
    }),
  ])

  return {
    number98,
    isAvailable,
    unavailableReasons,
    ucarHistory,
    oldCarsHistory,
    zaikoHistory,
  }
}

/**
 * 98番号を部分一致検索してリストを返す
 */
export async function search98NumberList(
  searchNumber: string,
  options?: {take?: number}
): Promise<
  {
    number: string
    sortNumber: number | null
    occupied: boolean | null
    ucarCount: number
    oldCarsCount: number
  }[]
> {
  const {take = 50} = options ?? {}

  if (!searchNumber || searchNumber.trim() === '') {
    return []
  }

  // 入力から数字のみ抽出して部分一致検索
  const digitsOnly = searchNumber.replace(/\D/g, '')
  const searchPattern = digitsOnly || searchNumber.trim()

  const results = await prisma.number98.findMany({
    where: {
      number: {contains: searchPattern},
    },
    select: {
      number: true,
      sortNumber: true,
      occupied: true,
      _count: {
        select: {
          Ucar: true,
          OldCars_Base: true,
        },
      },
    },
    orderBy: {sortNumber: 'asc'},
    take,
  })

  return results.map(r => ({
    number: r.number,
    sortNumber: r.sortNumber,
    occupied: r.occupied,
    ucarCount: r._count.Ucar,
    oldCarsCount: r._count.OldCars_Base,
  }))
}
