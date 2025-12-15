'use client'
import useUserInfoRegister from '@app/(apps)/ucar/(pages)/create-process/UcarProcessCreateForm/UserInfoRegister'

import {createProcessWithPostHandler} from '@app/(apps)/ucar/(lib)/server-actions/Ucar-server-actions'
import {useState, useEffect, useRef} from 'react'
import {toast} from 'react-toastify'
import {C_Stack, FitMargin} from '@cm/components/styles/common-components/common-components'
import {Button} from '@cm/components/styles/common-components/Button'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Alert, Text} from '@cm/components/styles/common-components/Alert'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {cn} from '@cm/shadcn/lib/utils'

import {toastByResult} from '@cm/lib/ui/notifications'
import {Fields} from '@cm/class/Fields/Fields'
import {Card} from '@cm/shadcn/ui/card'
import {__shared_get_shiwakeKekkeCol} from '@app/(apps)/ucar/class/ColBuilder/getter/shared_shiwakeKekkeCol'

/**
 * プロセスタイプに応じた前提条件のチェックと管理を行う
 */
const useProcessPrerequisites = ({processCode, UcarData}) => {
  const ProcessCodeItem = UcarProcessCl.CODE.byCode(processCode)
  const isCrChakuProcess = ProcessCodeItem?.code === UcarProcessCl.CODE.raw.CR_CHAKU.code
  const isPaperSendProcess = ProcessCodeItem?.code === UcarProcessCl.CODE.raw.STORE_SHORUI_SOUHU.code

  // 書類送付プロセスの場合：お客様情報が必要
  const needsCustomerInfo = isPaperSendProcess && !UcarData.taxCustomerName
  const [customerInfoRegistered, setCustomerInfoRegistered] = useState(!needsCustomerInfo)

  // CR着プロセスの場合：仕分け先が必要
  const needsDestination = isCrChakuProcess && !UcarData.destination
  const [DestinationRegistered, setDestinationRegistered] = useState(!needsDestination)

  // UcarDataが更新されたときに状態を更新
  useEffect(() => {
    if (isPaperSendProcess) {
      setCustomerInfoRegistered(!!UcarData.taxCustomerName)
    }
  }, [UcarData.taxCustomerName, isPaperSendProcess, setCustomerInfoRegistered])

  useEffect(() => {
    if (isCrChakuProcess) {
      setDestinationRegistered(!!UcarData.destination)
    }
  }, [UcarData.destination, isCrChakuProcess])

  // 前提条件が満たされているか
  const prerequisitesMet = customerInfoRegistered && DestinationRegistered

  return {
    isCrChakuProcess,
    isPaperSendProcess,
    needsCustomerInfo,
    needsDestination,
    customerInfoRegistered,
    DestinationRegistered,
    prerequisitesMet,
    setCustomerInfoRegistered,
    setDestinationRegistered,
    ProcessCodeItem,
  }
}

/**
 * 書類送付プロセス用のお客様情報入力フォーム
 */
const CustomerInfoForm = ({UcarData, onComplete}) => {
  const {UserRegisterBasicForm, userData} = useUserInfoRegister({UcarData})

  return (
    <div>
      <Text color="red">自動車税関連のお客様情報を登録してください。</Text>
      <UserRegisterBasicForm
        // alignMode={'col'}
        latestFormData={userData}
        onSubmit={async () => {
          const {result: updatedUcarData} = await doStandardPrisma(`ucar`, `update`, {
            where: {id: UcarData.id},
            data: userData,
          })
          toast.success(`お客様情報を更新しました。そのまま書類送付登録をしてください。`)
          onComplete()
        }}
      >
        <Button>お客様情報更新</Button>
      </UserRegisterBasicForm>
    </div>
  )
}

/**
 * CR着プロセス用の仕分け先入力フォーム
 */
const DestinationForm = ({UcarData, stores, onComplete}) => {
  const columns = new Fields([__shared_get_shiwakeKekkeCol()]).transposeColumns()
  const {BasicForm, latestFormData} = useBasicFormProps({
    columns,
    formData: {
      destination: UcarData.destination || '',
      runnable: UcarData.runnable || false,
      remarks: UcarData.remarks || '',
    },
  })

  return (
    <div>
      <Text color="red">仕分け先を入力してください。</Text>
      <BasicForm
        latestFormData={latestFormData}
        onSubmit={async data => {
          const {result: updatedUcarData} = await doStandardPrisma(`ucar`, `update`, {
            where: {id: UcarData.id},
            data: {
              destination: data.destination,
              runnable: data.runnable,
              remarks: data.remarks,
            },
          })
          toast.success(`仕分け先を更新しました。そのまま工程登録をしてください。`)

          onComplete()
        }}
      >
        <Button>仕分け先登録</Button>
      </BasicForm>
    </div>
  )
}

/**
 * 前提条件が満たされていない場合の警告メッセージ
 */
