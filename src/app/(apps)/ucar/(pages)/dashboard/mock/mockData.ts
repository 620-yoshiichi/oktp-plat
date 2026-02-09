import {UcarWithProcess} from '@app/(apps)/ucar/class/UcarProcessCl'

/**
 * ダッシュボード開発用モックデータ
 * 画像の数値に近い分布を再現する50台のダミー車両データ
 *
 * 工程コード:
 *   CS01=QR発行, CS02=入庫, CS03=店長検収,
 *   CR02=CR着, CR03=検収, CR04=加修開始,
 *   CR05=まるくり, CR06=検査, CR07=写真,
 *   CR08=GAZOO, CR09=商品車受取
 */

// --- ヘルパー ---

/** 基準日からN日後の Date を返す */
function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

/** ランダムな整数 (min〜max) */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** ランダムな小数日数のDate加算 */
function addRandDays(base: Date, minDays: number, maxDays: number): Date {
  const days = minDays + Math.random() * (maxDays - minDays)
  return addDays(base, days)
}

type ProcessEntry = {processCode: string; date: Date | null}

/**
 * 工程を順番に進めるビルダー
 * 各工程間に指定範囲の日数をランダムに追加
 */
function buildProcesses(startDate: Date, steps: {code: string; minDays: number; maxDays: number}[]): ProcessEntry[] {
  const result: ProcessEntry[] = []
  let current = startDate

  for (const step of steps) {
    current = addRandDays(current, step.minDays, step.maxDays)
    result.push({processCode: step.code, date: new Date(current)})
  }

  return result
}

/**
 * UCAR_CODE.SHIWAKE のコード値をランダムに返す
 * 画像の分布に近い割合: 小売50%, 卸47%, スクラップ3%
 */
function randomDestination(): string {
  const r = Math.random()
  if (r < 0.5) return '02' // KOURI（小売）
  if (r < 0.97) return '01' // OROSI（卸）
  return '03' // SCRAP（スクラップ）
}

/** 98番号をランダム生成（CR到着済みの場合 95%の確率で付与） */
function randomNumber98(hasCrChaku: boolean): string | undefined {
  if (!hasCrChaku) return undefined
  if (Math.random() < 0.95) {
    return `98-${String(randInt(10000, 99999))}`
  }
  return undefined
}

// --- モック車両生成 ---

