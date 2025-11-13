import React, {ReactNode} from 'react'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import {TextBlue} from '@cm/components/styles/common-components/Alert'
import {ColoredText} from '@cm/components/styles/common-components/colors'
import EmptyPlaceholder from '@cm/components/utils/loader/EmptyPlaceHolder'
import {DocumentArrowDownIcon, HandThumbUpIcon, InboxArrowDownIcon} from '@heroicons/react/20/solid'
import {SummaryWrapper} from '@app/(apps)/ucar/(pages)/paperProcess/Summay/parts/SummaryWrapper'
import {KeyValue} from '@cm/components/styles/common-components/ParameterCard'
import useGarageEditorGMF from '@app/(apps)/ucar/(parts)/templateHooks/useGarageEditorGMF'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'
export default function PaperProcessSummary({car, UcarGarageLocationMaster}) {
  const GMF_GarageRegister = useGarageEditorGMF()
  const {STORE_NYUKO, STORE_TENCHO_KENSHU} = UcarProcessCl.CODE.raw
  const {UcarProcess} = car

  const stuffProcess = UcarProcess.find(p => p.processCode === STORE_NYUKO.code)
  const managerProcessMaster = UcarProcess?.find(p => p.processCode === STORE_TENCHO_KENSHU.code)

  const InkanColor = UCAR_CODE.INKAN_ALTERNATES.byCode(car.inkanAlternate)?.color ?? ``

  const Inkan = car.inkanAlternate ? (
    <ColoredText className={`!p-0.5 !text-xs`} bgColor={InkanColor}>
      {UCAR_CODE.INKAN_ALTERNATES.byCode(car.inkanAlternate)?.label}
    </ColoredText>
  ) : (
    car.inkanCertificateExpiredAt && formatDate(car.inkanCertificateExpiredAt)
  )

  const InspectionColor = UCAR_CODE.INSPECTION_ALTERNATE.byCode(car.inspectionAlternate)?.color ?? ``

  const Inspection = car.inspectionAlternate ? (
    <ColoredText className={`!p-0.5 !text-xs`} bgColor={InspectionColor}>
      {UCAR_CODE.INSPECTION_ALTERNATE.byCode(car.inspectionAlternate)?.label}
    </ColoredText>
  ) : (
    car.inspectionExpiredAt && formatDate(car.inspectionExpiredAt)
  )

  return (
    <SummaryWrapper>
      <div style={{width: 280}}>
        <C_Stack className={`justify-between gap-0.5 leading-3  `}>
          <div className={` border-b`}>
            <SectionHeader label={`店舗処理`} Icon={InboxArrowDownIcon} />
            <C_Stack className={`gap-0.5`}>
              <section className={``}>
                <R_Stack className={`justify-between gap-0.5`}>
                  <KeyValue label="スタッフ">{formatDate(stuffProcess?.date, `short`)}</KeyValue>

                  <KeyValue label="店長">{formatDate(managerProcessMaster?.date, `short`)}</KeyValue>
                </R_Stack>
              </section>
            </C_Stack>
          </div>
          <div>
            <SectionHeader label={`本部確認`} Icon={InboxArrowDownIcon} />
            <C_Stack className={`gap-0.5`}>
              <section className={``}>
                <R_Stack className={`justify-between gap-0.5`}>
                  <KeyValue label="本部着">{formatDate(car.arrivedAt, `short`)}</KeyValue>
                </R_Stack>
              </section>

              <section className={``}>
                <R_Stack className={`justify-between gap-0.5`}>
                  <KeyValue label="印鑑">{Inkan}</KeyValue>
                  <KeyValue label="車検">{Inspection}</KeyValue>
                </R_Stack>
              </section>

              <section className={``}>
                <R_Stack className={`justify-between gap-0.5`}>
                  <KeyValue label="受入区分">
                    {car.purchaseType && (
                      <ColoredText
                        className={` !p-[1px] !text-xs `}
                        bgColor={UCAR_CODE.PURCHASE_TYPES.byCode(car.purchaseType)?.color ?? ``}
                      >
                        {UCAR_CODE.PURCHASE_TYPES.byCode(car.purchaseType)?.label}
                      </ColoredText>
                    )}
                  </KeyValue>
                  <KeyValue label="処理区分">
                    {car.processedAs && (
                      <ColoredText
                        className={` !p-[1px] !text-xs `}
                        bgColor={UCAR_CODE.PROCESSED_AS.byCode(car.processedAs)?.color ?? ``}
                      >
                        {UCAR_CODE.PROCESSED_AS.byCode(car.processedAs)?.label}
                      </ColoredText>
                    )}
                  </KeyValue>
                </R_Stack>
              </section>
            </C_Stack>
          </div>

          <div className={` border-b`}>
            <SectionHeader label={`結果`} Icon={HandThumbUpIcon} />

            <section>
              {car.processedAs === null && <small className={`text-error-main`}>行き先未定</small>}
              {car.processedAs === `抹消` && (
                <C_Stack>
                  <KeyValue label="抹消">
                    {car.meihenMasshoShoribi ? (
                      <TextBlue>{formatDate(car.meihenMasshoShoribi, `short`)}</TextBlue>
                    ) : (
                      <EmptyPlaceholder className={`text-orange-500`}>未完了</EmptyPlaceholder>
                    )}
                  </KeyValue>
                </C_Stack>
              )}

              {car.processedAs === `名義変更` && (
                <R_Stack className={` justify-between`}>
                  <R_Stack className={` gap-1 `}>
                    <small>車庫:</small>
                    {UcarGarageLocationMaster ? (
                      <R_Stack className={`gap-0  `}>
                        <TextBlue>{car.AppliedUcarGarageSlot?.UcarGarageSlotMaster?.UcarGarageLocationMaster?.name}</TextBlue>
                        <small>{`(${formatDate(car.AppliedUcarGarageSlot.createdAt, `short`)})`}</small>
                      </R_Stack>
                    ) : (
                      <EmptyPlaceholder className={`text-orange-500`}>未完了</EmptyPlaceholder>
                    )}

                    <DocumentArrowDownIcon
                      className={`text-blue-main w-5`}
                      onClick={async () => {
                        GMF_GarageRegister.setGMF_OPEN({ucar: car, UcarGarageLocationMaster})
                      }}
                    />
                  </R_Stack>
                  <R_Stack className={`gap-0 `}>
                    <small>名変:</small>
                    {car.meihenMasshoShoribi ? (
                      <TextBlue>{formatDate(car.meihenMasshoShoribi, `short`)}</TextBlue>
                    ) : (
                      <EmptyPlaceholder className={`text-orange-500`}>未完了</EmptyPlaceholder>
                    )}
                  </R_Stack>
                </R_Stack>
              )}
            </section>
          </div>
        </C_Stack>
      </div>
    </SummaryWrapper>
  )
}

export const SectionHeader = (props: {label: string | ReactNode; Icon: any}) => {
  const {label, Icon} = props
  return (
    <R_Stack className={`gap-0  text-xs  font-bold text-gray-600`}>
      <div>
        <Icon {...{className: `h-3 `}}></Icon>
      </div>
      <div>{label}</div>
    </R_Stack>
  )
}
