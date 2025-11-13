import {Shinren} from '@app/(apps)/shinren/class/Shinren'
import {T_LINK} from '@cm/components/styles/common-components/links'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

import Accordion from '@cm/components/utils/Accordions/Accordion'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {cl} from '@cm/lib/methods/common'
import {HREF} from '@cm/lib/methods/urls'
import {DetailPagePropType} from '@cm/types/types'
import {Alert} from '@cm/components/styles/common-components/Alert'
import useWindowSize from '@cm/hooks/useWindowSize'

const CustomerWithoutNeoData = (props: DetailPagePropType) => {
  const {additional, useGlobalProps} = props
  const {device} = useWindowSize()
  const {query, rootPath} = useGlobalProps

  const {data} = useDoStandardPrisma(
    'rentaCustomer',
    'findMany',
    {
      where: {
        ...additional?.where,
      },
      include: {User: {}},
    },
    {deps: [additional?.where]}
  )

  const filteredByName = data?.filter(cstmr => !Shinren.rentaCustomer.hasNeoData(cstmr))

  if (!data) return
  return (
    <>
      <Accordion
        {...{
          className: 'w-[300px]',
          defaultOpen: device.PC,
          label: <div>NEO未連携データ</div>,
          children: (
            <div>
              <small>NEOの顧客コードを入力すると、次の定期更新で反映します</small>

              <div className={`table-wrapper  h-[50vh]`}>
                <table>
                  <thead className={`bg-gray-100`}>
                    <tr>
                      <th>コード</th>
                      <th>名称</th>
                      <th>担当</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredByName.map(cstmr => {
                      const href = HREF(`/shinrenrentaCustomer/${cstmr.id}`, {}, query)
                      const alertClass = cl(`text-responsive`)

                      return (
                        <tr key={cstmr.id} className={`text-responsive`}>
                          <td>
                            {cstmr.code ? (
                              <Alert className={alertClass} color="green">
                                <R_Stack className={`text-[12px]`}>
                                  <span>OK</span>
                                  <small>更新待</small>
                                </R_Stack>
                              </Alert>
                            ) : (
                              <Alert className={alertClass} color="red">
                                要入力
                              </Alert>
                            )}
                          </td>
                          <td>
                            <T_LINK href={href}>{cstmr.name}</T_LINK>
                          </td>
                          <td>{cstmr.User.name}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ),
        }}
      />
    </>
  )
}

export default CustomerWithoutNeoData
