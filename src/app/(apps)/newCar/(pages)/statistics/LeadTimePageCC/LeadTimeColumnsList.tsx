import {Prisma} from '@prisma/generated/prisma/client'

const Fr: any = {label: '振当', fieldKey: 'DD_FR'}

export type LeadTimeColumn = {
  from: {label: string; fieldKey: keyof Prisma.NewCarUncheckedCreateInput}
  to: {label: string; fieldKey: keyof Prisma.NewCarUncheckedCreateInput}
  avgDataKey: string
  avgDataLabel: string
  sortTarget?: boolean
}
export const LeadTimeColumnList: LeadTimeColumn[] = [
  {from: Fr, to: {label: '書類完備', fieldKey: 'DD_HONBSYOK'}, sortTarget: true},
  {from: Fr, to: {label: '登録予定申請日', fieldKey: `lastApprovedDesiredTorokuDate`}},
  {from: Fr, to: {label: '登録日', fieldKey: 'DD_TOUROKU'}},
  {from: Fr, to: {label: 'CR着', fieldKey: 'DD_CENTTYAB'}},
  {from: Fr, to: {label: '配送予定', fieldKey: 'DD_HAISKIBO'}},
  {from: Fr, to: {label: 'CR出', fieldKey: 'DD_CENTSYUB'}},
  {from: Fr, to: {label: '納車日', fieldKey: 'DD_NOSYA'}},
].map((d: any) => {
  const avgDataKey = `${d.from.fieldKey}___${d.to.fieldKey}`
  const avgDataLabel = `${d.from.label}から\n${d.to.label}`
  return {...d, avgDataKey, avgDataLabel}
})
