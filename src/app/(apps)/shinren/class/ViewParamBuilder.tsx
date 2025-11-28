'use client'

import {ViewParamBuilderProps} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {HREF} from '@cm/lib/methods/urls'

export class ViewParamBuilder {
  static rentaDailyReport: ViewParamBuilderProps = props => {
    const {router, query} = props.useGlobalProps
    return {
      myTable: {style: {width: `90vw`, maxWidth: 1200}},
      myForm: {
        create: {
          finalizeUpdate: async ({res}) => {
            const dailyReport = res.result
            const {rentaCustomerId, visitType} = dailyReport

            const {result: Outcome} = await doStandardPrisma(`outcome`, `findMany`, {
              where: {rentaDailyReportId: dailyReport.id},
              include: {
                OutcomeMaster: true,
              },
            })
            const outcomeToAddToContinuingCustomer = Outcome.some(o => o.OutcomeMaster?.name === '新規継続追加')

            const autoInputContinue = (visitType && visitType.includes(`新規[継続]`)) || outcomeToAddToContinuingCustomer
            if (autoInputContinue) {
              const Customer = await doStandardPrisma('rentaCustomer', 'update', {
                where: {id: rentaCustomerId},
                data: {result: '継続する'},
              })
              alert(`顧客データを新規[継続]に自動更新しました。継続を辞める場合は、顧客基本情報から変更してください。`)
            }

            if (confirm(`そのまま詳細ページで入力をしますか?`)) {
              const href = HREF(`/shinren/admin/config/rentaDailyReport/${dailyReport.id}`, {}, query)
              router.push(href)
            } else {
              // const href = HREF(`/shinren/admin/config/rentaDailyReport`, query, query)
              // router.push(href)
              // router.back()
              router.refresh()
            }
          },
        },
      },
    }
  }
}
