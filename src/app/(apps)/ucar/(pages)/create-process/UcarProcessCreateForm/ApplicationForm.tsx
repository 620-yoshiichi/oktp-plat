'use client'
import { useEffect, useRef } from 'react'
import { C_Stack, FitMargin } from '@cm/components/styles/common-components/common-components'
import { Card } from '@cm/shadcn/ui/card'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

import { useProcessPrerequisites } from './hooks/useProcessPrerequisites'
import {
  TaxRefundToggleForm,
  CustomerInfoForm,
  DestinationForm,
  PrerequisitesWarning,
  SameProcessAlert,
  ProcessRegistrationForm,
} from './components'

type Props = {
  columns: any
  stores: any
  UcarData: any
  useGlobalProps: any
  setopenClearnUp: (value: boolean) => void
  processCode: string
}

export const ProcessApplicationForm = ({ columns, stores, UcarData, useGlobalProps, setopenClearnUp, processCode }: Props) => {
  const { session, toggleLoad } = useGlobalProps
  const { id: userId, storeId } = session ?? {}
  const ucarId = UcarData.id

  const processFormRef = useRef<HTMLDivElement | null>(null)
  const previousPrerequisitesMet = useRef(false)

  const {
    isPaperSendProcess,
    henkinRequiredState,
    showCustomerInfoForm,
    needsCustomerInfo,
    needsDestination,
    taxRefundSelected,
    prerequisitesMet,
    setHenkinRequiredState,
    setCustomerInfoRegistered,
    setDestinationRegistered,
    ProcessCodeItem,
  } = useProcessPrerequisites({ processCode, UcarData })

  const { BasicForm: ProcessRegisterForm, latestFormData } = useBasicFormProps({
    columns,
    formData: {
      userId,
      storeId,
      ucarId,
      processCode,
    },
  })

  const registerdProcess = UcarData.UcarProcess.find(p => p.processCode === processCode)

  // 前提条件が満たされたときに工程入力フォームまでスクロール
  useEffect(() => {
    if (prerequisitesMet && !previousPrerequisitesMet.current && processFormRef.current) {
      setTimeout(() => {
        processFormRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 100)
    }
    previousPrerequisitesMet.current = prerequisitesMet
  }, [prerequisitesMet])

  return (
    <div>
      <C_Stack className="mx-auto w-fit gap-10">
        {/* 前提条件の警告 */}
        {!prerequisitesMet && (
          <PrerequisitesWarning
            taxRefundNotSelected={isPaperSendProcess && !taxRefundSelected}
            needsCustomerInfo={needsCustomerInfo}
            needsDestination={needsDestination}
          />
        )}

        {/* 返金有無の選択（書類送付プロセスの場合） */}
        {isPaperSendProcess && (
          <Card>
            <FitMargin>
              <TaxRefundToggleForm
                UcarData={{ ...UcarData, henkinRequired: henkinRequiredState }}
                onUpdate={(henkinRequired: boolean) => {
                  setHenkinRequiredState(henkinRequired)
                  if (!henkinRequired) {
                    setCustomerInfoRegistered(true)
                  }
                }}
              />
            </FitMargin>
          </Card>
        )}

        {/* お客様情報 / 仕分け先 */}
        {(showCustomerInfoForm || needsDestination) && (
          <Card>
            {showCustomerInfoForm && (
              <FitMargin>
                <CustomerInfoForm
                  UcarData={UcarData}
                  isRegistered={!!UcarData.taxCustomerName}
                  onComplete={() => setCustomerInfoRegistered(true)}
                />
              </FitMargin>
            )}

            {needsDestination && (
              <FitMargin>
                <DestinationForm UcarData={UcarData} stores={stores} onComplete={() => setDestinationRegistered(true)} />
              </FitMargin>
            )}
          </Card>
        )}

        {/* 工程登録 */}
        <Card>
          <SameProcessAlert registerdProcess={registerdProcess} processCode={processCode}>
            <C_Stack className="items-center">
              <ProcessRegistrationForm
                ProcessRegisterForm={ProcessRegisterForm}
                latestFormData={latestFormData}
                ProcessCodeItem={ProcessCodeItem}
                UcarData={UcarData}
                session={session}
                toggleLoad={toggleLoad}
                setopenClearnUp={setopenClearnUp}
                disabled={!prerequisitesMet}
                formRef={processFormRef}
              />
            </C_Stack>
          </SameProcessAlert>
        </Card>
      </C_Stack>
    </div>
  )
}