const PrerequisitesWarning = ({needsCustomerInfo, needsDestination}) => {
  if (!needsCustomerInfo && !needsDestination) return null

  let message = ''
  if (needsCustomerInfo && needsDestination) {
    message = 'お客様情報と仕分け先の入力後に工程登録が可能になります。'
  } else if (needsCustomerInfo) {
    message = 'お客様情報の入力後に工程登録が可能になります。'
  } else if (needsDestination) {
    message = '仕分け先の入力後に工程登録が可能になります。'
  }

  return (
    <div>
      <div className={`text-red-500 opacity-100 bg-red-100 border-red-500 border p-2 rounded `}>{message}</div>
    </div>
  )
}

/**
 * プロセス登録フォーム
 */
const ProcessRegistrationForm = ({
  ProcessRegisterForm,
  latestFormData,
  ProcessCodeItem,
  UcarData,
  session,
  toggleLoad,
  setopenClearnUp,
  disabled,
  formRef,
}) => {
  return (
    <div ref={formRef} className={cn(disabled ? 'pointer-events-none opacity-50' : '')}>
      <div>
        <Text color="red">工程を登録してください。</Text>
        <ProcessRegisterForm
          latestFormData={latestFormData}
          onSubmit={async data => {
            toggleLoad(async () => {
              const {Destination = '-', runnable = null, remarks = '-', ...rest} = data ?? {}
              if (ProcessCodeItem) {
                const postHandler = ProcessCodeItem?.postHandler

                const confirmMsg = postHandler?.buildConfirmMsg?.() ?? `工程を登録よろしてもよろしいですか？`

                if (!confirm(`${confirmMsg}`)) {
                  return
                }

                //posthandler込みで更新
                const res = await createProcessWithPostHandler({
                  session,
                  processCode: ProcessCodeItem?.code ?? '',
                  sateiID: UcarData.sateiID,
                })

                toastByResult(res)
                setopenClearnUp(true)
              }
            })
          }}
        >
          <Button>登録</Button>
        </ProcessRegisterForm>
      </div>
    </div>
  )
}

export const ProcessApplicationForm = ({columns, stores, UcarData, useGlobalProps, setopenClearnUp, processCode}) => {
  const {session, toggleLoad, addQuery, router} = useGlobalProps
  const {id: userId, storeId} = session ?? {}
  const ucarId = UcarData.id

  const processFormRef = useRef<HTMLDivElement | null>(null)
  const previousPrerequisitesMet = useRef(false)

  const {
    isCrChakuProcess,
    isPaperSendProcess,
    needsCustomerInfo,
    needsDestination,
    customerInfoRegistered,
    DestinationRegistered,
    prerequisitesMet,
    setCustomerInfoRegistered,
    setDestinationRegistered,
    ProcessCodeItem,
  } = useProcessPrerequisites({processCode, UcarData})

  const {BasicForm: ProcessRegisterForm, latestFormData} = useBasicFormProps({
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
      // 少し遅延を入れて、DOMの更新を待つ
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
      <C_Stack className={`mx-auto w-fit gap-10`}>
        {/* ステップ2: プロセス登録 */}

        {/* ステップ1: 前提条件の入力 */}
        {needsCustomerInfo ||
          (needsDestination && (
            <Card>
              {isPaperSendProcess && (
                <FitMargin>
                  <CustomerInfoForm UcarData={UcarData} onComplete={() => setCustomerInfoRegistered(true)} />
                </FitMargin>
              )}

              {isCrChakuProcess && (
                <FitMargin>
                  <DestinationForm UcarData={UcarData} stores={stores} onComplete={() => setDestinationRegistered(true)} />
                </FitMargin>
              )}
            </Card>
          ))}

        {!prerequisitesMet && <PrerequisitesWarning needsCustomerInfo={needsCustomerInfo} needsDestination={needsDestination} />}
        {(needsCustomerInfo || needsDestination) && (
          <Card>
            {needsCustomerInfo && (
              <FitMargin>
                <CustomerInfoForm UcarData={UcarData} onComplete={() => setCustomerInfoRegistered(true)} />
              </FitMargin>
            )}

            {needsDestination && (
              <FitMargin>
                <DestinationForm UcarData={UcarData} stores={stores} onComplete={() => setDestinationRegistered(true)} />
              </FitMargin>
            )}
          </Card>
        )}
        <Card>
          <SameProcessAlert {...{registerdProcess, processCode}}>
            <C_Stack className={`items-center`}>
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

const SameProcessAlert = ({children, registerdProcess, processCode}) => {
  if (registerdProcess) {
    const processCodeItem = UcarProcessCl.CODE.byCode(processCode)
    return (
      <div>
        <div className={`p-2 relative `}>
          <div>
            <Alert color="red">
              <C_Stack className={` items-center`}>
                <IconBtn color={processCodeItem?.color}>{processCodeItem?.label}</IconBtn>
                <span>はすでに</span>
                <IconBtn color="red" className="font-mono">
                  {formatDate(registerdProcess.date, 'YYYY-MM-DD(ddd) HH:mm')}
                </IconBtn>
                <div>に登録されています。</div>
              </C_Stack>
              {children}
            </Alert>
          </div>
        </div>
      </div>
    )
  } else {
    return children
  }
}
