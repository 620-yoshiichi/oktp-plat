

import {batchTenpoTsuikoData} from '@app/(apps)/newCar/api/cron/orderUpsert/batchTenpoTsuikoData/batchTenpoTsuikoData'

import {NextRequest, NextResponse} from 'next/server'
import {isCron} from 'src/non-common/serverSideFunction'

export const GET = async (req: NextRequest) => {
  if ((await isCron({req})) === false) {
    const res = {success: false, message: `Unauthorized`, result: null}
    const status = {status: 401, statusText: `Unauthorized`}
    return NextResponse.json(res, status)
  }

  console.time(`tenpoTsuikoUpsertBatch`)
  await batchTenpoTsuikoData()
  console.timeEnd(`tenpoTsuikoUpsertBatch`)
  return NextResponse.json({})
}
