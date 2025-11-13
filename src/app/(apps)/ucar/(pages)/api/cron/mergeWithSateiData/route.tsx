import {mergeUcarWithBigQuery} from '@app/(apps)/ucar/(pages)/api/cron/mergeWithSateiData/mergeUcarWithBigQuery'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import prisma from 'src/lib/prisma'
import {addDays} from 'date-fns'
import {NextRequest, NextResponse} from 'next/server'

import {isCron} from 'src/non-common/serverSideFunction'

export const GET = async (req: NextRequest) => {
  if ((await isCron({req})) === false) {
    const res = {success: false, message: `Unauthorized`, result: null}
    const status = {status: 401, statusText: `Unauthorized`}
    return NextResponse.json(res, status)
  }

  const result = {}

  const today = getMidnight()
  const ucars = await prisma.ucar.findMany({
    select: {id: true, sateiID: true},
    where: {
      // Model_name: null,
      OR: [
        //
        {sateiDataConfirmedAt: {lt: addDays(today, -1)}},
        {sateiDataConfirmedAt: null},
      ],
    },
    take: 3000,
  })

  result[`merge`] = await mergeUcarWithBigQuery({ucars, today})
  return NextResponse.json(result)
}
