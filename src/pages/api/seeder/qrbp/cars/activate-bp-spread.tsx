import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import prisma from 'src/lib/prisma'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {subDays} from 'date-fns'

export default async function ActivateBpSpread(req, res) {
  async function getBpCars() {
    const res = await GoogleSheet_Read({
      spreadsheetId:
        'https://docs.google.com/spreadsheets/d/13xej4vS3MKffx2BkpJTtBL9goT-012Bvgd82sELHhns/edit?gid=59421495#gid=59421495',
      range: 'webapp_data!A3:W',
    })
    return res?.values
  }

  const data = await getBpCars()

  if (!data) return res.json({success: false, message: 'データがありません'})

  const dataCount = data.length

  const users = await prisma.user.findMany({include: {Store: true}})

  const header = [
    'bpNumber',
    'orderedAt',
    'storeAdvisorCode',
    'A',
    'storeAdvisorEmail',
    'storeName',
    'orderCategory',
    'estimate',
    'orderStatusCategory',
    'customerName',
    '',
    '',
    '',
    'carName',
    'plate',
    'katashiki',
    'frame',
    'orderNumber',
    'insuranceType',
    'insuranceCompany',
    'agreedPrice',
    'advancePayment',
    'sigakari',
  ]

  await processBatchWithRetry({
    soruceList: data.filter(data => {
      const orderDate = toUtc(data[1])
      return orderDate.getTime() >= subDays(new Date(), 365).getTime()
    }),
    mainProcess: async batch => {
      const transactionQueryList: transactionQuery[] = []

      batch.forEach((row, idx) => {
        const car = Object.fromEntries(header.map((h, idx) => [h, row[idx]]))

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

        let StoreAdvisor = users.find(data => data?.code?.toString() === car.storeAdvisorCode?.toString())

        const switchUserCode = (prev, after) => {
          const find = car.storeAdvisorCode.toString() === prev.toString()

          if (find) {
            car.storeAdvisorCode = after
            StoreAdvisor = users.find(data => data?.code?.toString() === after.toString())
          }
        }

        switchUserCode(816047, 815369)
        switchUserCode(823574, 817442)
        switchUserCode(821644, 817442)

        const complexKey = `${bpNumber}_${formatDate(orderedAt)}`

        const upsertData = {
          bpNumber,
          sortOrder: idx,
          orderedAt: toUtc(orderedAt),
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

        const data: transactionQuery = {
          model: 'car',
          method: `upsert`,
          queryObject: {where: {complexKey}, create: {...upsertData, storeId, userId}, update: {...upsertData}},
        }

        transactionQueryList.push(data)
      })
      await doTransaction({transactionQueryList})
    },
  })

  return res.json({
    success: true,
    dataCount,
    lastModifiedData: data[data.length - 1],
  })
}
