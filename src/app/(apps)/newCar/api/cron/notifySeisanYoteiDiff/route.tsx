import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {knockEmailApi} from '@cm/lib/methods/knockEmailApi'
import prisma from 'src/lib/prisma'

import {addDays} from 'date-fns'
import {NextRequest, NextResponse} from 'next/server'
import {isCron} from 'src/non-common/serverSideFunction'

export const GET = async (req: NextRequest) => {
  if ((await isCron({req})) === false) {
    const res = {success: false, message: `Unauthorized`, result: null}
    const status = {status: 401, statusText: `Unauthorized`}
    return NextResponse.json(res, status)
  }

  try {
    const history = await prisma.seisanYoteiHistory.findMany({
      include: {NewCar: {include: {User: {}, Store: {}, SeisanYoteiHistory: {}}}},
      where: {notifyedAt: null},
      // where: isDev ? {} : {notifyedAt: null},
      take: 100,
    })

    const outOfRangeCar: any[] = []
    const notifyCar: any[] = []
    const nonNotifyCar: any[] = []
    for (const v of history) {
      const NewCar = v.NewCar

      const {m2Alert, m1Alert, DD_FR, m2Status, m1Status, CUSTOM_DD_SEISANYOTEI, id} = NewCar

      const previousHistory = await prisma.seisanYoteiHistory.findFirst({
        where: {newCarId: NewCar.id, id: {not: v.id}},
        orderBy: {createdAt: `desc`},
      })

      const isWithin60Days = (date: Date) => {
        if (!date) return false
        const today = getMidnight()
        const futureLimit = addDays(today, 60)
        return date <= futureLimit
      }
      const wasInRange = previousHistory?.toDate && isWithin60Days(previousHistory.toDate)
      const isOutOfRangeNow = v.toDate && !isWithin60Days(v.toDate)
      const isOutOfRange = wasInRange && isOutOfRangeNow

      let doUpdate = true

      const missingData = !previousHistory?.toDate || !v.toDate

      if (missingData) {
        doUpdate = true
        notifyCar.push(v.NewCar.SeisanYoteiHistory[v.NewCar.SeisanYoteiHistory.length - 1])
        console.debug({data: `通常: ${formatDate(v.fromDate)} ➡︎ ${formatDate(v.toDate)} /  ${v.from} ➡︎ ${v.to}`})
      } else if (isOutOfRange) {
        outOfRangeCar.push(v.NewCar.SeisanYoteiHistory[v.NewCar.SeisanYoteiHistory.length - 1])
        doUpdate = true
        console.debug({data: `圏外: ${formatDate(v.fromDate)} ➡︎ ${formatDate(v.toDate)} /  ${v.from} ➡︎ ${v.to}`})
      } else {
        nonNotifyCar.push(v.NewCar.SeisanYoteiHistory[v.NewCar.SeisanYoteiHistory.length - 1])
        doUpdate = false
        console.debug({data: `非通知: ${formatDate(v.fromDate)} ➡︎ ${formatDate(v.toDate)} /  ${v.from} ➡︎ ${v.to}`})
      }

      if (doUpdate) {
        const {result: storeManagerList} = await doStandardPrisma(`user`, `findMany`, {
          where: {
            storeId: NewCar?.storeId,
            UserRole: {
              some: {
                RoleMaster: {
                  OR: [{name: `店長`}, {name: `副店長`}],
                },
              },
            },
          },
        })
        const mailToSales = [NewCar?.User?.email, ...storeManagerList.map(d => d.email)].filter(d => d)
        const to = [
          // `mutsuo_yoshiichi@toch-holdings.com`,
          // `asaka_nishimoto@okayama-toyopet.jp`,
          // `takuro_sugii@okayama-toyopet.jp`,
          ...mailToSales,
        ]

        const email_res = await knockEmailApi({
          to: to,
          subject: `J-SLIM生産予定変更通知`,
          text: [
            `J-SLIMの車両生産予定が変更されました。`,
            [`店舗`, NewCar.Store.name].join(`: `),
            [`スタッフ`, NewCar.User.name].join(`: `),
            [`注文番号`, NewCar.NO_CYUMON].join(`: `),
            [`買主名`, NewCar.KJ_KAINMEI1].join(`: `),
            [`名義人`, NewCar.KJ_MEIGIME1].join(`: `),
            [`車名`, NewCar.KJ_KURUMAME].join(`: `),
            [`フレームNo`, NewCar.NO_FRAME ?? ''].join(`: `),
            [`変更前`, v.from].join(`: `),
            [`【変更後・最新】`, v.to].join(`: `),
          ].join(`\n`),
        })

        if (email_res.success) {
          await prisma.seisanYoteiHistory.update({
            where: {key: v.key},
            data: {notifyedAt: new Date()},
          })
        }
      } else {
        await prisma.seisanYoteiHistory.update({
          where: {key: v.key},
          data: {notifyedAt: new Date()},
        })
      }
    }

    if (outOfRangeCar.length > 0) {
      await knockEmailApi({
        subject: `2ヶ月圏外離脱:${outOfRangeCar.length}件`,
        text: [
          `2ヶ月圏外離脱件`,
          ...outOfRangeCar.map(v => {
            return [`${formatDate(v.fromDate)} ➡︎ ${formatDate(v.toDate)}`, `${v.from} ➡︎ ${v.to}`].join(`   /   `)
          }),
        ].join(`\n`),
        to: [`mutsuo_yoshiichi@toch-holdings.com`],
      })
    }

    console.debug(`圏外: ${outOfRangeCar.length}件`)
    console.debug(`通知: ${notifyCar.length}件`)
    console.debug(`非通知: ${nonNotifyCar.length}件`)

    return NextResponse.json({
      success: true,
      message: `${history.length}件のメールを送信しました。`,
      result: {outOfRangeCar, notifyCar},
    })
  } catch (error) {
    console.error(error.stack)
    return NextResponse.json(
      {
        success: false,
        message: `エラーが発生しました。`,
        result: {},
      },
      {status: 500}
    )
  }
}
