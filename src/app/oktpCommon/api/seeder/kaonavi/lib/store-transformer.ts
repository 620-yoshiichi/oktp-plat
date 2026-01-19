import prisma from 'src/lib/prisma'
import {KaonaviUserType} from '../kaonabi-types'

/**
 * 部門コードから店舗コード（2桁）を抽出する純粋関数
 */
function extractStoreCodeFromDepartment(departmentCode: string): number {
  const codeStr = departmentCode?.substring(0, 2) || '0'
  return parseInt(codeStr, 10) || 0
}

/**
 * 顔ナビメンバーデータからユニークな店舗情報を抽出する
 */
function extractUniqueStoresFromMembers(memberData: KaonaviUserType[]): Array<{code: number; name: string}> {
  const storeMap = new Map<number, string>()

  for (const member of memberData) {
    if (member.department?.code) {
      const storeCode = extractStoreCodeFromDepartment(String(member.department.code))
      const storeName = member.department.name || `店舗${storeCode.toString().padStart(2, '0')}`

      // 既存の店舗名がある場合は上書きしない（最初に見つかった名前を保持）
      if (!storeMap.has(storeCode)) {
        storeMap.set(storeCode, storeName)
      }
    }
  }

  return Array.from(storeMap.entries()).map(([code, name]) => ({code, name}))
}

/**
 * 顔ナビデータから店舗情報をアップサートする
 */
export async function upsertStoresFromKaonavi(memberData: KaonaviUserType[]): Promise<number> {
  const uniqueStores = extractUniqueStoresFromMembers(memberData)

  let upsertedCount = 0

  for (const store of uniqueStores) {
    try {
      await prisma.store.upsert({
        where: {code: store.code},
        create: {
          code: store.code,
          name: store.name,
          active: true,
          sortOrder: store.code,
        },
        update: {
          name: store.name,
          // activeやsortOrderは既存の値を保持するため、updateでは更新しない
        },
      })
      upsertedCount++
    } catch (error) {
      console.error(`Failed to upsert store: code=${store.code}, name=${store.name}`, error)
      // エラーが発生しても処理を続行
    }
  }

  return upsertedCount
}
