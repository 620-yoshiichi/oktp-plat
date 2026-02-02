import { COLORS, LT_CRITERIA } from '@app/(apps)/newCar/class/LeadTime'

import { Days } from '@cm/class/Days/Days'
import { toUtc } from '@cm/class/Days/date-utils/calculations'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import { CrInspectionHistory, DesiredTorokuDate, NewCar } from '@prisma/generated/prisma/client'
import { differenceInDays } from 'date-fns'

export class NewCarClass {
  car: NewCar & {
    CrInspectionHistory: CrInspectionHistory[]
    DesiredTorokuDate: DesiredTorokuDate[]
  }
  constructor(car) {
    this.car = car
  }

  chakko = {
    getChakkoDate: () => {
      const lastHistory = this.chakko.getLatestCrInspectionHistory()
      let result
      if (lastHistory) {
        if (lastHistory.status === `着工`) {
          result = lastHistory.date
        } else result = null
      } else {
        result = this.car.DD_SAGTYYO
      }

      return result
    },

    // 着工予定または保留先の日付を出す
    getPendingDateOrDD_SAGTYYO: () => {
      const lastHistory = this.chakko.getLatestCrInspectionHistory()
      return lastHistory?.date ?? this.car.DD_SAGTYYO
    },
    getLatestCrInspectionHistory: () => {
      const CrInspectionHistory = this.car.CrInspectionHistory

      if (CrInspectionHistory) {
        return CrInspectionHistory[CrInspectionHistory.length - 1] as CrInspectionHistory
      } else {
        throw new Error('CrInspectionHistory is not defined')
      }
    },
  }

  deliveryMethods = {
    deliveryInputRequired: () => {
      const requried = this.car.lastApprovedDesiredTorokuDate && !this.car.DD_HAISKIBO
      // const tooEarly =
      //   this.car.haisou_tooEarly &&
      //   this.car.lastApprovedDesiredTorokuDate &&
      //   this.car.lastApprovedDesiredTorokuDate >= toUtc(`2024-11-01`) &&
      //   this.car.DD_NOSYA === null

      return {
        requried,
        // tooEarly,
      }
    },
  }

  torokuMethods = {
    // 承認となっている履歴のうちから、最後のものを取得
    getLastApprovedDesiredTorokuDate: () => {
      const validTorokuApplication = (this.car?.DesiredTorokuDate as DesiredTorokuDate[])?.filter(d => d.status === `承認`)

      const result = validTorokuApplication.sort((a, b) => {
        return a.createdAt > b.createdAt ? -1 : 1
      })?.[0]

      return result
    },

    //承認履歴から最後を取得
    getLatestDesiredTorokuDate: (props?: { approvedOnly?: boolean }) => {
      const sorted = [...this?.car?.DesiredTorokuDate.filter(d => d.status !== `キャンセル`)]

      if (sorted && sorted.length > 0) {
        sorted.sort((a, b) => Number(b?.id ?? 0) - Number(a?.id ?? 0))
        const latestTorokuDate = sorted[0] as DesiredTorokuDate

        if (props?.approvedOnly) {
          return latestTorokuDate?.status === `承認` ? latestTorokuDate : null
        } else {
          return latestTorokuDate ? latestTorokuDate : null
        }
      }
    },
  }

