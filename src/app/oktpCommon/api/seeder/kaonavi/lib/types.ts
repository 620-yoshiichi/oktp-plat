import {oktpRoleString} from '@app/oktpCommon/constants'
import {KaonaviUserType} from '../kaonabi-types'

/**
 * ユーザーとロールの関連情報
 */
export type UserWithRoles = {
  userId: number
  code: number | null
  userRoles: oktpRoleString[]
}

/**
 * 職務タイプのエラー情報
 */
export type WorkTypeError = {
  name: string
  code: string
  workTypes: string[] | undefined
}

/**
 * 処理結果のエラー情報
 */
export type ProcessingErrors = {
  workTypeCountError: WorkTypeError[]
}

/**
 * ユーザーデータ変換の入力パラメータ
 */
export type TransformUserDataParams = {
  kaonaviUser: KaonaviUserType
  stores: Array<{id: number; code: number}>
  workTypeMaster: Record<string, boolean>
  emailMaster: Record<string, number>
}

/**
 * ユーザーデータ変換の結果
 */
export type TransformUserDataResult = {
  userWithRoles: UserWithRoles | undefined
  errors: WorkTypeError[]
}
