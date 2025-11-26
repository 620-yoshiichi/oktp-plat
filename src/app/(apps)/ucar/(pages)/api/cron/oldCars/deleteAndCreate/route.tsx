import {bigQuery__select} from '@app/api/google/big-query/bigQueryApi'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import prisma from 'src/lib/prisma'

import {NextRequest, NextResponse} from 'next/server'
import {isCron} from 'src/non-common/serverSideFunction'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {useRawSql} from '@cm/class/SqlBuilder/useRawSql'
import {BQ_parser} from '@app/api/google/big-query/bigQueryParser'
import {Days} from '@cm/class/Days/Days'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

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
  let body = await bigQuery__select({
    datasetId: 'OrdersDB',
    tableId: 'OldCars_Base',
    sqlString: sql`SELECT * FROM okayamatoyopet.OrdersDB.OldCars_Base

    `,
  })

  body = body.map(item => {
    Object.keys(item).forEach(key => {
      const toDate = BQ_parser.parseDate(item[key])
      const toDateTarget = key.includes('DD_') && key !== 'DD_SIREBD'
      if (toDateTarget) {
        if (Days.validate.isDate(toDate)) {
          item[key] = toUtc(toDate)
        } else {
          item[key] = null
        }
      }
    })

    return item
  })

  await useRawSql({sql: sql`delete from "OldCars_Base" `})

  // await doTransaction({
  //   transactionQueryList: body.map(item => ({
  //     model: `oldCars_Base`,
  //     method: `create`,
  //     queryObject: {data: item},
  //   })),
  // })

  await processBatchWithRetry({
    soruceList: body,
    mainProcess: async batch => {
      await prisma.oldCars_Base.createMany({data: batch})
    },
  })

  return NextResponse.json(result)
}
