'use server'

import prisma from 'src/lib/prisma'
import {Prisma} from '@prisma/generated/prisma/client'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {UcarWithProcess} from '@app/(apps)/ucar/class/UcarProcessCl'
import {calcDashboardData, calcPeriodLT, DashboardResult, PeriodLTSummary} from './lib/calcDashboardData'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import {UCAR_CONSTANTS} from '@app/(apps)/ucar/(constants)/ucar-constants'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'
import {QueryBuilder} from '@app/(apps)/ucar/class/QueryBuilder'

// ============================================================
// 共通定義
// ============================================================

/** 小売系の仕分け条件（工程LT・滞留・グラフの対象） */
const KOURI_KEI_WHERE: Prisma.UcarWhereInput = {
  destination: {
    in: [
      //
      UCAR_CODE.SHIWAKE.raw.KOURI.code,
      UCAR_CODE.SHIWAKE.raw.CPO.code,
      UCAR_CODE.SHIWAKE.raw.ONLINE.code,
    ],
  },
}

/** 共通の select フィールド */
const UCAR_SELECT = {
  sateiID: true,
  createdAt: true,
  destination: true,
  number98: true,
  qrIssuedAt: true,
  tmpRentalStoreId: true,
  UcarProcess: {
    select: {processCode: true, date: true},
    orderBy: {date: 'asc'} as const,
  },
  OldCars_Base: {
    select: {DD_URIAGE: true},
  },
} satisfies Prisma.UcarSelect

/** 共通の基本 WHERE 条件 */
function baseWhere(): Prisma.UcarWhereInput[] {
  return [UCAR_CONSTANTS.getCommonQuery({}), {daihatsuReserve: null}]
}

/**
 * YYYY-MM-DD 文字列をJST日付としてUTC Date に変換する。
 * Date.UTC を使うためサーバーのタイムゾーン設定に依存しない。
 */
function jstDateStrToUtc(dateStr: string, endOfDay = false): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  const JST_OFFSET_MS = 9 * 60 * 60 * 1000
  if (endOfDay) {
    return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999) - JST_OFFSET_MS)
  }
  return new Date(Date.UTC(y, m - 1, d) - JST_OFFSET_MS)
}

// ============================================================
// Prisma結果 → UcarWithProcess 変換
// ============================================================

type PrismaCarResult = {
  sateiID: string
  createdAt: Date
  destination: string | null
  number98: string | null
  qrIssuedAt: Date
  tmpRentalStoreId: number | null
  UcarProcess: {processCode: string; date: Date | null}[]
  OldCars_Base: {DD_URIAGE: Date | null} | null
}

function toUcarWithProcess(car: PrismaCarResult): UcarWithProcess {
  return {
    sateiID: car.sateiID,
    processes: car.UcarProcess.map(p => ({
      processCode: p.processCode,
      date: p.date,
    })),
    destination: car.destination ?? undefined,
    number98: car.number98 ?? undefined,
    qrIssuedAt: car.qrIssuedAt,
    createdAt: car.createdAt,
    isRental: car.tmpRentalStoreId != null,
    DD_URIAGE: car.OldCars_Base?.DD_URIAGE ?? undefined,
  }
}

// ============================================================
// 型定義
// ============================================================

export type FetchDashboardResponse = {
  success: boolean
  message?: string
  result: DashboardResult | null
}

// ============================================================
// Server Action: ダッシュボードデータ取得
// ============================================================

/**
 * 2つのクエリを実行:
 * - 小売系（KOURI/CPO/ONLINE）: 工程LT・滞留台数・グラフ用
 * - 全件: その他指標（仕分け別台数・小売割合・98番号集計）用
 */
export async function fetchDashboardData(): Promise<FetchDashboardResponse> {
  try {
    await initServerComopnent({query: {}})

    const [carsKouriKei, carsAll] = await Promise.all([
      // 小売系のみ（工程LT・滞留用）
      prisma.ucar.findMany({
        where: {AND: [...baseWhere(), KOURI_KEI_WHERE].filter(Boolean)},
        select: UCAR_SELECT,
      }),

      // 全件（その他指標用）
      prisma.ucar.findMany({
        where: {AND: [...baseWhere()].filter(Boolean)},
        select: UCAR_SELECT,
      }),
    ])

    const mappedKouriKei = carsKouriKei.map(car => toUcarWithProcess(car))
    const mappedAll = carsAll.map(car => toUcarWithProcess(car))
    const result = calcDashboardData(mappedKouriKei, mappedAll)

    return {success: true, result}
  } catch (error) {
    console.error('fetchDashboardData error:', error)
    return {
      success: false,
      message: 'ダッシュボードデータの取得中にエラーが発生しました',
      result: null,
    }
  }
}

