// kobutsu = 古物台帳
// 古物台帳のデータを同期するためのAPI

import {bigQuery__select} from '@app/api/google/big-query/bigQueryApi'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import prisma from 'src/lib/prisma'
import {NextRequest, NextResponse} from 'next/server'
import {isCron} from 'src/non-common/serverSideFunction'

export const GET = async (req: NextRequest) => {
  const result: any = {}
  if ((await isCron({req})) === false) {
    const res = {success: false, message: `Unauthorized`, result: null}
    const status = {status: 401, statusText: `Unauthorized`}
    return NextResponse.json(res, status)
  }

  const rows = await bigQuery__select({
    datasetId: 'OrdersDB',
    tableId: 'Shitadori_Base',
    sqlString: sql`SELECT * FROM okayamatoyopet.OrdersDB.Sitadori_Base`,
  })

  await prisma.juchuShitadoriDb.deleteMany({})

  const created = await prisma.juchuShitadoriDb.createMany({data: rows as any[]})

  result['created'] = created

  return NextResponse.json(result)
}
