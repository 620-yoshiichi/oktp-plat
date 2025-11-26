import {LEAD_TIME_CRITERIA} from '@app/(apps)/newCar/class/LeadTime'
import {NewCarClass} from '@app/(apps)/newCar/class/NewCarClass/NewCarClass'

import prisma from 'src/lib/prisma'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

import {NextRequest, NextResponse} from 'next/server'

export const POST = async (req: NextRequest) => {
  const newCars = await prisma.newCar.findMany()

  const res = await processBatchWithRetry({
    soruceList: newCars,
    mainProcess: async (batch: any[]) => {
      await updateLeadTime({newCars: batch})
    },
  })

  return NextResponse.json(res)
}

const updateLeadTime = async ({newCars}) => {
  const transactionQueryList: transactionQuery<'newCarLeadTime', 'upsert'>[] = []
  newCars.forEach(car => {
    LEAD_TIME_CRITERIA.map(async c => {
      const leadTimeKey = c.id
      const {LT, from, to} = new NewCarClass(car).calcLeadTime(c)
      const payload = {
        NewCar: {connect: {id: car.id}},
        key: leadTimeKey,
        value: LT,
      }
      transactionQueryList.push({
        model: `newCarLeadTime`,
        method: `upsert`,
        queryObject: {
          where: {
            newCarId_key_unique: {
              newCarId: car.id,
              key: leadTimeKey,
            },
          },
          create: payload,
          update: payload,
        },
      })
    })
  })
  const res = await doTransaction({transactionQueryList})
  return res
}
