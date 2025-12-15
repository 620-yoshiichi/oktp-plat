'use client'

import {DataInitiationForm} from '@app/(apps)/ucar/(pages)/createQr/DataInitiationForm'
import {C_Stack, FitMargin, R_Stack} from '@cm/components/styles/common-components/common-components'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import NotAvailable from '@cm/components/utils/NotAvailable'
import {useDataSearchForm} from '@app/(apps)/ucar/(pages)/createQr/DataSearchForm'
import {Alert} from '@cm/components/styles/common-components/Alert'
import {HREF} from '@cm/lib/methods/urls'
import {T_LINK} from '@cm/components/styles/common-components/links'
import useSWR from 'swr'
import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'
import {UpassDataDisplay} from '@app/(apps)/ucar/(pages)/createQr/CC/UpassDataDisplay'
import {Card} from '@cm/shadcn/ui/card'

const QrCreatePageCC = () => {
  const {toggleLoad, session, query} = useGlobal()
  const {data: stores = []} = useDoStandardPrisma('store', 'findMany', {}, {deps: []})
  const {data: ucar} = useSWR(`/ucar/qr/create`, async () => {
    return await UcarCL.fetcher.getUcarDataBySateiId(query.sateiID ?? '')
  })

  // UPASSDBの検索結果を取得
  const {data} = useSWR(query.sateiID ? `/ucar/qr/create/upass/${query.sateiID}` : null, async () => {
    if (!query.sateiID) return null
    const {doStandardPrisma} = await import('@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma')
    const {result: upassData} = await doStandardPrisma('uPASS', 'findUnique', {
      where: {sateiID: String(query.sateiID)},
    })

    const {isLastSateiId, lastSateiId, AlertComponent} = await UcarCL.getUpassFaimilyTree({sateiID: query.sateiID})

    return {
      upassData,
      isLastSateiId,
      AlertComponent,
    }
  })

  const {upassData, isLastSateiId, AlertComponent} = data ?? {}

  const {sateiID_Input, DataSearchForm} = useDataSearchForm()

  return (
    <div className={`p-4`}>
      <FitMargin>
        <C_Stack className="gap-6">
          {/* 検索フォームを画面上部に配置 */}
          <div className="border-b pb-4">
            <DataSearchForm />
          </div>

          {query.sateiID && (
            <NotAvailable {...{isAvailable: query.sateiID, reason: `対象の車両を検索してください`}}>
              {ucar ? (
                <C_Stack className="items-center gap-4">
                  <Alert>一度登録されたデータです。</Alert>
                  <C_Stack className={` t-link items-center gap-4 `}>
                    <T_LINK href={HREF(`/ucar/qr`, {sateiID: ucar?.sateiID}, query)}>QRシート表示</T_LINK>
                  </C_Stack>
                </C_Stack>
              ) : (
                <>
                  {isLastSateiId ? (
                    <div>
                      <R_Stack className="gap-6 items-start">
                        {/* UPASSデータが存在する場合、詳細情報を表示 */}

                        <Card>
                          <DataInitiationForm
                            {...{
                              stores,
                              ucar,
                              toggleLoad,
                              session,
                              sateiID_Input,
                              hasUpassData: !!upassData,
                            }}
                          />
                        </Card>
                        {upassData && (
                          <Card>
                            <h3 className="text-lg font-semibold mb-4">UPASSデータ詳細</h3>
                            <UpassDataDisplay upassData={upassData} />
                          </Card>
                        )}
                      </R_Stack>
                    </div>
                  ) : (
                    AlertComponent
                  )}
                </>
              )}
            </NotAvailable>
          )}
          {/* 検索後のコンテンツ */}
        </C_Stack>
      </FitMargin>
    </div>
  )
}

export default QrCreatePageCC
