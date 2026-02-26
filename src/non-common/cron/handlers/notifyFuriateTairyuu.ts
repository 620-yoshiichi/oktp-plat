'use server'

import {knockEmailApi} from '@cm/lib/methods/knockEmailApi'
import {basePath} from '@cm/lib/methods/common'
import prisma from 'src/lib/prisma'
import {subDays} from 'date-fns'

export const executeNotifyFuriateTairyuu = async () => {
  const cars = await prisma.newCar.findMany({
    where: {
      DD_FR: {lte: subDays(new Date(), 32)},
      DD_TOUROKU: null,
      DD_TORIKESI: null,
      furiate_chien_riyu: null,
      NOT: {
        NO_CYUMON: {startsWith: '98'},
        DD_JUCYU: {lt: new Date('2021-01-01')},
      },
    },
    include: {
      User: {},
      Store: {},
    },
    orderBy: [{Store: {code: 'asc'}}, {User: {name: 'asc'}}, {NO_CYUMON: 'asc'}],
  })

  if (cars.length === 0) {
    return {success: true, message: '対象なし', result: {sent: 0}}
  }

  const storeMap = new Map<number, typeof cars>()
  for (const car of cars) {
    const list = storeMap.get(car.storeId) ?? []
    list.push(car)
    storeMap.set(car.storeId, list)
  }

  let sentCount = 0

  for (const [storeId, storeCars] of storeMap) {
    const managers = await prisma.user.findMany({
      where: {
        storeId,
        UserRole: {
          some: {
            RoleMaster: {
              OR: [{name: '店長'}, {name: '副店長'}],
            },
          },
        },
      },
    })

    const to = managers.map(m => m.email).filter(Boolean) as string[]
    if (to.length === 0) continue

    const staffMap = new Map<string, typeof storeCars>()
    for (const car of storeCars) {
      const staffName = car.User?.name ?? '不明'
      const list = staffMap.get(staffName) ?? []
      list.push(car)
      staffMap.set(staffName, list)
    }

    const staffLines: string[] = []
    for (const [staffName, staffCars] of staffMap) {
      staffLines.push(`■ ${staffName}`)
      for (const car of staffCars) {
        staffLines.push(`  注文番号: ${car.NO_CYUMON} 車名: ${car.KJ_KURUMAME ?? ''} 買主: ${car.KJ_KAINMEI1 ?? ''}`)
      }
      staffLines.push('')
    }

    const pageUrl = `${basePath}/newCar?rootPath=newCar/furiate-mitouroku`

    const text = [
      '店長各位',
      'ゾーン長各位',
      '',
      '下記受注が本日で振当日から32日経過しましたので通知いたします。',
      'ご確認の上ご対応ください。',
      '',
      'リンク',
      pageUrl,
      '',
      '---',
      `${storeCars[0].Store.name}（${storeCars.length}件）`,
      '',
      ...staffLines,
      '※自動送信です',
    ].join('\n')

    const res = await knockEmailApi({
      to,
      subject: '【通知：滞留】振当日から32日経過した受注があります',
      text,
    })

    if (res.success) sentCount++
  }

  return {
    success: true,
    message: `${storeMap.size}店舗, ${cars.length}件の滞留通知を送信しました。`,
    result: {sent: sentCount, stores: storeMap.size, cars: cars.length},
  }
}
