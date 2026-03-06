import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'
import {UcarProcessCl, UcarWithProcess, buildProcessDateMap} from '@app/(apps)/ucar/class/UcarProcessCl'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

// ============================================================
// 98番号集計の条件切り替え設定
// ============================================================

/** 分母にCR到着（CR02通過）を条件とするか。false にすると全車両が分母になる */
export const NUM98_REQUIRE_CR_ARRIVED = false

/** 98番号付帯の判定方法: 'number98' = number98フィールドに値がある / 'oldCarsLink' = OldCars_Baseと紐づいている */
export const NUM98_ATTACH_MODE: 'number98' | 'oldCarsLink' = 'oldCarsLink'

/** その他指標の集計対象から特定店舗を除外するか。null なら除外なし */
export const OTHER_METRICS_EXCLUDE_STORE_NAME: string | null = '中古車グループ'

// ============================================================
// 型定義
// ============================================================

export type ProcessSummary = {
  processKey: string
  label: string
  dashboardLabel: string
  color: string
  /** 現在の滞留台数（フィルタなし・全車両対象） */
  currentCount: number
  targetDays: number | null
  /** 全期間の平均LT（日） */
  avgLT: number | null
  /** QRシート発行月ごとの平均LT */
  monthlyLT: Record<string, number | null>
  /** QRシート発行月ごとのLT算出対象台数 */
  monthlyCount: Record<string, number>
}

/** 仕分け別台数の月別集計 */
export type ShiwakeBreakdown = {
  key: string
  label: string
  color: string
  total: number
  monthly: Record<string, number>
}

/** 98番号集計 */
export type Number98Stats = {
  qrSheetTotal: number
  qrSheetMonthly: Record<string, number>
  num98AttachedTotal: number
  num98AttachedMonthly: Record<string, number>
  num98NotAttachedTotal: number
  num98NotAttachedMonthly: Record<string, number>
  num98RatioTotal: number | null
  num98RatioMonthly: Record<string, number | null>
}

/** 期間フィルタ付きLT集計結果（LeadTimeBarChart 用） */
export type PeriodLTSummary = {
  processKey: string
  dashboardLabel: string
  color: string
  avgLT: number | null
}

export type DashboardResult = {
  processes: ProcessSummary[]
  retailRatio: Record<string, number>
  retailRatioTotal: number | null
  shiwakeBreakdown: ShiwakeBreakdown[]
  shiwakeGrandTotal: number
  shiwakeGrandMonthly: Record<string, number>
  number98Stats: Number98Stats
  totalCount: number
  totalAvgLT: number | null
  /** データに含まれる全月キー（YY-MM 形式、ソート済み） */
  months: string[]
}

// ============================================================
// ヘルパー
// ============================================================

/** 2つのDateの差を日数で返す */
function diffDays(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime()
  return ms / (1000 * 60 * 60 * 24)
}

/** Dateから月キー（YY-MM）を返す（UTC→JST変換済み） */
function toMonthKey(d: Date): string {
  return formatDate(d, 'YY-MM') as string
}

// ============================================================
// デフォルトのLT計算
// ============================================================

/**
 * デフォルトのLT計算:
 * 自工程の完了日時から、次に実施された後続工程の日時までの差（日数）を返す。
 * スキップ対応: 直接の次工程が未実施でも、それ以降で最初に実施された工程との間をLTとする。
 * まだ後続工程がない場合は null。
 */
function defaultCalcLT(processKey: string, car: UcarWithProcess): number | null {
  const item = UcarProcessCl.CODE.raw[processKey]
  if (!item) return null

  const dateMap = buildProcessDateMap(car)
  const selfDate = dateMap.get(item.code)
  if (!selfDate) return null

  const subsequentKeys = UcarProcessCl.getSubsequentKeys(processKey)
  let nextDate: Date | null = null

  for (const sk of subsequentKeys) {
    const skItem = UcarProcessCl.CODE.raw[sk]
    if (skItem?.code) {
      const d = dateMap.get(skItem.code)
      if (d) {
        nextDate = d
        break
      }
    }
  }

  if (!nextDate) return null
  return diffDays(selfDate, nextDate)
}

// ============================================================
// メイン集計関数
// ============================================================

/**
 * ダッシュボード集計
 *
 * @param cars     小売系（KOURI/CPO/ONLINE）の車両 → 工程LT・滞留台数・グラフに使用
 * @param allCars  全車両（フィルタなし） → その他指標（仕分け別台数・小売割合・98番号集計）に使用
 */
