'use server'

import {ProgressReportRecord, Month} from '@app/(apps)/newCar/class/ProgressReport/(lib)/getWheres'
import {getQueryByMonth} from '@app/(apps)/newCar/class/ProgressReport/(lib)/getQueryByMonth'
import prisma from 'src/lib/prisma'

export const cacheFetchProgressReportRecords = async ({
  months,
  newCarWhere,
  userId,
  storeId,
}: {
  months: Month[]
  newCarWhere: any
  userId: any
  storeId: any
}) => {
  const queryByMonthList = getQueryByMonth({months, newCarWhere, userId, storeId})

  const ProgressReportRecords: ProgressReportRecord[] = await (
    await Promise.all(
      queryByMonthList
        .map(async sm => {
          const {month, wheres} = sm
          const recordsByGroup = await Promise.all(
            wheres.map(async w => {
              const res = await prisma.newCar.aggregate({
                _count: true,
                where: {...w.condition},
              })
              const count = res._count
              return {
                key: w.key,
                month,
                count,
              }
            })
          )
          return recordsByGroup
        })
        .flat()
    )
  ).flat()

  return ProgressReportRecords
}
