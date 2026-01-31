'use client'

import { DataInitiationForm } from '@app/(apps)/ucar/(pages)/createQr/DataInitiationForm'
import { C_Stack, FitMargin } from '@cm/components/styles/common-components/common-components'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import NotAvailable from '@cm/components/utils/NotAvailable'
import { useDataSearchForm } from '@app/(apps)/ucar/(pages)/createQr/DataSearchForm'
import { HREF } from '@cm/lib/methods/urls'
import { T_LINK } from '@cm/components/styles/common-components/links'
import useSWR from 'swr'
import { UcarCL, ucarData } from '@app/(apps)/ucar/class/UcarCL'
import { useState } from 'react'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

const QrCreatePageCC = () => {
  const [sateiID, setsateiID] = useState('')
  const { toggleLoad, session, query, pathname } = useGlobal()
  const { data: stores = [] } = useDoStandardPrisma('store', 'findMany', {}, { deps: [] })

  const { data: ucar, isLoading: isUcarLoading } = useSWR(['ucarCreate', pathname, sateiID].join('/'), async () => {
    return (await UcarCL.fetcher.getUcarDataBySateiId(sateiID ?? '')) as ucarData
  })

  // UPASSDBの検索結果を取得
  const { data, isLoading: isUpassLoading } = useSWR(['upassCreate', pathname, sateiID].join('/'), async () => {
    if (!sateiID) return null

    const { result: upassData } = await doStandardPrisma('uPASS', 'findUnique', {
      where: { sateiID: String(sateiID) },
    })

    const { isLastSateiId, lastSateiId, AlertComponent } = await UcarCL.getUpassFaimilyTree({ sateiID: sateiID })

    return {
      upassData,
      isLastSateiId,
      AlertComponent,
    }
  })

  const { upassData, isLastSateiId, AlertComponent } = data ?? {}
  console.log(upassData)  //logs

  const { sateiID_Input, DataSearchForm } = useDataSearchForm({

    sateiID,
    setsateiID,
  })

  if (isUcarLoading || isUpassLoading) return <></>

  return (
    <div className={`p-4`}>
      <FitMargin>
        <C_Stack className="gap-6">
          {/* 検索フォームを画面上部に配置 */}
          <div className="border-b pb-4">
            <DataSearchForm />
          </div>

          {ucar &&
            <C_Stack className="items-center gap-4">

              <C_Stack className={` t-link items-center gap-4 `}>
                <T_LINK href={HREF(`/ucar/qr`, { sateiID: ucar?.sateiID }, query)}>QRシート表示</T_LINK>
              </C_Stack>
            </C_Stack>
          }


          {sateiID && (
            <NotAvailable {...{ isAvailable: !!sateiID, reason: `対象の車両を検索してください` }}>
              <>
                {isLastSateiId ? (
                  <div>
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
                  </div>
                ) : (
                  <div>
                    {AlertComponent ? (
                      AlertComponent
                    ) : (
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
                    )}
                  </div>
                )}
              </>
            </NotAvailable>
            // <NotAvailable {...{ isAvailable: !!sateiID, reason: `対象の車両を検索してください` }}>
            //   {ucar ? (
            //     <C_Stack className="items-center gap-4">
            //       <Alert>一度登録されたデータです。</Alert>
            //       <C_Stack className={` t-link items-center gap-4 `}>
            //         <T_LINK href={HREF(`/ucar/qr`, { sateiID: ucar?.sateiID }, query)}>QRシート表示</T_LINK>
            //       </C_Stack>
            //     </C_Stack>
            //   ) : (
            //     <>
            //       {ucar?.UPASS && isLastSateiId ? (
            //         <></>
            //       ) : (
            //         <>
            //           {isLastSateiId ? (
            //             <div>
            //               <DataInitiationForm
            //                 {...{
            //                   stores,
            //                   ucar,
            //                   toggleLoad,
            //                   session,
            //                   sateiID_Input,
            //                   hasUpassData: !!upassData,
            //                 }}
            //               />
            //             </div>
            //           ) : (
            //             <div>
            //               {AlertComponent ? (
            //                 AlertComponent
            //               ) : (
            //                 <DataInitiationForm
            //                   {...{
            //                     stores,
            //                     ucar,
            //                     toggleLoad,
            //                     session,
            //                     sateiID_Input,
            //                     hasUpassData: !!upassData,
            //                   }}
            //                 />
            //               )}
            //             </div>
            //           )}
            //         </>
            //       )}
            //     </>
            //   )}
            // </NotAvailable>
          )}
          {/* 検索後のコンテンツ */}
        </C_Stack>
      </FitMargin>
    </div>
  )
}

export default QrCreatePageCC
