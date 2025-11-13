import {GoogleSheet_Read} from '@app/api/google/actions/sheetAPI'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import prisma from 'src/lib/prisma'
import {NextResponse} from 'next/server'

const list = []

export const POST = async () => {
  const {values} = await GoogleSheet_Read({
    spreadsheetId: `https://docs.google.com/spreadsheets/d/1qWgOAiiv7fIBXorw3uTfslcvNMKs8CCL7buaX0D3ZUU/edit?gid=0#gid=0`,
    range: `注文番号ユニーク!A2:G`,
  })

  const result = await Promise.all(
    (values ?? [])?.map(async row => {
      row
      const [timestamp, base, stuff, orderNum, torokuKibo, status, remarks] = row ?? []

      const theStatus = status ? String(status).replace(/【|】/g, '') : null
      const data = await prisma.newCar.findMany({
        where: {NO_CYUMON: orderNum as string},
        include: {
          DesiredTorokuDate: {},
        },
      })
      if (data.length > 1) {
        throw new Error('重複しています')
      }

      const theCar = data?.[0]

      await prisma.newCar.update({where: {id: theCar.id}, data: {updatedAt: new Date()}})

      const ossKubun = theCar.KB_OSSSIN
      const torokuType = ossKubun === `6` ? 'OSS' : '紙登録'
      const lastShinsei = theCar.DesiredTorokuDate.sort((a, b) => b.date.getTime() - a.date.getTime())[0]
      const newCarId = theCar.id
      const payload = {
        date: toUtc(torokuKibo),
        createdAt: toUtc(timestamp),
        updatedAt: toUtc(timestamp),
        remarks,
        status: theStatus,
        torokuType,
        newCarId,
      }

      // if (lastShinsei) {
      //   const update = await prisma.desiredTorokuDate.upsert({
      //     where: {id: lastShinsei.id},
      //     create: payload,
      //     update: payload,
      //   })

      //   return update
      // } else {
      //   // const create = await prisma.desiredTorokuDate.create({data: payload})
      //   // return create
      // }

      const update = await prisma.desiredTorokuDate.upsert({
        where: {id: lastShinsei?.id ?? 0},
        create: payload,
        update: payload,
      })

      return update.id
    })
  )
  return NextResponse.json({result})
}