// ============================================================
// Server Action: 期間別LT取得（LeadTimeBarChart 用）
// ============================================================

export type FetchPeriodLTParams = {
  periodStart: string
  periodEnd: string
}

export type FetchPeriodLTResponse = {
  success: boolean
  message?: string
  result: PeriodLTSummary[] | null
}

/**
 * createdAt が指定期間内の小売系車両を対象に、工程ごとの平均LTを算出して返す。
 */
export async function fetchPeriodLT(params: FetchPeriodLTParams): Promise<FetchPeriodLTResponse> {
  try {
    await initServerComopnent({query: {}})

    const periodStartUtc = jstDateStrToUtc(params.periodStart)
    const periodEndUtc = jstDateStrToUtc(params.periodEnd, true)

    const cars = await prisma.ucar.findMany({
      where: {
        AND: [...baseWhere(), KOURI_KEI_WHERE, {createdAt: {gte: periodStartUtc, lte: periodEndUtc}}].filter(Boolean),
      },
      select: UCAR_SELECT,
    })

    console.log(
      `[fetchPeriodLT] period: ${params.periodStart} ~ ${params.periodEnd} → UTC: ${periodStartUtc.toISOString()} ~ ${periodEndUtc.toISOString()}, cars: ${cars.length}件`
    )

    const mapped = cars.map(car => toUcarWithProcess(car))
    const result = calcPeriodLT(mapped)

    return {success: true, result}
  } catch (error) {
    console.error('fetchPeriodLT error:', error)
    return {
      success: false,
      message: '期間別LTデータの取得中にエラーが発生しました',
      result: null,
    }
  }
}

// ============================================================
// Server Action: 工程別滞留車両一覧取得（モーダル用）
// ============================================================

export type RetentionCarDetail = {
  sateiID: string
  tmpBrandName: string | null
  tmpModelName: string | null
  tmpGrade: string | null
  tmpColor: string | null
  tmpPlate: string | null
  createdAt: Date
  qrIssuedAt: Date
  storeName: string | null
  userName: string | null
  ai21: {
    DD_URIAGE: Date | null
    CD_ZAIKOTEN: string | null
    KI_HANKAKA: number | null
  }
  processMap: Record<string, string | null>
}

export type FetchRetentionCarsResponse = {
  success: boolean
  message?: string
  result: RetentionCarDetail[] | null
}

/**
 * 指定工程に現在滞留している小売系車両の一覧を返す。
 */
export async function fetchProcessRetentionCars(processKey: string): Promise<FetchRetentionCarsResponse> {
  try {
    await initServerComopnent({query: {}})

    const item = UcarProcessCl.CODE.raw[processKey]
    if (!item) {
      return {success: false, message: '工程が見つかりません', result: null}
    }

    const subsequentCodes = UcarProcessCl.getSubsequentKeys(processKey)
      .map(k => UcarProcessCl.CODE.raw[k]?.code)
      .filter(Boolean) as string[]

    const cars = await prisma.ucar.findMany({
      where: {
        AND: [
          ...baseWhere(),
          KOURI_KEI_WHERE,
          {UcarProcess: {some: {processCode: item.code}}},
          ...(subsequentCodes.length > 0
            ? subsequentCodes.map(code => ({
                UcarProcess: {none: {processCode: code}},
              }))
            : []),
        ].filter(Boolean),
      },
      include: QueryBuilder.getInclude({}).ucar.include,
      orderBy: {qrIssuedAt: 'desc'},
      take: 200,
    })

    const result: RetentionCarDetail[] = cars.map(car => {
      const processMap: Record<string, string | null> = {}
      for (const p of (car as any).UcarProcess) {
        processMap[p.processCode] = p.date?.toISOString() ?? null
      }
      return {
        sateiID: car.sateiID,
        tmpBrandName: (car as any).tmpBrandName,
        tmpModelName: (car as any).tmpModelName,
        tmpGrade: (car as any).tmpGrade,
        tmpColor: (car as any).tmpColor,
        tmpPlate: (car as any).tmpPlate,
        createdAt: car.createdAt,
        qrIssuedAt: car.qrIssuedAt,
        storeName: (car as any).Store?.name ?? null,
        userName: (car as any).User?.name ?? null,
        ai21: {
          DD_URIAGE: (car as any).OldCars_Base?.DD_URIAGE ?? null,
          CD_ZAIKOTEN: (car as any).OldCars_Base?.ZAIKO_Base?.CD_ZAIKOTEN ?? null,
          KI_HANKAKA: (car as any).OldCars_Base?.KI_HANKAKA ?? null,
        },
        processMap,
      }
    })

    return {success: true, result}
  } catch (error) {
    console.error('fetchProcessRetentionCars error:', error)
    return {
      success: false,
      message: '滞留車両データの取得中にエラーが発生しました',
      result: null,
    }
  }
}

