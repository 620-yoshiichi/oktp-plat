export const dynamic = 'force-dynamic'

import prisma from 'src/lib/prisma'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {sleep} from '@cm/lib/methods/common'
import {NextRequest, NextResponse} from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {data, chunkIdx, users} = body

    let query = data.map((car: any, idx: number) => {
      const {
        bpNumber,
        orderedAt,
        storeAdvisorCode,
        orderCategory,
        estimate,
        orderStatusCategory,
        customerName,
        carName,
        plate,
        frame,
        katashiki,
        orderNumber,
        advancePayment,
      } = car

      let StoreAdvisor = users.find((data: any) => data?.code?.toString() === storeAdvisorCode?.toString())

      const switchUserCode = (prev: number, after: number) => {
        const find = car.storeAdvisorCode?.toString() === prev.toString()

        if (find) {
          car.storeAdvisorCode = after
          StoreAdvisor = users.find((data: any) => data?.code?.toString() === after.toString())
        }
      }

      switchUserCode(816047, 815369)
      switchUserCode(823574, 817442)
      switchUserCode(821644, 817442)

      const complexKey = `${bpNumber}_${formatDate(orderedAt)}`

      const upsertData = {
        bpNumber,
        sortOrder: idx,
        orderedAt: formatDate(new Date(orderedAt), 'iso'),
        orderNumber: orderNumber ? String(orderNumber) : undefined,
        orderCategory: Number(orderCategory),
        estimate: Number(estimate),
        orderStatusCategory: Number(orderStatusCategory),
        customerName,
        carName,
        plate: String(plate),
        frame: String(frame),
        katashiki,
        advancePayment: advancePayment ? Number(advancePayment) : 0,
        complexKey,
      }
      const userId = StoreAdvisor?.id
      const storeId = StoreAdvisor?.Store?.id

      return prisma.car.upsert({
        where: {complexKey},
        create: {...upsertData, storeId, userId},
        update: {...upsertData},
      })
    })

    await sleep(chunkIdx * 500)
    try {
      const result = await prisma.$transaction([...query])
      console.log(result, result.length)
    } catch (error: any) {
      console.log(error.message)
    }

    query = []

    return NextResponse.json({
      success: true,
      message: `チャンク${chunkIdx + 1}番の${data.length}件を更新`,
      seeding: true,
    })
  } catch (error: any) {
    console.error('batch-update error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Unknown error occurred',
      },
      {status: 500}
    )
  }
}
