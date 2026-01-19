import { NextRequest, NextResponse } from 'next/server'
import prisma from 'src/lib/prisma'
import { getKaonaviMemberArray } from './lib/kaonavi-api'
import { transformKaonaviUserToUserData, createUserFromForcedUserOnly } from './lib/user-transformer'
import { resetAllOktpRoles, upsertMultipleUserRoles } from './lib/role-handler'
import { forcedUsers } from './lib/forced-users'
import { ProcessingErrors, UserWithRoles } from './lib/types'
import { upsertStoresFromKaonavi } from './lib/store-transformer'

/**
 * Kaonavi APIからユーザーデータを取得し、システムのユーザーデータに同期する
 * forcedUsersに登録されているユーザーは、KaonaviにデータがなくてもUPSERTされる
 */
export const POST = async (req: NextRequest) => {
  console.warn('orderUpsert route is not used')
  return NextResponse.json({ success: true, message: `Unauthorized`, result: null }, { status: 401, statusText: `Unauthorized` })
  // 1. Kaonavi APIからメンバーデータを取得
  const kaonaviResponse = await getKaonaviMemberArray()
  const memberData = kaonaviResponse.member_data

  // 2. 顔ナビデータから店舗情報をアップサート
  const upsertedStoreCount = await upsertStoresFromKaonavi(memberData)

  // 3. アップサート後の最新の店舗データを取得
  const stores = await prisma.store.findMany()

  // 4. 集計用のマスターオブジェクトを初期化
  const workTypeMaster: Record<string, boolean> = {}
  const emailMaster: Record<string, number> = {}
  const processingErrors: ProcessingErrors = { workTypeCountError: [] }

  // 5. ロールマスターをリセット
  const { roleMaster } = await resetAllOktpRoles()

  // 6. Kaonaviユーザーデータをシステムのユーザーデータに変換
  const transformResults = await Promise.all(
    memberData.map(async kaonaviUser => {
      return await transformKaonaviUserToUserData({
        kaonaviUser,
        stores,
        workTypeMaster,
        emailMaster,
      })
    })
  )

  // 7. 変換結果からユーザーとロールのリスト、エラーを抽出
  const usersWithRoles: UserWithRoles[] = []
  transformResults.forEach(result => {
    if (result.userWithRoles) {
      usersWithRoles.push(result.userWithRoles)
    }
    if (result.errors.length > 0) {
      processingErrors.workTypeCountError.push(...result.errors)
    }
  })

  // 8. Kaonaviに存在しないforcedUsersを処理
  const kaonaviUserCodes = new Set(memberData.map(user => String(user.code)))
  const forcedUsersNotInKaonavi = forcedUsers.filter(forcedUser => !kaonaviUserCodes.has(String(forcedUser.code)))

  const forcedUserResults = await Promise.all(
    forcedUsersNotInKaonavi.map(async forcedUser => {
      return await createUserFromForcedUserOnly(forcedUser, stores)
    })
  )

  // 9. forcedUsersから作成されたユーザーを追加
  forcedUserResults.forEach(result => {
    if (result) {
      usersWithRoles.push(result)
    }
  })

  // 10. ユーザーロールを一括でupsert
  const result = await upsertMultipleUserRoles(usersWithRoles, roleMaster)

  return NextResponse.json({
    success: true,
    emailMaster,
    result,
    message: 'ユーザーデータ更新完了',
    workTypeMaster,
    errors: processingErrors,
    processedForcedUsersCount: forcedUsersNotInKaonavi.length,
    upsertedStoreCount,
  })
}
