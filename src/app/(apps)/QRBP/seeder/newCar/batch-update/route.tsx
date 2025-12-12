import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {sleep} from '@cm/lib/methods/common'
import prisma from 'src/lib/prisma'

import {Prisma} from '@prisma/generated/prisma/client'
import chalk from 'chalk'
import {NextRequest, NextResponse} from 'next/server'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

export async function POST(req: NextRequest) {
  const stores = await prisma.store.findMany()

  const {data, chunkIdx} = await req.json()
  await sleep(chunkIdx * 500)

  const dataModelName = 'newCar'
  const transactionQueryList: transactionQuery<'newCar', 'upsert'>[] = []
  data.forEach(item => {
    const {
      APPINDEX,
      orderNumber,
      stuffCode,
      katashiki,
      frame,
      buyerName,
      ownerName,
      bodyNumber,
      deliverScheduledAt,
      orderedAt,
      shippedAt,
      arrivedAt,
      registeredAt,
      soldAt,
      storeCodeToBeDelivered,
    } = item

    const StoreToDeliver = stores.find(store => Number(store.code) === Number(storeCodeToBeDelivered))

    const storeId = StoreToDeliver?.id as number
    const baiscPayload: any = {
      APPINDEX: String(APPINDEX),
      orderNumber: String(orderNumber),
      stuffCode: Number(stuffCode),
      katashiki: String(katashiki),
      frame: String(frame),
      buyerName: String(buyerName),
      ownerName: String(ownerName),
      bodyNumber: String(bodyNumber),
      deliverScheduledAt: String(deliverScheduledAt),
      orderedAt: formatDate(orderedAt, 'iso'),
      shippedAt: formatDate(shippedAt, 'iso'),
      arrivedAt: formatDate(arrivedAt, 'iso'),
      registeredAt: registeredAt ? formatDate(registeredAt, 'iso') : undefined,
      soldAt: formatDate(soldAt, 'iso'),
      storeId,
    }
    const queryObject: Prisma.NewCarUpsertArgs = {
      where: {
        APPINDEX: String(APPINDEX),
      },
      create: baiscPayload,
      update: baiscPayload,
    }

    const query: transactionQuery<'newCar', 'upsert'> = {
      model: 'newCar',
      method: 'upsert',
      queryObject: queryObject,
    }

    transactionQueryList.push(query)
  })

  const updated = await doTransaction({transactionQueryList})

  console.info(chalk.bgYellow(`idx:${chunkIdx} updated ${transactionQueryList.length} ${dataModelName}`))

  return NextResponse.json({
    result: updated,
    success: true,
    message: `チャンク${chunkIdx + 1}番の${data.length}件を更新`,
    seeding: true,
  })
}
