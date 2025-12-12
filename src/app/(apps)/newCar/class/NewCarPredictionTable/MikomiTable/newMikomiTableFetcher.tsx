'use server'
import {NEW_CAR_CONST} from '@app/(apps)/newCar/(constants)/newCar-constants'
import prisma from 'src/lib/prisma'
import {Prisma} from '@prisma/generated/prisma/client'
import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

export const newMikomiTableFetcher = async ({thisMonth, query}) => {
  console.time('newMikomiTableFetcher')
  const {firstDayOfMonth: torokuGte, lastDayOfMonth: thisMonthEnd} = Days.month.getMonthDatum(thisMonth)
  const torokuLte = Days.month.getNextMonthLastDate(torokuGte, 4)

  const months = Days.month.getMonthsBetweenDates(torokuGte, torokuLte)
  // const torokuLte = thisMonthEnd

  const orderWhere: Prisma.NewCarWhereInput = {
    ...NEW_CAR_CONST.NEW_CAR.WHERE.COMMON_WHERE,
    isDaikoNosya: false,
    OR: [
      //
      {
        DD_TOUROKU: {
          gte: torokuGte,
          lte: torokuLte,
        },
      }, //登録日
      {
        DD_TOUROKU: null,
        lastApprovedDesiredTorokuDate: {
          gte: torokuGte,
          lte: torokuLte,
        },
      }, //登録申請日
      {
        DD_TOUROKU: null,
        lastApprovedDesiredTorokuDate: null,
        m1_toroku_prediction: {
          gte: torokuGte,
          lte: torokuLte,
        },
      }, //登録見込み日
    ],
  }

  const stores = await prisma.store.findMany({
    where: {NewCar: {some: {...orderWhere}}},
    include: {
      NewCar: {
        select: {
          DD_FR: true,
          DD_TOUROKU: true,
          lastApprovedDesiredTorokuDate: true,
          m1_toroku_prediction: true,
        },
        where: orderWhere,
      },
    },
    orderBy: [{code: `asc`}],
  })

  const torokuFlagTemplate = {
    torokuKanryo: 0,
    torokuYotei_FR: 0,
    torokuYotei_NO_FR: 0,
    torokuMikomi_FR: 0,
    torokuMikomi_NO_FR: 0,
  }

  const dataByStore: {
    [storeId: string]: {
      storeName: string
      months: {[monthLabel: string]: typeof torokuFlagTemplate}
    }
  } = Object.fromEntries(
    stores.map(store => {
      const storeId = store.id
      const monthObjTemplate = Object.fromEntries(
        months.map(month => {
          const monthLabel = formatDate(month, 'YYYY/M')
          return [monthLabel, {...torokuFlagTemplate}]
        })
      )
      return [storeId, {storeName: store.name, months: monthObjTemplate}]
    })
  )

  for (let i = 0; i < stores.length; i++) {
    const data = stores[i]
    const storeId = data.id

    for (let j = 0; j < data.NewCar.length; j++) {
      const newCar = data.NewCar[j]
      const toroku = newCar.DD_TOUROKU
      const torokuYotei = newCar.lastApprovedDesiredTorokuDate
      const torokuMikomi = newCar.m1_toroku_prediction
      const FR = newCar.DD_FR

      if (toroku) {
        const monthLabel = formatDate(toroku, 'YYYY/M')
        dataByStore[storeId].months[monthLabel].torokuKanryo++
      } else if (torokuYotei) {
        const monthLabel = formatDate(torokuYotei, 'YYYY/M')

        if (FR) {
          dataByStore[storeId].months[monthLabel].torokuYotei_FR++
        } else {
          dataByStore[storeId].months[monthLabel].torokuYotei_NO_FR++
        }
      } else if (torokuMikomi) {
        const monthLabel = formatDate(torokuMikomi, 'YYYY/M')
        if (FR) {
          dataByStore[storeId].months[monthLabel].torokuMikomi_FR++
        } else {
          dataByStore[storeId].months[monthLabel].torokuMikomi_NO_FR++
        }
      }
    }
  }

  console.timeEnd('newMikomiTableFetcher')

  return {dataByStore, stores}
}
