import {actionStatusLabels, newCarModel} from '@app/(apps)/newCar/(constants)/checkpoints/checkpoints'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {differenceInDays} from 'date-fns'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getMidnight, getMinimumDate} from '@cm/class/Days/date-utils/calculations'

type calculatedResult = {label: actionStatusLabels}

type calcStatusType = (props: {newCar: newCarModel}) => calculatedResult

const SEISANYOTEI_WITHIN = ({newCar, within}) => {
  return newCar[`CUSTOM_DD_SEISANYOTEI`] && differenceInDays(new Date(newCar[`CUSTOM_DD_SEISANYOTEI`]), new Date()) <= within
}

const CalcStatus_Common: (props: any) => calculatedResult = ({activated, done, finishedByAi21, delay, isInNextPhase}) => {
  // アラート発火のうちで、
  if (activated) {
    // 実施
    if (done) {
      if (delay && !finishedByAi21) {
        return {label: `遅れ`}
      } else {
        return {label: `対処済み`}
      }
    } else if (isInNextPhase) {
      //次のフェーズに行っている
      return {label: `未活動`}
    } else {
      //次のフェーズにいってもなく未実施
      return {label: `対象`}
    }
  }

  return {label: `生産予定未定`}
}

export const calcActionStatusByCarId = ({newCar}) => {
  const calcM2Status: calcStatusType = ({newCar}) => {
    const finishedByAi21 = newCar[`DD_HONBSYOK`]

    const activated = SEISANYOTEI_WITHIN({newCar, within: 60})
    const isInNextPhase = SEISANYOTEI_WITHIN({newCar, within: 30})
    const done = newCar[`m2_date`]
    const delay = false

    const {label} = CalcStatus_Common({finishedByAi21, activated, done, delay, isInNextPhase})

    return {label}
  }

  const calcM1Status: calcStatusType = ({newCar}) => {
    const finishedByAi21 = newCar[`DD_HONBSYOK`]

    //日付入力完了
    const dateInput = newCar[`m1_deadline_paper`] && newCar[`m1_deadline_money`]

    //入力日付の遅い方
    const biggestDate = getMinimumDate(
      [`m1_deadline_paper`, `m1_deadline_money`]
        .map(key => newCar[key])
        .filter(d => d)
        .map(d => new Date(d))
    )

    //書類会手
    const withinDeadLine = biggestDate && getMidnight(biggestDate) >= getMidnight()

    const remarks = [`書類回収:${formatDate(dateInput)}`, newCar.m1_remarks]

    const activated = SEISANYOTEI_WITHIN({newCar, within: 30})

    const done = dateInput
    const isInNextPhase = newCar[`DD_FR`] // 本部書類が終わっているか

    const delay = !withinDeadLine && !isInNextPhase

    const {label} = CalcStatus_Common({finishedByAi21, activated, done, delay, isInNextPhase})
    return {label, remarks}
  }

  const calcM0Status: calcStatusType = ({newCar}) => {
    const dateInput = newCar[`m0_deadline_nousya`]
    const finishedByAi21 = newCar[`DD_NOSYA`]
    const withinDeadLine = newCar[`m0_deadline_nousya`] && getMidnight(new Date(newCar[`m0_deadline_nousya`])) >= getMidnight()

    const activated = newCar[`DD_FR`]
    const done = dateInput
    const delay = !withinDeadLine
    const isInNextPhase = newCar[`DD_NOSYA`]

    const {label} = CalcStatus_Common({finishedByAi21, activated, done, delay, isInNextPhase})

    return {label}
  }

  const m2Status = calcM2Status({newCar})
  const m1Status = calcM1Status({newCar})
  const m0Status = calcM0Status({newCar})

  return {m2Status, m1Status, m0Status}
}

export const updateActionStatusByCar = async ({newCar}) => {
  const {m2Status, m1Status, m0Status} = await calcActionStatusByCarId({newCar})

  return await doStandardPrisma(`newCar`, `update`, {
    where: {id: newCar.id},
    data: {m2Status: m2Status.label, m1Status: m1Status.label, m0Status: m0Status.label},
  })
}
