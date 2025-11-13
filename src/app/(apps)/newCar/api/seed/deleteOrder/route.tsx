import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {NextRequest, NextResponse} from 'next/server'

export const POST = async (req: NextRequest) => {
  const res = await doStandardPrisma(`newCar`, `deleteMany`, {
    where: {id: {gte: 0}},
  })
  return NextResponse.json(res)
}
