// Ucar検索の共通型定義

/**
 * 検索値の型
 * 各検索フィールドの値を保持する
 */
export type UcarSearchValues = {
  // 基本検索
  keyword: string // 査定NO / 車名 / 型式 / 車体番号 / プレート
  brandName: string // メーカー名（複数ワードAND検索）
  driveType: string // 駆動式名称

  // セレクト
  latestProcessCode: string // 最新工程
  destinationStoreId: string // 配送先店舗

  // チェックボックス
  isKei: boolean // 軽四フィルター
  includeSold: boolean // 売上済も表示

  // UPASS関連（kouteiKanri用）
  modelName: string // 車名
  color: string // カラー
  frame: string // フレーム

  // 共通
  sateiID: string // 査定ID（単独検索用）
}

/**
 * 検索値の初期値
 */
export const DEFAULT_SEARCH_VALUES: UcarSearchValues = {
  keyword: '',
  brandName: '',
  driveType: '',
  latestProcessCode: '',
  destinationStoreId: '',
  isKei: false,
  includeSold: false,
  modelName: '',
  color: '',
  frame: '',
  sateiID: '',
}

/**
 * URLパラメータのキーマッピング
 * フィールド名 -> URLパラメータ名
 */
export const URL_PARAM_KEYS: Record<keyof UcarSearchValues, string> = {
  keyword: 'keyword',
  brandName: 'brandName',
  driveType: 'driveType',
  latestProcessCode: 'latestProcessCode',
  destinationStoreId: 'destinationStoreId',
  isKei: 'isKei',
  includeSold: 'includeSold',
  modelName: 'searchModelName',
  color: 'searchColor',
  frame: 'searchFrame',
  sateiID: 'searchSateiID',
}

/**
 * 店舗の型
 */
export type StoreOption = {
  id: number
  name: string
  code: number
}

/**
 * 工程コードの型
 */
export type ProcessCodeOption = {
  code: string
  label: string
}
