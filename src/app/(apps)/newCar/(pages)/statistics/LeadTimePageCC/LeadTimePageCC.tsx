'use client'
import {C_Stack, Padding, R_Stack} from '@cm/components/styles/common-components/common-components'

import useStatisTicsTable from '@app/(apps)/newCar/(pages)/statistics/LeadTimePageCC/useStatisTicsTable'
import FilterConfig from '@app/(apps)/newCar/(pages)/statistics/LeadTimePageCC/FilterConfig'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import {useLeadTimeUserModal} from '@app/(apps)/newCar/(pages)/statistics/LeadTimePageCC/useLeadTimeUserModal'
import {Paper} from '@cm/components/styles/common-components/paper'

export default function LeadTimePageCC() {
  const HK_LeadTimeUserModal = useLeadTimeUserModal()
  const {query} = useGlobal()

  const compareMode = false

  const commonFilterQuery = {
    dataKey: 'DD_NOSYA',
    by: `スタッフ`,
    sort: 'ASC',
    ...query,
  }

  const tableOne = useStatisTicsTable({
    commonFilterQuery,
    fromKey: `lt1_from`,
    toKey: `lt1_to`,
  })

  const tableTwo = useStatisTicsTable({
    commonFilterQuery,

    fromKey: `lt2_from`,
    toKey: `lt2_to`,
  })

  return (
    <Padding className={`p-4`}>
      {<HK_LeadTimeUserModal.Modal />}
      <C_Stack className={` mx-auto w-[1300px]  items-center`}>
        <Paper className={` `}>
          <FilterConfig {...{commonFilterQuery}} />
        </Paper>
        <div>
          <R_Stack className={` flex-nowrap items-start justify-center gap-10`}>
            <Paper>
              <tableOne.Table
                {...{
                  dataToCompare: compareMode ? tableTwo.data : undefined,
                }}
              />
            </Paper>
            {compareMode && (
              <Paper>
                <tableTwo.Table {...{dataToCompare: tableOne.data}} />
                <small></small>
              </Paper>
            )}
          </R_Stack>
        </div>
      </C_Stack>
    </Padding>
  )
}
