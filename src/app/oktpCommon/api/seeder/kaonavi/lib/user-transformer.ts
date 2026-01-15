import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'
import {oktpRoleString, workTypeConfigs} from '@app/oktpCommon/constants'
import prisma from 'src/lib/prisma'
import {forcedUsers, ForcedUser} from './forced-users'
import {TransformUserDataParams, TransformUserDataResult, UserWithRoles} from './types'

/**
 * 職務カスタムフィールド名の定数
 */
const WORK_TYPE_FIELD_NAME = '職務' as const

/**
 * Kaonaviユーザーの職務タイプを取得する純粋関数
 */
function getWorkTypes(kaonaviUser: TransformUserDataParams['kaonaviUser']): string[] | undefined {
  return kaonaviUser.custom_fields.find(d => d.name === WORK_TYPE_FIELD_NAME)?.values
}

/**
 * 店舗コードをKaonaviの部門コードから抽出する純粋関数
 */
function extractStoreCodeFromDepartment(departmentCode: string): number {
  return parseInt(departmentCode.substr(0, 2) || '0')
}

/**
 * 店舗IDを店舗コードから検索する純粋関数
 */
function findStoreIdByCode(stores: TransformUserDataParams['stores'], storeCode: number): number | undefined {
  return stores.find(store => String(store.code) === String(storeCode))?.id
}

/**
 * 職務タイプからアプリケーション名の配列を取得する純粋関数
 */
function getAppsFromWorkType(workType: string | undefined): string[] {
  if (!workType) return []
  return Object.keys(workTypeConfigs[workType]?.apps ?? {})
}

/**
 * 職務タイプからロールの配列を取得する純粋関数
 */
function getRolesFromWorkType(workType: string | undefined): oktpRoleString[] {
  if (!workType) return []
  const apps = getAppsFromWorkType(workType)
  const roles = apps.reduce((acc, APP_NAME) => {
    const roleList: oktpRoleString[] = workTypeConfigs[workType].apps[APP_NAME]?.roles ?? []
    return [...acc, ...roleList]
  }, [] as oktpRoleString[])

  return Array.from(new Set(roles))
}

/**
 * 強制ユーザー設定からユーザーデータを生成する（Kaonaviデータがある場合）
 */
async function createUserFromForcedUser(
  kaonaviUser: TransformUserDataParams['kaonaviUser'],
  stores: TransformUserDataParams['stores'],
  forcedUserConfig: ForcedUser
): Promise<UserWithRoles> {
  const kaonaviStoreCode = extractStoreCodeFromDepartment(kaonaviUser.department.code)
  const arrangedStoreCode = forcedUserConfig.storeCode ?? kaonaviStoreCode
  const storeId = findStoreIdByCode(stores, arrangedStoreCode)

  // Kaonaviデータを優先し、forcedUserConfigで上書き可能なフィールドを適用
  const userData = {
    code: Number(kaonaviUser.code),
    name: forcedUserConfig.name ?? kaonaviUser.name,
    email: forcedUserConfig.email ?? (kaonaviUser.mail ? kaonaviUser.mail : null),
    password: kaonaviUser.code,
    active: kaonaviUser.retired_date === '',
    storeId,
    apps: forcedUserConfig.apps,
  }
  let user
  try {
    // emailが存在する場合、まずemailで既存ユーザーを検索（ユニーク制約違反を防ぐため）
    if (userData.email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: {email: userData.email},
      })

      if (existingUserByEmail) {
        // emailで見つかったユーザーのcodeが一致する場合は更新
        if (existingUserByEmail.code === userData.code) {
          user = await prisma.user.update({
            where: {code: userData.code},
            data: {...userData},
          })
        } else {
          // codeが異なる場合は、既存ユーザーを更新（codeは変更しない）
          user = await prisma.user.update({
            where: {email: userData.email},
            data: {
              name: userData.name,
              password: userData.password,
              active: userData.active,
              storeId: userData.storeId,
              apps: userData.apps,
            },
          })
        }
      } else {
        // emailで見つからない場合、codeでupsert
        user = await prisma.user.upsert({
          where: {code: userData.code},
          create: {...userData},
          update: {...userData},
        })
      }
    } else {
      // emailがnullの場合はcodeでupsert
      user = await prisma.user.upsert({
        where: {code: userData.code},
        create: {...userData},
        update: {...userData},
      })
    }
  } catch (error) {
    console.error('Error in createUserFromForcedUser upsert:', {userData, error})
    throw error
  }

  const uniqueUserRoles = Array.from(new Set(forcedUserConfig.userRoles ?? []))
  return {
    userId: user.id,
    code: user.code,
    userRoles: uniqueUserRoles,
  }
}

/**
 * 強制ユーザー設定のみからユーザーデータを生成する（Kaonaviデータがない場合）
 * nameとemailがforcedUserConfigに必須
 */