function generateMockCars(): UcarWithProcess[] {
  const cars: UcarWithProcess[] = []
  let idx = 1

  const baseDate2501 = new Date('2025-01-05')
  const baseDate2503 = new Date('2025-03-01')
  const baseDate2504 = new Date('2025-04-01')
  const baseDate2505 = new Date('2025-05-01')

  type PatternDef = {
    comment: string
    count: number
    baseDate: Date
    baseDateSpread: number
    steps: {code: string; minDays: number; maxDays: number}[]
    hasCrChaku: boolean
  }

  const patterns: PatternDef[] = [
    {
      comment: '全工程完了（配送済み）',
      count: 10,
      baseDate: baseDate2501,
      baseDateSpread: 60,
      steps: [
        {code: 'CS01', minDays: 0, maxDays: 0},
        {code: 'CS02', minDays: 1, maxDays: 3},
        {code: 'CS03', minDays: 1, maxDays: 2},
        {code: 'CR02', minDays: 2, maxDays: 4},
        {code: 'CR03', minDays: 1, maxDays: 2},
        {code: 'CR04', minDays: 1, maxDays: 3},
        {code: 'CR05', minDays: 3, maxDays: 7},
        {code: 'CR06', minDays: 0, maxDays: 1},
        {code: 'CR07', minDays: 1, maxDays: 3},
        {code: 'CR08', minDays: 5, maxDays: 10},
        {code: 'CR09', minDays: 2, maxDays: 5},
      ],
      hasCrChaku: true,
    },
    {
      comment: 'GAZOO待ち（滞留）',
      count: 5,
      baseDate: baseDate2503,
      baseDateSpread: 30,
      steps: [
        {code: 'CS01', minDays: 0, maxDays: 0},
        {code: 'CS02', minDays: 1, maxDays: 2},
        {code: 'CS03', minDays: 1, maxDays: 2},
        {code: 'CR02', minDays: 2, maxDays: 3},
        {code: 'CR03', minDays: 1, maxDays: 2},
        {code: 'CR04', minDays: 1, maxDays: 2},
        {code: 'CR05', minDays: 3, maxDays: 6},
        {code: 'CR06', minDays: 0, maxDays: 1},
        {code: 'CR07', minDays: 1, maxDays: 3},
        {code: 'CR08', minDays: 5, maxDays: 8},
      ],
      hasCrChaku: true,
    },
    {
      comment: '拠点滞留（入庫済み、店長検収待ち）',
      count: 5,
      baseDate: baseDate2505,
      baseDateSpread: 15,
      steps: [
        {code: 'CS01', minDays: 0, maxDays: 0},
        {code: 'CS02', minDays: 1, maxDays: 2},
      ],
      hasCrChaku: false,
    },
    {
      comment: 'CR配送待ち（店長検収済み、CR着待ち）',
      count: 4,
      baseDate: baseDate2504,
      baseDateSpread: 20,
      steps: [
        {code: 'CS01', minDays: 0, maxDays: 0},
        {code: 'CS02', minDays: 1, maxDays: 2},
        {code: 'CS03', minDays: 1, maxDays: 2},
      ],
      hasCrChaku: false,
    },
    {
      comment: '受入待ち（CR着済み、検収待ち）',
      count: 3,
      baseDate: baseDate2504,
      baseDateSpread: 20,
      steps: [
        {code: 'CS01', minDays: 0, maxDays: 0},
        {code: 'CS02', minDays: 1, maxDays: 2},
        {code: 'CS03', minDays: 1, maxDays: 2},
        {code: 'CR02', minDays: 2, maxDays: 4},
      ],
      hasCrChaku: true,
    },
    {
      comment: '加修中（加修開始済み、まるくり待ち）',
      count: 4,
      baseDate: baseDate2504,
      baseDateSpread: 15,
      steps: [
        {code: 'CS01', minDays: 0, maxDays: 0},
        {code: 'CS02', minDays: 1, maxDays: 2},
        {code: 'CS03', minDays: 1, maxDays: 2},
        {code: 'CR02', minDays: 2, maxDays: 3},
        {code: 'CR03', minDays: 1, maxDays: 2},
        {code: 'CR04', minDays: 1, maxDays: 2},
      ],
      hasCrChaku: true,
    },
    {
      comment: '検査待ち（写真撮影待ち）',
      count: 3,
      baseDate: baseDate2504,
      baseDateSpread: 15,
      steps: [
        {code: 'CS01', minDays: 0, maxDays: 0},
        {code: 'CS02', minDays: 1, maxDays: 2},
        {code: 'CS03', minDays: 1, maxDays: 2},
        {code: 'CR02', minDays: 2, maxDays: 3},
        {code: 'CR03', minDays: 1, maxDays: 2},
        {code: 'CR04', minDays: 1, maxDays: 2},
        {code: 'CR05', minDays: 3, maxDays: 5},
        {code: 'CR06', minDays: 0, maxDays: 1},
      ],
      hasCrChaku: true,
    },
    {
      comment: 'スキップ: CR着→まるくり（検収・加修開始スキップ）',
      count: 3,
      baseDate: baseDate2503,
      baseDateSpread: 20,
      steps: [
        {code: 'CS01', minDays: 0, maxDays: 0},
        {code: 'CS02', minDays: 1, maxDays: 2},
        {code: 'CS03', minDays: 1, maxDays: 2},
        {code: 'CR02', minDays: 2, maxDays: 3},
        {code: 'CR05', minDays: 5, maxDays: 10},
        {code: 'CR06', minDays: 0, maxDays: 1},
        {code: 'CR07', minDays: 1, maxDays: 3},
        {code: 'CR08', minDays: 5, maxDays: 8},
        {code: 'CR09', minDays: 2, maxDays: 5},
      ],
      hasCrChaku: true,
    },
    {
      comment: 'まるクリ滞留（まるくり済み、検査待ち）',
      count: 3,
      baseDate: baseDate2504,
      baseDateSpread: 15,
      steps: [
        {code: 'CS01', minDays: 0, maxDays: 0},
        {code: 'CS02', minDays: 1, maxDays: 2},
        {code: 'CS03', minDays: 1, maxDays: 2},
        {code: 'CR02', minDays: 2, maxDays: 3},
        {code: 'CR03', minDays: 1, maxDays: 2},
        {code: 'CR04', minDays: 1, maxDays: 2},
        {code: 'CR05', minDays: 3, maxDays: 6},
      ],
      hasCrChaku: true,
    },
    {
      comment: 'QR発行のみ（入庫待ち）',
      count: 3,
      baseDate: baseDate2505,
      baseDateSpread: 10,
      steps: [{code: 'CS01', minDays: 0, maxDays: 0}],
      hasCrChaku: false,
    },
    {
      comment: '検収済み、加修開始待ち',
      count: 4,
      baseDate: baseDate2504,
      baseDateSpread: 15,
      steps: [
        {code: 'CS01', minDays: 0, maxDays: 0},
        {code: 'CS02', minDays: 1, maxDays: 2},
        {code: 'CS03', minDays: 1, maxDays: 2},
        {code: 'CR02', minDays: 2, maxDays: 3},
        {code: 'CR03', minDays: 1, maxDays: 2},
      ],
      hasCrChaku: true,
    },
    {
      comment: '写真済み、GAZOO待ち',
      count: 3,
      baseDate: baseDate2504,
      baseDateSpread: 15,
      steps: [
        {code: 'CS01', minDays: 0, maxDays: 0},
        {code: 'CS02', minDays: 1, maxDays: 2},
        {code: 'CS03', minDays: 1, maxDays: 2},
        {code: 'CR02', minDays: 2, maxDays: 3},
        {code: 'CR03', minDays: 1, maxDays: 2},
        {code: 'CR04', minDays: 1, maxDays: 2},
        {code: 'CR05', minDays: 3, maxDays: 5},
        {code: 'CR06', minDays: 0, maxDays: 1},
        {code: 'CR07', minDays: 1, maxDays: 3},
      ],
      hasCrChaku: true,
    },
  ]

  for (const pattern of patterns) {
    for (let i = 0; i < pattern.count; i++) {
      const base = addDays(pattern.baseDate, randInt(0, pattern.baseDateSpread))
      const processes = buildProcesses(base, pattern.steps)
      // QR発行日時 = CS01の日時
      const cs01 = processes.find(p => p.processCode === 'CS01')
      const qrIssuedAt = cs01?.date ?? base

      cars.push({
        sateiID: `MOCK-${String(idx++).padStart(4, '0')}`,
        processes,
        destination: randomDestination(),
        number98: randomNumber98(pattern.hasCrChaku),
        qrIssuedAt,
        isRental: false,
      })
    }
  }

  return cars
}

/** モックデータ（固定シードで毎回同じ結果を生成するためキャッシュ） */
let _cachedMockCars: UcarWithProcess[] | null = null

export function getMockCars(): UcarWithProcess[] {
  if (!_cachedMockCars) {
    _cachedMockCars = generateMockCars()
  }
  return _cachedMockCars
}
