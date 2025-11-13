import {NextRequest, NextResponse} from 'next/server'

import {handleBigQuery} from '@app/api/google/big-query/big-query-methods'

export const POST = async (req: NextRequest) => {
  let result = {}

  const bigQueryHandler = await handleBigQuery({datasetId: 'OrdersDB', tableId: 'Orders_Base'})
  const {get} = bigQueryHandler

  const rows = await get({
    selects: [`APPINDEX`, `MAX_UPDATE`],
    where: [
      {
        key: `MAX_UPDATE`,
        operator: `>=`,
        value: `'2024-07-08'`,
      },
    ],
    limit: 1,
  })
  result = {...result, count: rows[0].length, rows}

  return NextResponse.json(result)
}
