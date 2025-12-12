/**
 * 車庫スロットの空き状況を判定するユーティリティ
 */

type GarageSlotForAvailabilityCheck = {
  finishedAt?: Date | string | null
  Ucar?: {
    OldCars_Base?: {
      KI_HANKAKA?: string | null
    } | null
  } | null
}

/**
 * 車庫スロットが「空き」かどうかを判定する
 *
 * 判定ロジック:
 * 1. finishedAt が存在する → 強制的に「空き」
 * 2. Ucar.OldCars_Base.KI_HANKAKA が "0" でも null でもない → 販売済み = 「空き」
 * 3. それ以外 → 「使用中」
 */
export const isGarageSlotAvailable = (slot: GarageSlotForAvailabilityCheck): boolean => {
  // 1. 強制空きフラグ（finishedAtが設定されていれば強制的に空き）
  if (slot.finishedAt) return true

  // 2. 販売済み判定（KI_HANKAKAが"0"やnull以外なら販売済み）
  const KI_HANKAKA = slot?.Ucar?.OldCars_Base?.KI_HANKAKA
  if (KI_HANKAKA && KI_HANKAKA !== '0') return true

  // 3. 使用中
  return false
}

/**
 * 車庫スロットの状態ラベルを取得する
 */
export const getGarageSlotStatusLabel = (
  slot: GarageSlotForAvailabilityCheck
): {
  available: boolean
  label: string
  color: 'green' | 'red' | 'gray'
} => {
  // 1. 強制空きフラグ
  if (slot.finishedAt) {
    return {available: true, label: '強制空き', color: 'green'}
  }

  // 2. 販売済み判定
  const KI_HANKAKA = slot?.Ucar?.OldCars_Base?.KI_HANKAKA
  if (KI_HANKAKA && KI_HANKAKA !== '0') {
    return {available: true, label: '販売済み', color: 'green'}
  }

  // 3. 使用中
  return {available: false, label: '使用中', color: 'red'}
}
