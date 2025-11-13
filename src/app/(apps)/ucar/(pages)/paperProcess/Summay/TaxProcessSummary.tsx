import React from 'react'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import InlineTaxCalucrator from '@app/(apps)/ucar/class/ColBuilder/lib/ucar/ucarCols-lib/InlineTaxCalucrator'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {TextBlue} from '@cm/components/styles/common-components/Alert'
import {SectionHeader} from '@app/(apps)/ucar/(pages)/paperProcess/Summay/PaperProcessSummary'
import {BanknotesIcon, InboxArrowDownIcon, PencilSquareIcon} from '@heroicons/react/20/solid'
import {SummaryWrapper} from '@app/(apps)/ucar/(pages)/paperProcess/Summay/parts/SummaryWrapper'
import {KeyValue} from '@cm/components/styles/common-components/ParameterCard'
import {Button} from '@cm/components/styles/common-components/Button'
import {NumHandler} from '@cm/class/NumHandler'

export default function TaxProcessSummary({car}) {
  const {
    registerdAt,
    earlyRecievedAt,
    paymentNoticeRecievedAt,
    isPayed,
    annualTax,
    accountType,
    accountNumber,
    accountName,
    taxCalcuration,
    taxJobNote,
    petCount,
    petPrice,
    prefCount,
    prefPrice,
    BankMaster,
    BankBranchMaster,
  } = car

  const bankAccount1 = [BankMaster?.name, BankBranchMaster?.name].filter(Boolean).join(` / `)
  const bankAccount2 = [accountNumber, accountName].filter(Boolean).join(` / `)

  return (
    <SummaryWrapper>
      <div style={{width: 420}}>
        <C_Stack className={`gap-0.5 leading-3`}>
          <div className={` border-b`}>
            <SectionHeader label={`入庫`} Icon={InboxArrowDownIcon} />
            <R_Stack className={`flex-nowrap gap-2`}>
              <section className={`min-w-[160px]`}>
                <C_Stack className={`gap-0.5`}>
                  <KeyValue label="登録日(購入車)">{formatDate(car.registerdAt, `short`)}</KeyValue>
                  <KeyValue label="仕入日(下取車)">{formatDate(car.registerdAt, `short`)}</KeyValue>
                </C_Stack>
              </section>
              <section className={`w-full`}>
                <C_Stack className={`gap-0.5`}>
                  <KeyValue label="支店">{bankAccount1}</KeyValue>
                  <KeyValue label="口座">{bankAccount2}</KeyValue>
                </C_Stack>
              </section>
            </R_Stack>
          </div>

          <div className={` border-b`}>
            <SectionHeader
              label={
                <R_Stack className={`w-full justify-between gap-0`}>
                  <KeyValue label="自動車税">
                    <R_Stack className={`  justify-between gap-4`}>
                      <InlineTaxCalucrator {...{row: car}}>
                        <Button {...{className: `text-[9px] p-[0px] px-[6px] rounded-[3px]  `}}>計算</Button>
                      </InlineTaxCalucrator>
                      {annualTax && <TextBlue>{NumHandler.toPrice(annualTax)}円/年</TextBlue>}
                    </R_Stack>
                  </KeyValue>
                </R_Stack>
              }
              Icon={() => <BanknotesIcon {...{className: `h-4 w-4`}} />}
            />
            <R_Stack className={`gap-0`}>
              <section className={`w-1/2`}>
                <C_Stack className={`gap-0.5`}>
                  <KeyValue label="自社">
                    {petCount ? (
                      <TextBlue>
                        {petCount}月分:{NumHandler.toPrice(petPrice)}円
                      </TextBlue>
                    ) : (
                      <TextBlue>なし</TextBlue>
                    )}
                  </KeyValue>
                </C_Stack>
              </section>
              <section className={`w-1/2`}>
                <C_Stack className={`gap-0.5`}>
                  <KeyValue label="県税">
                    {prefCount ? (
                      <TextBlue>
                        {prefCount}月分:{NumHandler.toPrice(prefPrice)}円
                      </TextBlue>
                    ) : (
                      <TextBlue>なし</TextBlue>
                    )}
                  </KeyValue>
                </C_Stack>
              </section>
            </R_Stack>
            <SectionHeader label={`備考`} Icon={PencilSquareIcon} />
            <R_Stack className={`gap-0`}>
              <section className={`w-1/2`}>
                <C_Stack className={`gap-0.5`}>
                  <KeyValue label="例外処理">{taxJobNote}</KeyValue>
                </C_Stack>
              </section>
              <section className={`w-1/2`}>
                <C_Stack className={`gap-0.5`}>
                  <KeyValue label="納付済み">{isPayed ? '済' : '未'}</KeyValue>
                </C_Stack>
              </section>
            </R_Stack>
          </div>
        </C_Stack>
      </div>
    </SummaryWrapper>
  )
}