// ============================================================
// Server Action: LTグラフ用 工程別車両一覧取得（モーダル用）
// ============================================================

export type FetchLTProcessCarsParams = {
  processKey: string
  periodStart: string // YYYY-MM-DD
  periodEnd: string // YYYY-MM-DD
}

/**
 * LT計算対象の車両一覧を返す。
 * 条件: 小売系 & createdAtが期間内 & 自工程完了済み & いずれかの後続工程が完了済み
 */
export async function fetchLTProcessCars(params: FetchLTProcessCarsParams): Promise<FetchRetentionCarsResponse> {
  try {
    const item = UcarProcessCl.CODE.raw[params.processKey]
    if (!item) {
      return {success: false, message: '工程が見つかりません', result: null}
    }

    const periodStartUtc = jstDateStrToUtc(params.periodStart)
    const periodEndUtc = jstDateStrToUtc(params.periodEnd, true)

    // 後続工程コード一覧
    const subsequentCodes = UcarProcessCl.getSubsequentKeys(params.processKey)
      .map(k => UcarProcessCl.CODE.raw[k]?.code)
      .filter(Boolean) as string[]

    const cars = await prisma.ucar.findMany({
      where: {
        AND: [
          ...baseWhere(),
          KOURI_KEI_WHERE,
          {createdAt: {gte: periodStartUtc, lte: periodEndUtc}},
          // 自工程が完了済み
          {UcarProcess: {some: {processCode: item.code}}},
          // いずれかの後続工程が完了済み（LTが計算可能）
          ...(subsequentCodes.length > 0 ? [{UcarProcess: {some: {processCode: {in: subsequentCodes}}}}] : []),
        ].filter(Boolean),
      },
      include: QueryBuilder.getInclude({}).ucar.include,
      // select: {
      //   sateiID: true,
      //   tmpBrandName: true,
      //   tmpModelName: true,
      //   tmpColor: true,
      //   tmpPlate: true,
      //   createdAt: true,
      //   qrIssuedAt: true,
      //   UcarProcess: {
      //     select: {processCode: true, date: true},
      //     orderBy: {date: 'asc'},
      //   },
      // },
      orderBy: {qrIssuedAt: 'desc'},
      take: 200,
    })

    const result: RetentionCarDetail[] = cars.map(car => {
      const processMap: Record<string, string | null> = {}
      for (const p of (car as any).UcarProcess as any[]) {
        processMap[p.processCode] = p.date?.toISOString() ?? null
      }
      return {
        sateiID: car.sateiID,
        tmpBrandName: (car as any).tmpBrandName,
        tmpModelName: (car as any).tmpModelName,
        tmpGrade: (car as any).tmpGrade,
        tmpColor: (car as any).tmpColor,
        tmpPlate: (car as any).tmpPlate,
        createdAt: car.createdAt,
        qrIssuedAt: car.qrIssuedAt,
        storeName: (car as any).Store?.name ?? null,
        userName: (car as any).User?.name ?? null,
        ai21: {
          DD_URIAGE: (car as any).OldCars_Base?.DD_URIAGE ?? null,
          CD_ZAIKOTEN: (car as any).OldCars_Base?.ZAIKO_Base?.CD_ZAIKOTEN ?? null,
          KI_HANKAKA: (car as any).OldCars_Base?.KI_HANKAKA ?? null,
        },
        processMap,
      }
    })

    return {success: true, result}
  } catch (error) {
    console.error('fetchLTProcessCars error:', error)
    return {
      success: false,
      message: 'LT車両データの取得中にエラーが発生しました',
      result: null,
    }
  }
}
