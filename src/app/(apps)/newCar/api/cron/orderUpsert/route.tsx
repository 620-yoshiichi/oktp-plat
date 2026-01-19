import { batchAlignCars } from '@app/(apps)/newCar/api/cron/orderUpsert/batchAlignCars'
import { batchCloneBigQuery } from '@app/(apps)/newCar/api/cron/orderUpsert/batchCloneBigQuery/batchCloneBigQuery'

import { NextRequest, NextResponse } from 'next/server'
import { isCron } from 'src/non-common/serverSideFunction'

export const GET = async (req: NextRequest) => {
  console.warn('orderUpsert route is not used')
  return NextResponse.json({ success: true, message: `Unauthorized`, result: null }, { status: 401, statusText: `Unauthorized` })
  if ((await isCron({ req })) === false) {
    const res = { success: false, message: `Unauthorized`, result: null }
    const status = { status: 401, statusText: `Unauthorized` }
    return NextResponse.json(res, status)
  }

  console.time(`orderRouteBatch`)
  await batchCloneBigQuery()
  await batchAlignCars()

  console.timeEnd(`orderRouteBatch`)
  return NextResponse.json({})
}
