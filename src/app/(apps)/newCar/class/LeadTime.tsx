import {NewCarClass} from '@app/(apps)/newCar/class/NewCarClass/NewCarClass'

export type LT_CRITERIA = {
  actionKey?: string
  id: leadTimeIdStrings
  name: string
  fromLabel: string
  toLabel: string
  fromKey: string
  toKey: string
  max: number
}
export const LEAD_TIME_CRITERIA = [
  {actionKey: `m2`, fromKey: `DD_FR`, toKey: `DD_HONBSYOK`, fromLabel: '振当日', toLabel: '書類日', max: 0},

  {actionKey: undefined, fromKey: `DD_FR`, toKey: `DD_TOUROKU`, fromLabel: '振当日', toLabel: '登録日', max: 14},

  {actionKey: undefined, fromKey: `DD_FR`, toKey: `DD_HAISOYOT`, fromLabel: '振当日', toLabel: '配送予定日', max: 14},

  {actionKey: undefined, fromKey: `DD_HAISOYOT`, toKey: `DD_NOSYA`, fromLabel: '配送予定日', toLabel: '納車日', max: 5},

  {actionKey: undefined, fromKey: `DD_FR`, toKey: `DD_NOSYA`, fromLabel: '振当日', toLabel: '納車日', max: 23},
].map(d => {
  const name = `${d.toLabel}LT 超過`
  const id = [d.fromKey, d.toKey].join(`-`)

  return {...d, name, id}
}) as LT_CRITERIA[]

export type leadTimeIdStrings =
  | `DD_FR-DD_HONBSYOK`
  | `DD_FR-DD_TOUROKU`
  | `DD_FR-DD_HAISOYOT`
  | `DD_HAISOYOT-DD_NOSYA`
  | `DD_FR-DD_NOSYA`

export const COLORS = {
  safe: `#79abd1`,
  warn: `#fffdc0`,
  danger: `#ff8074`,
}

export class LeadTime {
  static getCriteriaById = (id: leadTimeIdStrings) => {
    return LEAD_TIME_CRITERIA.find(c => c.id === id)
  }

  static getLeadTimeById = (props: {id: leadTimeIdStrings; car: any}) => {
    const {id, car} = props

    const criteria = LeadTime.getCriteriaById(id) as LT_CRITERIA

    return new NewCarClass(car).calcLeadTime(criteria)
  }
}
