import {NEW_CAR_CONST} from '@app/(apps)/newCar/(constants)/newCar-constants'
import {NewCarClass} from '@app/(apps)/newCar/class/NewCarClass/NewCarClass'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {Days} from '@cm/class/Days/Days'

export const checkAlert = ({date, newCar, crHolidays}) => {
  const {DD_TOUROKU, DD_SAGTYYO, lastApprovedDesiredTorokuDate} = newCar

  const newCarCl = new NewCarClass(newCar)
  const pendingDate = newCarCl.chakko.getPendingDateOrDD_SAGTYYO()

  const twoDaysAfter = Days.day.addBusinessDays(getMidnight(new Date()), 2, crHolidays ?? [])

  const lt = pendingDate && pendingDate < getMidnight()
  const isToday = Days.validate.isSameDate(new Date(), pendingDate ?? new Date())

  const colorMaster = Object.fromEntries(NEW_CAR_CONST.CR_OPERATION.ALERT_COLORS.map(d => [d.value, d.color]))

  if (DD_TOUROKU) {
    return {
      style: {
        background: colorMaster[`登録済`],
      },
    }
  } else {
    if (lt) {
      if (!DD_TOUROKU) {
        return {
          style: {background: colorMaster[`過去着工分未登録`]},
        }
      }
    } else if (isToday) {
      if (!DD_TOUROKU) {
        return {
          style: {background: colorMaster[`着工日未登録`]},
        }
      }
    } else if (pendingDate && twoDaysAfter >= pendingDate && pendingDate >= getMidnight()) {
      return {
        style: {background: colorMaster[`2日前未登録`]},
      }
    }
  }
}

export const NDayMsterList = [
  {nDayStr: `N-7`, label: ``, checkAlert},
  {
    nDayStr: `N-6`,
    label: `データ締め\n部品自動発注`,
    action: `登録予定確認`,
    getCellProps: checkAlert,
  },
  {
    nDayStr: `N-5`,
    label: `車両移動\n洗車スタート`,
    action: '登録（車両部）',
    getCellProps: checkAlert,
  },
  {
    nDayStr: `N-4`,
    label: `洗車\nスタート`,
    action: `登録当日確認`,
    getCellProps: checkAlert,
  },
  {nDayStr: `N-3`, label: `部品到着`, getCellProps: checkAlert},
  {nDayStr: `N-2`, label: `作業着工`, getCellProps: checkAlert},
  {nDayStr: `N-1`, label: `取付/新点`, getCellProps: checkAlert},
  {nDayStr: `N`, label: `配送希望日`, getCellProps: checkAlert},
  {nDayStr: `N+1`, label: ``, getCellProps: checkAlert},
]
