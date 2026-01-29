
export const maxDuration = 300

import { maxUpdateGte } from '@app/(apps)/newCar/api/cron/orderUpsert/batchCloneBigQuery/batchCloneBigQuery'
import { newCarChainMethod } from '@app/(apps)/newCar/class/NewCarClass/newCarChain/newCarChainMethod'

import { Days } from '@cm/class/Days/Days'
import { toUtc } from '@cm/class/Days/date-utils/calculations'

import { processBatchWithRetry } from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'

import { Prisma } from '@prisma/generated/prisma/client'
import { addDays, addMonths } from 'date-fns'
import prisma from 'src/lib/prisma'

export const batchAlignCars = async () => {
  //カレンダー作成
  await createOneYearCalendar()

  // 車両の取得
  const args: Prisma.NewCarFindManyArgs = {
    select: { id: true },
    where: maxUpdateGte ? { DD_MAX_UPDATE: { gte: maxUpdateGte } } : undefined,
  }


  const targetCars = await prisma.newCar.findMany(args)


  const batchResult = await processBatchWithRetry({
    soruceList: targetCars,
    mainProcess: async batch => {
      const batchResult = await Promise.all(
        batch.map(async car => {
          await newCarChainMethod({ newCar: car })
        })
      )

      return batchResult
    },
  })

  return batchResult
}

const createOneYearCalendar = async () => {
  const { firstDateOfYear, lastDateOfYear } = Days.year.getYearDatum(toUtc(new Date()).getFullYear())
  const calendars = await prisma.calendar.findMany({
    where: {
      date: {
        gte: addDays(firstDateOfYear, -1),
        lte: addMonths(lastDateOfYear, 1),
      },
    },
  })

  await Promise.all(
    calendars.map(async data => {
      const { date, sharyobu, cr } = data
      await prisma.calendar.upsert({
        where: { date },
        create: { date, sharyobu: sharyobu ?? false, cr: cr ?? false },
        update: { date, sharyobu: sharyobu ?? false, cr: cr ?? false },
      },
      )
    })
  )
}
