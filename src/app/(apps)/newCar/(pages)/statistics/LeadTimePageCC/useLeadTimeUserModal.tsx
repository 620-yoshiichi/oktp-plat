import { getLeadTimeSqlType } from '@app/(apps)/newCar/(pages)/statistics/LeadTimePageCC/getLeadTimeSql'
import { LeadTimeColumnList } from '@app/(apps)/newCar/(pages)/statistics/LeadTimePageCC/LeadTimeColumnsList'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { fetchRawSql } from '@cm/class/Fields/lib/methods'
import { sql } from '@cm/class/SqlBuilder/SqlBuilder'
import { C_Stack } from '@cm/components/styles/common-components/common-components'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { useGlobalModalForm } from '@cm/components/utils/modal/useGlobalModalForm'

import useSWR from 'swr'

export const useLeadTimeUserModal = () => {
  return useGlobalModalForm<{
    record: {
      storeCode: string
      userCode: string
      storeName: string
      userName: string
    }
    SqlGetter: getLeadTimeSqlType
  }>(`leadtimeTableUser`, null, {
    mainJsx: props => {
      const { record, SqlGetter } = props.GMF_OPEN
      let additionalWherePhrase = ''
      if (record.storeCode) {
        additionalWherePhrase = sql`AND "UserStore"."code" = ${record.storeCode}`
      }
      if (record.userCode) {
        additionalWherePhrase = sql`AND "User"."code" = ${record.userCode}`
      }

      const { leadTimeDetailSql } = SqlGetter({
        additionalWherePhrase,
      })

      const { data = [] } = useSWR(leadTimeDetailSql, sql => fetchRawSql({ sql }).then(d => d.rows ?? []))

      const TB = CsvTable({
        records: data.map(d => {
          return {
            csvTableRow: [
              { label: `注文No`, cellValue: d['NO_CYUMON'], style: { minWidth: 80, fontSize: 12 } },
              { label: `買主名`, cellValue: d['KJ_KAINMEI1'], style: { minWidth: 80, fontSize: 12 } },
              { label: `名義人名`, cellValue: d['KJ_MEIGIME1'], style: { minWidth: 80, fontSize: 12 } },
              { label: `担当スタッフ`, cellValue: d['userName'], style: { minWidth: 80, fontSize: 12 } },
              { label: `車名`, cellValue: d['KJ_KURUMAME'], style: { minWidth: 80, fontSize: 12 } },
              { label: `納車日`, cellValue: formatDate(d['DD_NOSYA']), style: { minWidth: 100, fontSize: 12 } },

              ...LeadTimeColumnList.map(col => {
                return {
                  label: col.avgDataLabel,
                  cellValue: d[col.avgDataKey],
                  style: { minWidth: 60, fontSize: 12 },
                }
              }),
            ],
          }
        }),
      })

      return (
        <div>
          <section>
            <C_Stack>
              <strong>{record.storeName}</strong>
              <strong>{record.userName}</strong>
            </C_Stack>
          </section>

          <section>
            <TB.WithWrapper size="sm" />
          </section>
        </div>
      )
    },
  })
}
