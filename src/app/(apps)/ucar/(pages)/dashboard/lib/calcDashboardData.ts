import {UcarProcessCl, UcarWithProcess} from '@app/(apps)/ucar/class/UcarProcessCl'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

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

/** 車両の工程日時をprocessCodeで引ける Map に変換 */
function buildProcessDateMap(car: UcarWithProcess): Map<string, Date> {
  const map = new Map<string, Date>()
  for (const p of car.processes) {
    if (p.date) {
      map.set(p.processCode, p.date)
    }
  }
  return map
}

/** processCode → processKey のマッピングを作成 */
function buildCodeToKeyMap(): Map<string, string> {
  const map = new Map<string, string>()
  for (const key of UcarProcessCl.MAIN_FLOW_ORDER) {
    const item = UcarProcessCl.CODE.raw[key]
    if (item?.code) {
      map.set(item.code, key)
    }
  }
  return map
}

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
// デフォルトの滞留判定
// ============================================================

/**
 * デフォルトの滞留判定:
 * 自工程が完了しており、かつ、自工程以降のすべての後続工程がいずれも未完了であれば「滞留中」
 */
function defaultCalcRetention(processKey: string, car: UcarWithProcess, codeToKey: Map<string, string>): boolean {
  const item = UcarProcessCl.CODE.raw[processKey]
  if (!item) return false

  const dateMap = buildProcessDateMap(car)
  const selfCompleted = dateMap.has(item.code)
  if (!selfCompleted) return false

  const subsequentKeys = UcarProcessCl.getSubsequentKeys(processKey)
  for (const sk of subsequentKeys) {
    const skItem = UcarProcessCl.CODE.raw[sk]
    if (skItem?.code && dateMap.has(skItem.code)) {
      return false
    }
  }

  return true
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
function defaultCalcLT(processKey: string, car: UcarWithProcess, codeToKey: Map<string, string>): number | null {
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
  const codeToKey = buildCodeToKeyMap()
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
      const isRetained = proc.calcRetention ? proc.calcRetention(car) : defaultCalcRetention(proc.key, car, codeToKey)

      if (isRetained) {
        acc.retentionCount++
      }

      // --- LT計算（QRシート発行月でグルーピング） ---
      const lt = proc.calcLT ? proc.calcLT(car) : defaultCalcLT(proc.key, car, codeToKey)

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
  const SHIWAKE_DEFS: {key: string; code: string; label: string; color: string}[] = [
    {key: 'KOURI', code: '02', label: '小売', color: '#00802f'},
    {key: 'OROSI', code: '01', label: '卸', color: '#005c80'},
    {key: 'SCRAP', code: '03', label: 'スクラップ', color: '#dcdcdc'},
    {key: 'CPO', code: '04', label: 'CPO', color: '#60b330'},
    {key: 'ONLINE', code: '05', label: 'オンライン', color: '#ff1d1d'},
  ]

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

    const qrMonth = car.qrIssuedAt ? toMonthKey(car.qrIssuedAt) : null
    if (qrMonth) monthSet.add(qrMonth)

    qrSheetTotal++
    if (qrMonth) {
      qrSheetMonthly[qrMonth] = (qrSheetMonthly[qrMonth] ?? 0) + 1
    }

    if (car.destination) {
      const def = SHIWAKE_DEFS.find(d => d.code === car.destination)
      if (def) {
        shiwakeCount[def.key].total++
        if (qrMonth) {
          shiwakeCount[def.key].monthly[qrMonth] = (shiwakeCount[def.key].monthly[qrMonth] ?? 0) + 1
        }
      }
    }

    const dateMap = buildProcessDateMap(car)
    if (dateMap.has('CR02') && car.number98) {
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
  }))

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

  let qrCrArrived = 0
  const qrCrArrivedMonthly: Record<string, number> = {}
  for (const car of allCars) {
    if (car.isRental) continue
    const dateMap = buildProcessDateMap(car)
    if (dateMap.has('CR02')) {
      qrCrArrived++
      const qrMonth = car.qrIssuedAt ? toMonthKey(car.qrIssuedAt) : null
      if (qrMonth) {
        qrCrArrivedMonthly[qrMonth] = (qrCrArrivedMonthly[qrMonth] ?? 0) + 1
      }
    }
  }

  const num98RatioTotal = qrCrArrived > 0 ? Math.round((num98CrTotal / qrCrArrived) * 1000) / 10 : null
  const num98RatioMonthly: Record<string, number | null> = {}
  for (const m of finalMonths) {
    const arrived = qrCrArrivedMonthly[m] ?? 0
    const attached = num98CrMonthly[m] ?? 0
    num98RatioMonthly[m] = arrived > 0 ? Math.round((attached / arrived) * 1000) / 10 : null
  }

  const number98Stats: Number98Stats = {
    qrSheetTotal,
    qrSheetMonthly,
    num98AttachedTotal: num98CrTotal,
    num98AttachedMonthly: num98CrMonthly,
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
  const codeToKey = buildCodeToKeyMap()
  const dashboardProcesses = UcarProcessCl.getDashboardProcesses()

  // Prisma側で createdAt フィルタ済みの車両を受け取る前提
  return dashboardProcesses.map(proc => {
    const lts: number[] = []

    for (const car of cars) {
      const lt = proc.calcLT ? proc.calcLT(car) : defaultCalcLT(proc.key, car, codeToKey)
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
