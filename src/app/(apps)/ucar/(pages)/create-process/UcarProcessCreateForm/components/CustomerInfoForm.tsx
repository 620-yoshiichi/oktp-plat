'use client'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from '@cm/components/styles/common-components/Button'
import { Text } from '@cm/components/styles/common-components/Alert'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import useUserInfoRegister from '../UserInfoRegister'

/**
 * 登録済みお客様情報の表示
 */
const RegisteredCustomerInfoDisplay = ({ UcarData }) => {
  return (
    <div className="bg-green-50 border border-green-300 rounded p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-green-600 text-lg">✓</span>
        <span className="font-bold text-green-700">登録済み</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">お客様名:</span>
          <span className="ml-2 font-medium">{UcarData.taxCustomerName || '-'}</span>
        </div>
        <div>
          <span className="text-gray-500">口座名義:</span>
          <span className="ml-2 font-medium">{UcarData.accountNameKana || '-'}</span>
        </div>
      </div>
    </div>
  )
}

type Props = {
  UcarData: any
  isRegistered: boolean
  onComplete: () => void
}

/**
 * 書類送付プロセス用のお客様情報入力フォーム
 */
export const CustomerInfoForm = ({ UcarData, isRegistered, onComplete }: Props) => {
  const { UserRegisterBasicForm, userData } = useUserInfoRegister({ UcarData })
  const [isEditing, setIsEditing] = useState(!isRegistered)

  return (
    <div>
      {isRegistered ? (
        <>
          <RegisteredCustomerInfoDisplay UcarData={UcarData} />
          {!isEditing && (
            <Button color="gray" onClick={() => setIsEditing(true)}>
              内容を変更する
            </Button>
          )}
        </>
      ) : (
        <Text color="red">自動車税関連のお客様情報を登録してください。</Text>
      )}

      {(isEditing || !isRegistered) && (
        <UserRegisterBasicForm
          latestFormData={userData}
          onSubmit={async () => {
            await doStandardPrisma(`ucar`, `update`, {
              where: { id: UcarData.id },
              data: userData,
            })
            toast.success(`お客様情報を更新しました。そのまま書類送付登録をしてください。`)
            setIsEditing(false)
            onComplete()
          }}
        >
          <Button>{isRegistered ? 'お客様情報を変更' : 'お客様情報を登録'}</Button>
        </UserRegisterBasicForm>
      )}
    </div>
  )
}
