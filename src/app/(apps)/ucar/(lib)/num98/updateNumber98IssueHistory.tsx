'use server'

import { revalidatePath } from 'next/cache'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

export type UpdateNumber98IssueHistoryProps = {
  prevNumber98: string | null | undefined
  newNumber98: string | null | undefined
}

/**
 * 98番号の発行履歴を更新する共通関数
 * - 番号が変更された場合のみ処理を実行
 * - 最後の番号の場合は履歴を削除、それ以外は履歴を作成
 */
export const updateNumber98IssueHistory = async (props: UpdateNumber98IssueHistoryProps): Promise<void> => {
  const { prevNumber98, newNumber98 } = props

  // 変更がない場合は何もしない
  if (prevNumber98 === newNumber98) return

  // 新しい番号が空の場合は何もしない
  if (!newNumber98) return

  // 最後の番号かどうかを判定
  const { result: last98Number } = await doStandardPrisma('number98', 'findFirst', {
    orderBy: { sortNumber: 'desc' },
    where: { occupied: false }
  })

  const isLast98Number = last98Number?.number === newNumber98


  console.log({
    isLast98Number,
    last98Number: last98Number?.number,
    newNumber98
  })  //logs

  if (isLast98Number) {
    // 最後の番号だったら履歴を削除
    await doStandardPrisma('number98IssueHistory', 'deleteMany', { where: {} })
  } else {
    // それ以外は履歴を作成
    await doStandardPrisma('number98IssueHistory', 'create', { data: { number: newNumber98 } })
  }

  // ページを再検証して98番号選択肢を更新
  revalidatePath('/ucar/ucar')
}
