import {bigQuery__select} from '@app/api/google/big-query/bigQueryApi'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import prisma from 'src/lib/prisma'

import {NextRequest, NextResponse} from 'next/server'
import {isCron} from 'src/non-common/serverSideFunction'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {useRawSql} from '@cm/class/SqlBuilder/useRawSql'

// kobutsu = 古物台帳
// 古物台帳のデータを同期するためのAPI

export const GET = async (req: NextRequest) => {
  const result: any = {}
  if ((await isCron({req})) === false) {
    const res = {success: false, message: `Unauthorized`, result: null}
    const status = {status: 401, statusText: `Unauthorized`}
    return NextResponse.json(res, status)
  }

  // const BQ_OldCars_Base = bigQuery__select ({datasetId: 'OrdersDB', tableId: 'OldCars_Base'})
  const body = await bigQuery__select({
    datasetId: 'OrdersDB',
    tableId: 'OldCars_Base',
    sqlString: sql`SELECT * FROM okayamatoyopet.OrdersDB.ZAIKO_Base
    `,
  })

  // // AI査定データの削除

  await useRawSql({sql: sql`delete from "ZAIKO_Base" `})

  await processBatchWithRetry({
    soruceList: body,
    mainProcess: async batch => {
      await prisma.zAIKO_Base.createMany({data: batch})
    },
  })

  return NextResponse.json(result)
}
