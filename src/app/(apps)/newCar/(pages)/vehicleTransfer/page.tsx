import VehicleTransferFilter, {TransferStatus} from '@app/(apps)/newCar/(pages)/vehicleTransfer/VehicleTransferFilter'
import VehicleTransferTable from '@app/(apps)/newCar/(pages)/vehicleTransfer/VehicleTransferTable'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'

import {Center, C_Stack} from '@cm/components/styles/common-components/common-components'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Prisma} from '@prisma/client'

import React from 'react'

export default async function Page(props) {
  const query = await props.searchParams

  const {trasferStutus, transferType, NO_CYUMON, NO_FRAME} = query as {
    NO_CYUMON?: string
    NO_FRAME?: string
    transferType?: string
    trasferStutus?: TransferStatus
  }

  let CarTransferHistoryWhere = {}

  const isBeingTransferred = {
    CarTransferHistory: {
      some: {recoveredAt: null, transferredAt: {not: null}},
    },
  }

  const isRecovered = {
    CarTransferHistory: {
      some: {recoveredAt: {not: null}},
    },
  }
  const isNotMoved = {
    CarTransferHistory: {
      every: {recoveredAt: null, transferredAt: null},
    },
  }

  if (trasferStutus === `移動中`) {
    CarTransferHistoryWhere = isBeingTransferred.CarTransferHistory
  } else if (trasferStutus === `回収済`) {
    CarTransferHistoryWhere = isRecovered.CarTransferHistory
  } else if (trasferStutus === `移動なし`) {
    CarTransferHistoryWhere = isNotMoved.CarTransferHistory
  }

  const where: Prisma.NewCarWhereInput = {
    CarTransferHistory: CarTransferHistoryWhere,
    NO_CYUMON: {contains: NO_CYUMON},
    NO_FRAME: {contains: NO_FRAME},
    transferType: transferType,

    Store: {name: {not: {contains: `レクサス`}}}, // レスサス除く

    DD_FR: {not: null},
    OR: [
      {
        DD_HAISOU: {gte: getMidnight()},
      },
      {
        DD_HAISOU: null,
      },
    ],
  }

  const {result} = await doStandardPrisma(`newCar`, `findMany`, {
    where,
    include: {
      Store: {select: {name: true}},
      User: {select: {name: true}},
      CarTransferHistory: {take: 1},
    },
    orderBy: [
      // {lastApprovedDesiredTorokuDate: {sort: 'desc', nulls: 'last'}},
      {m1_toroku_prediction: {sort: 'desc', nulls: 'last'}},
    ],
    take: 150,
  } as Prisma.NewCarFindManyArgs)
  const cars = result.sort((a, b) => {
    const aTorokuDate = a.lastApprovedDesiredTorokuDate ?? a.m1_toroku_prediction ?? null
    const bTorokuDate = b.lastApprovedDesiredTorokuDate ?? b.m1_toroku_prediction ?? null

    if (!aTorokuDate && !bTorokuDate) {
      return 0
    } else if (!aTorokuDate) {
      return 1
    } else if (!bTorokuDate) {
      return -1
    } else {
      return bTorokuDate.getTime() - aTorokuDate.getTime()
    }
  })

  return (
    <>
      <Center className={`relative  p-2 h[200px]`}>
        <C_Stack>
          <VehicleTransferFilter />
          <VehicleTransferTable cars={cars} />
        </C_Stack>
      </Center>
    </>
  )
}

// 店舗、スタップ、お客様
// 登録予定日が先
// 登録予定が空欄のものは後ろ
