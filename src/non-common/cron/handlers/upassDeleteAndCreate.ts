'use server'
import {deleteAndInsertUpassData} from '@app/(apps)/ucar/(pages)/api/cron/upass/deleteAndCreate/deleteAndInsertUpassData'
import {createUpassFamilyTree} from '@app/(apps)/ucar/(pages)/api/cron/upass/deleteAndCreate/createUpassFamilyTree'

/**
 * U-PASS Rawデータ取り込みバッチ
 * BigQueryからU-PASSデータを同期する
 */
export const executeUpassDeleteAndCreate = async () => {
  const deleteAndInsertResult = await deleteAndInsertUpassData()
  const createFamilyTreeResult = await createUpassFamilyTree()

  const totalCount = deleteAndInsertResult.count + createFamilyTreeResult.count

  return {
    success: true,
    message: `U-PASSデータ取り込み完了 ${totalCount}件（データ: ${deleteAndInsertResult.count}件、ツリー: ${createFamilyTreeResult.count}件）`,
    result: {
      totalCount,
      upassDataCount: deleteAndInsertResult.count,
      familyTreeCount: createFamilyTreeResult.count,
    },
  }
}
