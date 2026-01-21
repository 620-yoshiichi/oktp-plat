'use server'
import prisma from 'src/lib/prisma'
import { readFileSync } from 'fs'

/**
 * AI査定 Rawデータ取り込みバッチ
 * BigQueryからAI査定データを同期する
 */
export const executeDisactivateUnnecessaryUcar = async () => {
  const targetIds = await readFileSync  ('src/non-common/cron/handlers/sateiIdsToDisactivate.csv', 'utf8')
  const targetIdsArray = targetIds.split('\n').map(id => id.trim())

  const targetUcars = await prisma.ucar.findMany({
    where: {sateiID: {in: targetIdsArray},
    },
  })

  await prisma.ucar.updateMany({
    where: {sateiID: {in: targetIdsArray},  active: true,
    },
    data: { active: false },
  })

  return {
    success: true,
    message: '不要なUcarを無効化しました',
    data: targetUcars,
  }
}
