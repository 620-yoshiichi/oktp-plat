import {ucarData} from '@app/(apps)/ucar/class/UcarCL'

// 検索フォームの入力値
export type UcarSearchFormValues = {
  keyword: string
  brandName: string
  driveType: string
  latestProcessCode: string
  isKei: boolean
  includeSold: boolean
  destinationStoreId: string
}

// 検索パラメータ（サーバーアクションに渡す）
export type UcarSearchParams = UcarSearchFormValues & {
  page: number
  perPage: number
}

// ページネーション情報
export type PaginationInfo = {
  page: number
  perPage: number
  total: number
  totalPages: number
}

// UPASSの型（必要なフィールドのみ）
export type UpassData = {
  id: number
  sateiID: string
  brandName: string | null
  modelName: string | null
  type: string | null
  commonType: string | null
  modelYear: string | null
  chassisNumber: string | null
  frameNumber: string | null
  registrationSerialNumber: string | null
  registrationClassNumber: string | null
  registrationKana: string | null
  landAffairsName: string | null
  grade: string | null
  exteriorColor: string | null
  mileageKm: string | null
  displacement: string | null
  length: string | null
  width: string | null
  height: string | null
  transmissionType: string | null
  driveType: string | null
  assessmentdatetime: Date | null
  assessmentPrice: string | null
}

// Storeの型
export type StoreData = {
  id: number
  name: string
  code: number
}

// UcarProcessの型
export type UcarProcessData = {
  id: number
  date: Date | null
  processCode: string
  User: {name: string | null} | null
}

// 検索結果の1行データ
export type UcarSearchResult = ucarData
// 検索結果レスポンス
export type UcarSearchResponse = {
  success: boolean
  message?: string
  result: {
    data: UcarSearchResult[]
    pagination: PaginationInfo
  } | null
}

// 詳細取得レスポンス
export type UcarDetailResponse = {
  success: boolean
  message?: string
  result: UcarSearchResult | null
}

// ブランドリストレスポンス
export type BrandListResponse = {
  success: boolean
  result: {brandName: string}[]
}

// 店舗リストレスポンス
export type StoreListResponse = {
  success: boolean
  result: StoreData[]
}

// 検索条件の初期値
export const DEFAULT_SEARCH_FORM_VALUES: UcarSearchFormValues = {
  keyword: '',
  brandName: '',
  driveType: '',
  latestProcessCode: '',
  isKei: false,
  includeSold: false,
  destinationStoreId: '',
}

// ページネーションのデフォルト値
export const DEFAULT_PER_PAGE = 20