  status = {
    getTorokuMikomiStatus: newCar => {
      const thisMonthStart = Days.month.getMonthDatum(new Date()).firstDayOfMonth
      const { m1_toroku_prediction, DD_TOUROKU, lastApprovedDesiredTorokuDate } = newCar
      const input = m1_toroku_prediction
      const required = newCar.m1Alert && !(DD_TOUROKU || lastApprovedDesiredTorokuDate)
      const overdue = input && input.getTime() < thisMonthStart.getTime()

      if (input) {
        if (overdue) {
          if (newCar.DD_TOUROKU) {
            return { color: `gray`, label: `登録済${formatDate(DD_TOUROKU, 'short')}` }
          } else {
            return { color: `yellow`, label: formatDate(input, '.YY年M月') + '(遅れ)' }
          }
        } else {
          return { color: `green`, label: formatDate(input, 'YY年M月') }
        }
      }

      if (required) {
        return { color: `red`, label: `未入力` }
      }
      return { color: `gray`, label: `未入力` }
    },
    getTorokuApplicationStatus: () => {
      const { lastApprovedDesiredTorokuDate, DD_TOUROKU } = this.car
      const latestTorokuDate = this.torokuMethods.getLatestDesiredTorokuDate()

      const status = { color: `gray`, label: `未申請` }
      if (this.car.DD_TOUROKU) {
        status.color = `gray`
        status.label = `登録済 ${formatDate(DD_TOUROKU as Date, '.YY/M/D(ddd)')}`
      } else if (latestTorokuDate && latestTorokuDate.status === `承認`) {
        status.color = `green`
        status.label = `承認 ` + formatDate(lastApprovedDesiredTorokuDate as Date, '.YY/M/D(ddd)')
      } else if (latestTorokuDate && !latestTorokuDate.status) {
        status.color = `sub`
        status.label = `申請中 ${formatDate(latestTorokuDate.date, `.YY/M/D(ddd)`)}`
      } else if (latestTorokuDate && latestTorokuDate.status === `却下`) {
        status.color = `red`
        status.label = `却下(要再申請) ${formatDate(latestTorokuDate.date, `.YY/M/D(ddd)`)}`
      } else if (this.car.DD_FR) {
        if (this.car.torokuApplicationRequired) {
          status.color = `red`
          status.label = `【至急】`
        } else {
          status.color = `yellow`
          status.label = `要申請`
        }
      } else {
        status.color = `gray`
        status.label = `未申請`
      }

      return status
    },
    getHaisouStatus: ({ newCar }) => {
      const status = { color: `gray`, label: `未入力` }
      const newCarCl = new NewCarClass(newCar)

      const Delivery = newCarCl.deliveryMethods.deliveryInputRequired()

      const lastApprovedDesiredTorokuDate = newCarCl?.car?.lastApprovedDesiredTorokuDate as Date
      if (lastApprovedDesiredTorokuDate && new Date(lastApprovedDesiredTorokuDate) < new Date(toUtc(`2024-11-01`))) {
        if (Delivery.requried) {
          status.color = `yellow`
          status.label = `要入力`
        } else if (newCarCl.car.DD_HAISKIBO) {
          status.color = `green`
          status.label = formatDate(newCarCl.car.DD_HAISKIBO, `M/D(ddd)`)
        }
      } else if (Delivery.requried) {
        status.color = `yellow`
        status.label = `要入力:${formatDate(newCar.earliestHaisouDate, 'M/D(ddd)')}以降`
      } else if (newCar.haisou_tooEarly) {
        status.color = `red`
        status.label = `${formatDate(newCar.earliestHaisouDate, 'M/D(ddd)')}以降に`
      } else if (newCarCl.car.DD_HAISKIBO) {
        status.color = `green`
        status.label = formatDate(newCarCl.car.DD_HAISKIBO, `M/D(ddd)`)
      }

      return status
    },
  }

  getFuriateOrSEISANYOTEI = () => {
    const furiate = this.car.DD_FR
    const seisanYotei = this.car.CUSTOM_DD_SEISANYOTEI
    return furiate || seisanYotei
  }
  calcLeadTime = (c: LT_CRITERIA) => {
    const from = this.car[c.fromKey]
    const to = this.car[c.toKey]

    const LT = [from, to].every(d => d) ? differenceInDays(new Date(to), new Date(from)) : undefined

    const clear = LT && LT <= c.max
    const over = LT && LT > c.max
    const bgColor = LT === undefined ? '' : over ? COLORS.danger : clear ? COLORS.safe : ''

    return {
      LT,
      bgColor,
      from,
      to,
      clear,
      over,
    }
  }
}

export const NewCarAppTest = false

export const getHolidays = async () => {
  return await (
    await doStandardPrisma(`calendar`, `findMany`, {
      select: { date: true },
      where: { cr: true },
    })
  ).result.map(d => d.date)
}