export async function createUserFromForcedUserOnly(
  forcedUserConfig: ForcedUser,
  stores: Array<{id: number; code: number}>
): Promise<UserWithRoles | undefined> {
  // Kaonaviデータがない場合、nameとemailは必須
  if (!forcedUserConfig.name) {
    console.error('createUserFromForcedUserOnly: name is required when Kaonavi data is not available', {
      code: forcedUserConfig.code,
    })
    return undefined
  }

  const storeId = forcedUserConfig.storeCode ? findStoreIdByCode(stores, forcedUserConfig.storeCode) : undefined

  const userData = {
    code: forcedUserConfig.code,
    name: forcedUserConfig.name,
    email: forcedUserConfig.email ?? null,
    password: String(forcedUserConfig.code),
    active: true, // Kaonaviデータがない場合はデフォルトでactive
    storeId,
    apps: forcedUserConfig.apps,
  }

  try {
    let user

    // emailが存在する場合、まずemailで既存ユーザーを検索（ユニーク制約違反を防ぐため）
    if (userData.email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: {email: userData.email},
      })

      if (existingUserByEmail) {
        // emailで見つかったユーザーのcodeが一致する場合は更新
        if (existingUserByEmail.code === userData.code) {
          user = await prisma.user.update({
            where: {code: userData.code},
            data: {...userData},
          })
        } else {
          // codeが異なる場合は、既存ユーザーを更新（codeは変更しない）
          user = await prisma.user.update({
            where: {email: userData.email},
            data: {
              name: userData.name,
              password: userData.password,
              active: userData.active,
              storeId: userData.storeId,
              apps: userData.apps,
            },
          })
        }
      } else {
        // emailで見つからない場合、codeでupsert
        user = await prisma.user.upsert({
          where: {code: userData.code},
          create: {...userData},
          update: {...userData},
        })
      }
    } else {
      // emailがnullの場合はcodeでupsert
      user = await prisma.user.upsert({
        where: {code: userData.code},
        create: {...userData},
        update: {...userData},
      })
    }

    const uniqueUserRoles = Array.from(new Set(forcedUserConfig.userRoles ?? []))
    return {
      userId: user.id,
      code: user.code,
      userRoles: uniqueUserRoles,
    }
  } catch (error) {
    console.error('User upsert error (forcedUserOnly):', {userData, error})
    return undefined
  }
}

/**
 * 通常のKaonaviユーザーからユーザーデータを生成する
 */
async function createUserFromKaonaviData(
  kaonaviUser: TransformUserDataParams['kaonaviUser'],
  stores: TransformUserDataParams['stores'],
  workType: string | undefined
): Promise<UserWithRoles | undefined> {
  const kaonaviStoreCode = extractStoreCodeFromDepartment(kaonaviUser.department.code)
  const storeId = findStoreIdByCode(stores, kaonaviStoreCode)
  const apps = getAppsFromWorkType(workType)

  const userData = {
    code: Number(kaonaviUser.code),
    name: kaonaviUser.name,
    email: kaonaviUser.mail ? kaonaviUser.mail : null,
    password: kaonaviUser.code,
    active: kaonaviUser.retired_date === '',
    storeId,
    apps: apps.length > 0 ? apps : undefined,
  }

  try {
    let user

    // emailが存在する場合、まずemailで既存ユーザーを検索（ユニーク制約違反を防ぐため）
    if (userData.email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: {email: userData.email},
      })

      if (existingUserByEmail) {
        // emailで見つかったユーザーのcodeが一致する場合は更新
        if (existingUserByEmail.code === userData.code) {
          user = await prisma.user.update({
            where: {code: userData.code},
            data: {...userData},
          })
        } else {
          // codeが異なる場合は、既存ユーザーを更新（codeは変更しない）
          user = await prisma.user.update({
            where: {email: userData.email},
            data: {
              name: userData.name,
              password: userData.password,
              active: userData.active,
              storeId: userData.storeId,
              apps: userData.apps,
            },
          })
        }
      } else {
        // emailで見つからない場合、codeでupsert
        user = await prisma.user.upsert({
          where: {code: userData.code},
          create: {...userData},
          update: {...userData},
        })
      }
    } else {
      // emailがnullの場合はcodeでupsert
      user = await prisma.user.upsert({
        where: {code: userData.code},
        create: {...userData},
        update: {...userData},
      })
    }

    const userRoles = getRolesFromWorkType(workType)
    return {
      userId: user.id,
      code: user.code,
      userRoles,
    }
  } catch (error) {
    console.error('User upsert error:', {userData, error})
    return undefined
  }
}

/**
 * Kaonaviユーザーデータをシステムのユーザーデータに変換する
 * この関数は副作用を持つが、変換ロジックを集約している
 */
export async function transformKaonaviUserToUserData(params: TransformUserDataParams): Promise<TransformUserDataResult> {
  const {kaonaviUser, stores, workTypeMaster, emailMaster} = params

  const workTypes = getWorkTypes(kaonaviUser)
  const errors: TransformUserDataResult['errors'] = []

  // 職務タイプとメールアドレスの集計
  workTypes?.forEach(wt => {
    obj__initializeProperty(workTypeMaster, wt, true)
  })
  obj__initializeProperty(emailMaster, kaonaviUser.mail, 0)
  emailMaster[kaonaviUser.mail]++

  // 職務タイプが複数ある場合のエラー検出
  if ((workTypes ?? []).length > 1) {
    errors.push({
      name: kaonaviUser.name,
      code: kaonaviUser.code,
      workTypes,
    })
  }

  const firstWorkType = workTypes?.[0]

  // 強制ユーザー設定の確認
  const forcedUserConfig = forcedUsers.find(d => String(d.code) === String(kaonaviUser.code))

  let userWithRoles: UserWithRoles | undefined

  if (forcedUserConfig) {
    userWithRoles = await createUserFromForcedUser(kaonaviUser, stores, forcedUserConfig)
  } else {
    userWithRoles = await createUserFromKaonaviData(kaonaviUser, stores, firstWorkType)
  }

  return {
    userWithRoles,
    errors,
  }
}
