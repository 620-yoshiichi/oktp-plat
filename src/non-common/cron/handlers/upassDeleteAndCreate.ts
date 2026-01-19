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

  return {
    success: true,
    message: 'U-PASSデータ取り込み完了',
    result: {
      deleteAndInsertUpassData: deleteAndInsertResult,
      createUpassFamilyTree: createFamilyTreeResult,
    },
  }
}
