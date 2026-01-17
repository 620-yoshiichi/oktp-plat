import {bigQuery__select} from '@app/api/google/big-query/bigQueryApi'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import prisma from 'src/lib/prisma'

/**
 * 受注下取りDB Rawデータ取り込みバッチ
 * BigQueryから受注下取りデータを同期する
 */
export const executeJuchuShitadoriDbDeleteAndCreate = async () => {
  const rows = await bigQuery__select({
    datasetId: 'OrdersDB',
    tableId: 'Shitadori_Base',
    sqlString: sql`SELECT * FROM okayamatoyopet.OrdersDB.Sitadori_Base`,
  })

  await prisma.juchuShitadoriDb.deleteMany({})

  const created = await prisma.juchuShitadoriDb.createMany({data: rows as any[]})

  return {success: true, message: '受注下取りDBデータ取り込み完了', result: {created: created.count}}
}
