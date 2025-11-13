'use client'
import useUserInfoRegister from '@app/(apps)/ucar/(pages)/create-process/UcarProcessCreateForm/UserInfoRegister'
import {ColBuilder} from '@app/(apps)/ucar/class/ColBuilder/ColBuilder'

import {createProcessWithPostHandler} from '@app/(apps)/ucar/(lib)/server-actions/Ucar-server-actions'
import {useState} from 'react'
import {toast} from 'react-toastify'
import {Absolute, C_Stack} from '@cm/components/styles/common-components/common-components'
import {Button} from '@cm/components/styles/common-components/Button'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Alert, Text} from '@cm/components/styles/common-components/Alert'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {cn} from '@cm/shadcn/lib/utils'

import {toastByResult} from '@cm/lib/ui/notifications'
export const ApplicationForm = ({stores, UcarData, useGlobalProps, setopenClearnUp, processCode}) => {
  const ProcessCodeItem = UcarProcessCl.CODE.byCode(processCode)

  const isPaperSendProcess = ProcessCodeItem?.code === UcarProcessCl.CODE.raw.STORE_SHORUI_SOUHU.code

  const customerInfoIsRegisterdDefautlValue = !isPaperSendProcess ? false : !UcarData.taxCustomerName

  const [customerInfoIsRegisterd, setcustomerInfoIsRegisterd] = useState(customerInfoIsRegisterdDefautlValue)
  const columns = ColBuilder.ucarProcess({
    useGlobalProps,
    ColBuilderExtraProps: {
      carId: UcarData.id,
      sateiID: UcarData.sateiID,
      storeId: UcarData.storeId,
      userId: UcarData.userId,

      stores,
    },
  })

  const {session, toggleLoad, addQuery, router} = useGlobalProps

  const {id: userId, storeId} = session ?? {}
  const ucarId = UcarData.id

  const {UserRegisterBasicForm, userData} = useUserInfoRegister({UcarData})
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

  return (
    <div>
      <C_Stack className={`mx-auto w-fit gap-10`}>
        {isPaperSendProcess && (
          <div>
            <div>
              <div className={`mx-auto mb-2 w-fit`}>
                <Text color={customerInfoIsRegisterd ? `red` : `blue`}>
                  {customerInfoIsRegisterd ? `自動車税関連のお客様情報を登録してください。` : `お客様情報は入力済みです`}
                </Text>

                <UserRegisterBasicForm
                  latestFormData={userData}
                  onSubmit={async () => {
                    const {result: updatedUcarData} = await doStandardPrisma(`ucar`, `update`, {
                      where: {id: UcarData.id},
                      data: userData,
                    })
                    if (updatedUcarData.taxCustomerName) {
                      toast.success(`お客様情報を登録しました。そのまま書類送付登録をしてください。`)
                      setcustomerInfoIsRegisterd(false)
                    } else {
                      toast.error(`登録に失敗しました`)
                    }
                  }}
                >
                  <Button>お客様情報更新</Button>
                </UserRegisterBasicForm>
              </div>
            </div>
          </div>
        )}

        <div className={'relative'}>
          <SameProcessAlert {...{registerdProcess, processCode}}>
            <div className={`  text-sub-main`}>
              {customerInfoIsRegisterd && (
                <Absolute>
                  <div className={`text-red-500 opacity-100 bg-red-100 border-red-500 border p-2 rounded`}>
                    お客様情報の入力後に工程登録が可能になります。
                  </div>
                </Absolute>
              )}
              <div className={cn(customerInfoIsRegisterd ? 'pointer-events-none opacity-50 ' : '')}>
                <div className={`mx-auto w-fit`}>
                  <ProcessRegisterForm
                    alignMode={'col'}
                    latestFormData={latestFormData}
                    onSubmit={async data => {
                      toggleLoad(async () => {
                        const {storeToPickUp = '-', runnable = null, remarks = '-', ...rest} = data ?? {}
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
            </div>
          </SameProcessAlert>
        </div>
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
