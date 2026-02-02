'use server'

import prisma from 'src/lib/prisma'
import {normalizeNumber98, getLastNumber98History, findNextAvailableNumber98} from '@app/(apps)/ucar/(lib)/num98/num98Constants'

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
 * ソート順のオプション
 */
export type SortOrder = 'default' | 'siireDate'

/**
 * 検索オプション
 */
export type SearchOptions = {
  sortOrder?: SortOrder
}

/**
 * 98番号を検索し、関連データと利用可否を返す
 */
export async function search98Number(searchNumber: string, options?: SearchOptions): Promise<Search98NumberResult> {
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

  // ソート順の設定
  const sortOrder = options?.sortOrder ?? 'default'
  const ucarOrderBy = sortOrder === 'siireDate' ? {DD_SIIRE: 'desc' as const} : {createdAt: 'desc' as const}
  const oldCarsOrderBy = sortOrder === 'siireDate' ? {DD_SIIRE: 'desc' as const} : {DD_SIIRE: 'desc' as const}
  const zaikoOrderBy = sortOrder === 'siireDate' ? {DD_SIIRE: 'desc' as const} : {DD_SIIRE: 'desc' as const}

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
      orderBy: ucarOrderBy,
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
      orderBy: oldCarsOrderBy,
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
      orderBy: zaikoOrderBy,
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

/**
 * 次の利用可能な98番号を取得する
 */
export async function getNextNumber98(): Promise<{nextNumber98: string | null; lastIssuedNumber: string | null}> {
  const lastHistory = await getLastNumber98History()
  const nextNumber98 = await findNextAvailableNumber98(lastHistory?.number)

  return {
    nextNumber98,
    lastIssuedNumber: lastHistory?.number ?? null,
  }
}

/**
 * 最後に使用した98番号を設定する
 */
export async function setLastUsedNumber98(
  lastUsedNumber: string
): Promise<{success: boolean; message: string; nextNumber98?: string}> {
  const normalizedNumber = normalizeNumber98(lastUsedNumber)

  // 対象の98番号が存在するか確認
  const targetNum98 = await prisma.number98.findUnique({
    where: {number: normalizedNumber},
    select: {number: true},
  })

  if (!targetNum98) {
    return {success: false, message: `98番号「${normalizedNumber}」は存在しません`}
  }

  // トランザクションで履歴を更新
  await prisma.$transaction(async tx => {
    await tx.number98IssueHistory.deleteMany({})
    await tx.number98IssueHistory.create({
      data: {number: normalizedNumber},
    })
  })

  // 次の利用可能な番号を取得
  const nextNumber98 = await findNextAvailableNumber98(normalizedNumber)

  return {
    success: true,
    message: `最後に使用した98番号を「${normalizedNumber}」に設定しました`,
    nextNumber98: nextNumber98 ?? undefined,
  }
}

/**
 * 最新の98番号発行履歴を取得する
 */
export async function getNumber98IssueHistory(take: number = 30) {
  return prisma.number98IssueHistory.findMany({
    orderBy: {createdAt: 'desc'},
    take,
    include: {
      Number98: {
        include: {
          Ucar: {
            orderBy: {DD_SIIRE: 'desc'},
          },
        },
      },
    },
  })
}

/**
 * 最新のUcar 98番号付与履歴を取得する
 */
export async function getUcar98AssignmentHistory(take: number = 30) {
  return prisma.ucar.findMany({
    where: {number98: {not: null}},
    select: {
      sateiID: true,
      number98: true,
      updatedAt: true,
      plate: true,
      destination: true,
    },
    orderBy: {updatedAt: 'desc'},
    take,
  })
}

/**
 * 統合検索結果の型（査定ID・98番号・車体番号で検索）
 */
export type UnifiedSearchResult = {
  /** 検索タイプ */
  searchType: 'sateiID' | 'number98' | 'chassisNumber' | 'unknown'
  /** 検索クエリ */
  query: string
  /** Ucar履歴 */
  ucarHistory: {
    id: number
    sateiID: string
    createdAt: Date
    number98: string | null
    NO_SIRETYUM: string | null
    DD_SIIRE: Date | null
    plate: string | null
    destination: string | null
    tmpChassisNumber: string | null
  }[]
}

/**
 * 検索クエリのタイプを判定する
 */
function detectSearchType(query: string): 'sateiID' | 'number98' | 'chassisNumber' | 'unknown' {
  const trimmed = query.trim()

  // 査定ID形式: U + 数字 または U-数字 形式
  if (/^U[-_]?\d+/i.test(trimmed)) {
    return 'sateiID'
  }

  // 98番号形式: 98で始まる または 98- で始まる
  if (/^98[-\s]?\d+/i.test(trimmed)) {
    return 'number98'
  }

  // 数字のみの場合（98番号または車体番号の可能性）
  const digitsOnly = trimmed.replace(/\D/g, '')
  if (digitsOnly.length > 0) {
    // 98で始まる場合は98番号
    if (digitsOnly.startsWith('98')) {
      return 'number98'
    }
    // それ以外は車体番号と判定
    return 'chassisNumber'
  }

  // アルファベットが含まれる場合は車体番号（フレーム番号）の可能性
  if (/^[A-Z0-9-]+$/i.test(trimmed) && trimmed.length >= 5) {
    return 'chassisNumber'
  }

  return 'unknown'
}

/**
 * 統合検索: 査定ID・98番号・車体番号で検索
 */
export async function unifiedSearch(query: string, options?: SearchOptions): Promise<UnifiedSearchResult> {
  if (!query || query.trim() === '') {
    return {
      searchType: 'unknown',
      query: '',
      ucarHistory: [],
    }
  }

  const trimmedQuery = query.trim()
  const searchType = detectSearchType(trimmedQuery)
  const sortOrder = options?.sortOrder ?? 'default'
  const orderBy = sortOrder === 'siireDate' ? {DD_SIIRE: 'desc' as const} : {createdAt: 'desc' as const}

  let whereCondition: any = {}

  switch (searchType) {
    case 'sateiID':
      // 査定IDで検索（部分一致）
      whereCondition = {sateiID: {contains: trimmedQuery.toUpperCase()}}
      break
    case 'number98':
      {
        // 98番号で検索（正規化して部分一致）
        const normalizedNumber = normalizeNumber98(trimmedQuery)
        whereCondition = {number98: {contains: normalizedNumber.replace(/\s/g, '')}}
      }

      break
    case 'chassisNumber':
      // 車体番号で検索（tmpChassisNumber または plate で部分一致）
      whereCondition = {
        OR: [{tmpChassisNumber: {contains: trimmedQuery}}, {plate: {contains: trimmedQuery}}],
      }
      break
    default:
      // キーワード検索（すべてのフィールドで部分一致）
      whereCondition = {
        OR: [
          {sateiID: {contains: trimmedQuery}},
          {number98: {contains: trimmedQuery}},
          {tmpChassisNumber: {contains: trimmedQuery}},
          {plate: {contains: trimmedQuery}},
        ],
      }
  }

  const ucarHistory = await prisma.ucar.findMany({
    where: whereCondition,
    select: {
      id: true,
      sateiID: true,
      createdAt: true,
      number98: true,
      NO_SIRETYUM: true,
      DD_SIIRE: true,
      plate: true,
      destination: true,
      tmpChassisNumber: true,
    },
    orderBy,
    take: 100,
  })

  return {
    searchType,
    query: trimmedQuery,
    ucarHistory,
  }
}