export function calcDashboardData(cars: UcarWithProcess[], allCars: UcarWithProcess[]): DashboardResult {
  const dashboardProcesses = UcarProcessCl.getDashboardProcesses()
  const monthSet = new Set<string>()

  // 各工程のLT値を蓄積
  const ltAccumulator: Record<
    string,
    {
      all: number[]
      monthly: Record<string, number[]>
      retentionCount: number
      monthlyCount: Record<string, number>
    }
  > = {}

  for (const proc of dashboardProcesses) {
    ltAccumulator[proc.key] = {all: [], monthly: {}, retentionCount: 0, monthlyCount: {}}
  }

  // --- 車両ごとに集計 ---
  for (const car of cars) {
    // QRシート発行月（LT月別グルーピング用）
    const qrMonth = car.qrIssuedAt ? toMonthKey(car.qrIssuedAt) : null
    if (qrMonth) monthSet.add(qrMonth)

    for (const proc of dashboardProcesses) {
      const acc = ltAccumulator[proc.key]

      // --- 滞留判定（フィルタなし・全車両対象） ---
      const isRetained = proc.calcRetention?.(car) ?? false

      if (isRetained) {
        acc.retentionCount++
      }

      // --- LT計算（QRシート発行月でグルーピング） ---
      const lt = proc.calcLT ? proc.calcLT(car) : defaultCalcLT(proc.key, car)

      if (lt !== null && lt >= 0) {
        acc.all.push(lt)

        if (qrMonth) {
          if (!acc.monthly[qrMonth]) acc.monthly[qrMonth] = []
          acc.monthly[qrMonth].push(lt)
          acc.monthlyCount[qrMonth] = (acc.monthlyCount[qrMonth] ?? 0) + 1
        }
      }
    }
  }

  // --- 月リスト（ソート済み） ---
  const months = Array.from(monthSet).sort()

  // --- 結果構築 ---
  const processes: ProcessSummary[] = dashboardProcesses.map(proc => {
    const acc = ltAccumulator[proc.key]
    const avg = acc.all.length > 0 ? acc.all.reduce((a, b) => a + b, 0) / acc.all.length : null

    const monthlyLT: Record<string, number | null> = {}
    const monthlyCount: Record<string, number> = {}
    for (const m of months) {
      const mLTs = acc.monthly[m]
      monthlyLT[m] = mLTs && mLTs.length > 0 ? mLTs.reduce((a, b) => a + b, 0) / mLTs.length : null
      monthlyCount[m] = acc.monthlyCount[m] ?? 0
    }

    return {
      processKey: proc.key,
      label: proc.label,
      dashboardLabel: proc.dashboardLabel,
      color: proc.color ?? '#888',
      currentCount: acc.retentionCount,
      targetDays: null,
      avgLT: avg !== null ? Math.round(avg * 100) / 100 : null,
      monthlyLT,
      monthlyCount,
    }
  })

  // 全体集計
  const totalCount = processes.reduce((sum, p) => sum + p.currentCount, 0)
  const allLTs = Object.values(ltAccumulator).flatMap(a => a.all)
  const totalAvgLT = allLTs.length > 0 ? Math.round((allLTs.reduce((a, b) => a + b, 0) / allLTs.length) * 100) / 100 : null

  // ============================================================
  // 仕分け別台数集計（UCAR_CODE.SHIWAKE 準拠）
  // ============================================================
  const SHIWAKE_DEFS: {key: string; code: string; label: string; color: string}[] = Object.keys(UCAR_CODE.SHIWAKE.raw).map(
    key => ({
      key: key,
      code: UCAR_CODE.SHIWAKE.raw[key].code,
      label: UCAR_CODE.SHIWAKE.raw[key].label,
      color: UCAR_CODE.SHIWAKE.raw[key].color,
    })
  )

  const shiwakeCount: Record<string, {total: number; monthly: Record<string, number>}> = {}
  for (const def of SHIWAKE_DEFS) {
    shiwakeCount[def.key] = {total: 0, monthly: {}}
  }

  // --- その他指標は allCars（全件・フィルタなし）を使用 ---
  let qrSheetTotal = 0
  const qrSheetMonthly: Record<string, number> = {}
  let num98CrTotal = 0
  const num98CrMonthly: Record<string, number> = {}

  for (const car of allCars) {
    if (car.isRental) continue
    // 店舗除外フィルタ
    if (OTHER_METRICS_EXCLUDE_STORE_NAME && car.storeName === OTHER_METRICS_EXCLUDE_STORE_NAME) continue

    const qrMonth = car.qrIssuedAt ? toMonthKey(car.qrIssuedAt) : null
    if (qrMonth) monthSet.add(qrMonth)

    // 仕分け集計（全非レンタル対象）
    if (car.destination) {
      const def = SHIWAKE_DEFS.find(d => d.code === car.destination)
      if (def) {
        shiwakeCount[def.key].total++
        if (qrMonth) {
          shiwakeCount[def.key].monthly[qrMonth] = (shiwakeCount[def.key].monthly[qrMonth] ?? 0) + 1
        }
      }
    }

    // 98番号セクション: qrSheetTotal の分母と付帯判定を同じ粒度にする
    const dateMap = buildProcessDateMap(car)
    const passesCrCondition = NUM98_REQUIRE_CR_ARRIVED ? dateMap.has('CR02') : true

    // CR条件を通過しない車両は発行台数にも含めない
    if (!passesCrCondition) continue

    qrSheetTotal++
    if (qrMonth) {
      qrSheetMonthly[qrMonth] = (qrSheetMonthly[qrMonth] ?? 0) + 1
    }

    const isNum98Attached = NUM98_ATTACH_MODE === 'number98' ? !!car.number98 : !!car.hasOldCarsLink

    if (isNum98Attached) {
      num98CrTotal++
      if (qrMonth) {
        num98CrMonthly[qrMonth] = (num98CrMonthly[qrMonth] ?? 0) + 1
      }
    }
  }

  const finalMonths = Array.from(monthSet).sort()

  const shiwakeBreakdown: ShiwakeBreakdown[] = SHIWAKE_DEFS.map(def => ({
    key: def.key,
    label: def.label,
    color: def.color,
    total: shiwakeCount[def.key].total,
    monthly: shiwakeCount[def.key].monthly,
  })).sort((a: ShiwakeBreakdown, b: ShiwakeBreakdown) => {
    const isKouri = a.key === 'KOURI' ? -1 : 1
    return isKouri
  })

  const shiwakeGrandTotal = SHIWAKE_DEFS.reduce((sum, def) => sum + shiwakeCount[def.key].total, 0)
  const shiwakeGrandMonthly: Record<string, number> = {}
  for (const m of finalMonths) {
    shiwakeGrandMonthly[m] = SHIWAKE_DEFS.reduce((sum, def) => sum + (shiwakeCount[def.key].monthly[m] ?? 0), 0)
  }

  const retailRatio: Record<string, number> = {}
  for (const m of finalMonths) {
    const kouriCount = shiwakeCount['KOURI'].monthly[m] ?? 0
    const totalInMonth = shiwakeGrandMonthly[m] ?? 0
    retailRatio[m] = totalInMonth > 0 ? Math.round((kouriCount / totalInMonth) * 100) : 0
  }
  const retailRatioTotal = shiwakeGrandTotal > 0 ? Math.round((shiwakeCount['KOURI'].total / shiwakeGrandTotal) * 100) : null

  // 付帯率: qrSheetTotal が既にCR条件付きなので、そのまま分母として使用
  const num98RatioTotal = qrSheetTotal > 0 ? Math.round((num98CrTotal / qrSheetTotal) * 1000) / 10 : null
  const num98RatioMonthly: Record<string, number | null> = {}
  for (const m of finalMonths) {
    const denominator = qrSheetMonthly[m] ?? 0
    const attached = num98CrMonthly[m] ?? 0
    num98RatioMonthly[m] = denominator > 0 ? Math.round((attached / denominator) * 1000) / 10 : null
  }

  // 未付帯 = 発行台数 - 付帯済
  const num98NotAttachedTotal = qrSheetTotal - num98CrTotal
  const num98NotAttachedMonthly: Record<string, number> = {}
  for (const m of finalMonths) {
    const denominator = qrSheetMonthly[m] ?? 0
    const attached = num98CrMonthly[m] ?? 0
    num98NotAttachedMonthly[m] = denominator - attached
  }

  const number98Stats: Number98Stats = {
    qrSheetTotal,
    qrSheetMonthly,
    num98AttachedTotal: num98CrTotal,
    num98AttachedMonthly: num98CrMonthly,
    num98NotAttachedTotal,
    num98NotAttachedMonthly,
    num98RatioTotal,
    num98RatioMonthly,
  }

  return {
    processes,
    retailRatio,
    retailRatioTotal,
    shiwakeBreakdown,
    shiwakeGrandTotal,
    shiwakeGrandMonthly,
    number98Stats,
    totalCount,
    totalAvgLT,
    months: finalMonths,
  }
}

// ============================================================
// 期間別LT集計（LeadTimeBarChart 用）
// ============================================================

/**
 * createdAt が指定期間内の車両のみを対象に、工程ごとの平均LTを算出する。
 *
 * @param cars       全車両データ
 * @param periodStart 期間開始（含む）
 * @param periodEnd   期間終了（含む）
 */
export function calcPeriodLT(cars: UcarWithProcess[]): PeriodLTSummary[] {
  const dashboardProcesses = UcarProcessCl.getDashboardProcesses()

  // Prisma側で createdAt フィルタ済みの車両を受け取る前提
  return dashboardProcesses.map(proc => {
    const lts: number[] = []

    for (const car of cars) {
      const lt = proc.calcLT ? proc.calcLT(car) : defaultCalcLT(proc.key, car)
      if (lt !== null && lt >= 0) {
        lts.push(lt)
      }
    }

    const avg = lts.length > 0 ? Math.round((lts.reduce((a, b) => a + b, 0) / lts.length) * 100) / 100 : null

    return {
      processKey: proc.key,
      dashboardLabel: proc.dashboardLabel,
      color: proc.color ?? '#888',
      avgLT: avg,
    }
  })
}
