import {m1} from '@app/(apps)/newCar/(constants)/checkpoints/m1'
import {m2} from '@app/(apps)/newCar/(constants)/checkpoints/m2'

import {furiate} from '@app/(apps)/newCar/(constants)/checkpoints/m0'

import {differenceInDays} from 'date-fns'

import {colorVariants} from '@cm/lib/methods/colorVariants'
import {colType} from '@cm/types/col-types'

export type newCarModel = any
export type checkPoint = {
  alertKey: string
  label: string
  actionName: string
  description?: string
  getColumns: ({newCar}) => colType[]
  getRemarks?: ({newCar}) => string[]
  conditions: {
    alert: string
    complete: string
  }
}

export const commonAlert = ({newCar, CriteriaDD, withinDays}) => {
  const CriteriaDate = newCar[CriteriaDD]
  const near = CriteriaDate && differenceInDays(new Date(CriteriaDate), new Date()) <= withinDays
  return near ? '入力' : ''
}

export const CHECK_POINTS: checkPoint[] = [m2, m1, furiate]

export type actionStatusLabels = `未活動` | `対象` | `遅れ` | `対処済み` | `生産予定未定`

export type actionStatusMasterType = {
  label: actionStatusLabels
  color: colorVariants
  processed?: boolean
  required: boolean //対応必用
  overdue: boolean //期限切れ
  failed: boolean //対応必用だが、対応されていない
  completed: boolean //完了
  waiting: boolean //待ち
}[]

export const actionStatusMaster: actionStatusMasterType = [
  {
    label: `未活動`,
    color: ``,
    required: false,
    overdue: false,
    failed: true,
    completed: false,
    waiting: false,
  },
  {
    label: `対象`,
    color: `red`,
    required: true,
    overdue: false,
    failed: false,
    completed: false,
    waiting: false,
  },
  {
    label: `遅れ`,
    color: `yellow`,
    required: true,
    overdue: true,
    failed: false,
    completed: false,
    waiting: false,
  },
  {
    label: `対処済み`,
    color: `blue`,
    required: false,
    overdue: false,
    failed: false,

    completed: true,
    waiting: false,
  },
  {
    label: `生産予定未定`,
    color: `gray`,
    required: false,
    overdue: false,
    failed: false,
    completed: false,
    waiting: true,
  },
]

const overDueCols = actionStatusMaster.filter(d => d.overdue)

const requiredCols = actionStatusMaster.filter(d => d.required && !d.overdue)
const failedCols = actionStatusMaster.filter(d => d.failed)

const completedCols = actionStatusMaster.filter(d => !d.failed && !d.required && !d.overdue)

export const isRequired = keyStr => ({OR: requiredCols.map(d => ({[keyStr]: d.label}))})

export const isFailed = keyStr => ({OR: failedCols.map(d => ({[keyStr]: d.label}))})

export const isDelayed = keyStr => ({OR: overDueCols.map(d => ({[keyStr]: d.label}))})

const isCompleted = keyStr => ({OR: completedCols.map(d => ({[keyStr]: d.label}))})

const isWaiting = keyStr => ({OR: actionStatusMaster.filter(d => d.waiting).map(d => ({[keyStr]: d.label}))})

export const isImcompleted = keyStr => {
  const Required = isRequired(keyStr)
  const Delayed = isDelayed(keyStr)
  const Completed = isCompleted(keyStr)
  const waiting = isWaiting(keyStr)

  const imcompleted = {
    NOT: {OR: [...Completed.OR, ...waiting.OR]},
    OR: [...Required.OR, ...Delayed.OR],
  }
  return imcompleted
}
