'use client'
import { ReactNode } from 'react'
import { Alert } from '@cm/components/styles/common-components/Alert'
import { C_Stack } from '@cm/components/styles/common-components/common-components'
import { IconBtn } from '@cm/components/styles/common-components/IconBtn'
import { UcarProcessCl } from '@app/(apps)/ucar/class/UcarProcessCl'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

type Props = {
  children: ReactNode
  registerdProcess: any
  processCode: string
}

/**
 * 同じ工程が既に登録されている場合の警告表示
 */
export const SameProcessAlert = ({ children, registerdProcess, processCode }: Props) => {
  if (registerdProcess) {
    const processCodeItem = UcarProcessCl.CODE.byCode(processCode)
    return (
      <div>
        <div className="p-2 relative">
          <div>
            <Alert color="blue">
              <C_Stack className="items-center">
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
  }
  return <>{children}</>
}
