'use client'

import {ColBuilder} from '@app/(apps)/ucar/class/ColBuilder/ColBuilder'

import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import {limitEditting} from '@cm/constants/defaults'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {UcarProcessCreateForm} from '@app/(apps)/ucar/(pages)/create-process/UcarProcessCreateForm/UcarProcessCreateForm'
import {C_Stack, FitMargin, Padding} from '@cm/components/styles/common-components/common-components'

import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import AutoGridContainer from '@cm/components/utils/AutoGridContainer'
import {ucarData} from '@app/(apps)/ucar/class/UcarCL'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

const UcarProcessInputter = (props: {UcarData: ucarData}) => {
  const {UcarData} = props

  const useGlobalProps = useGlobal()

  const storeId = UcarData?.storeId

  const {accessScopes, query, toggleLoad, addQuery} = useGlobalProps
  const scopes = accessScopes()
  const processCode = query?.processCode

  const {mode} = query

  if (!UcarData) return <div></div>

  if (processCode || mode === 'create') {
    return <UcarProcessCreateForm {...{UcarData, useGlobalProps}}></UcarProcessCreateForm>
  } else {
    return (
      <FitMargin className={`p-4`}>
        <C_Stack>
          <strong>工程を選択してください</strong>
          <AutoGridContainer className={` gap-4`}>
            {UcarProcessCl.CODE.array
              .filter(item => item.list.includes('main'))
              .map(item => {
                const hasRegistered = UcarData?.UcarProcess?.find(p => p.processCode === item.code)
                const date = hasRegistered && hasRegistered?.date ? hasRegistered?.date : undefined
                return (
                  <button
                    className={hasRegistered ? '' : 'cursor-pointer'}
                    key={item.code}
                    onClick={() => {
                      if (hasRegistered) {
                        const message = ` [${item.label}]は[${formatDate(date, 'YYYY-MM-DD(ddd) HH:mm')}] に登録されています。`
                        alert(message)

                        return
                      }
                      addQuery({processCode: item.code})
                    }}
                  >
                    <IconBtn active={!!hasRegistered} className={`w-[120px] p-2`} color={item.color}>
                      <C_Stack className={`gap-0.5 leading-3`}>
                        {item.label}
                        <span className={`text-[10px]`}>{formatDate(date, 'YYYY-MM-DD(ddd)') ?? '(未登録)'}</span>
                      </C_Stack>
                    </IconBtn>
                  </button>
                )
              })}
          </AutoGridContainer>
        </C_Stack>
      </FitMargin>
    )
  }

  const columns = ColBuilder.ucarProcess({
    useGlobalProps,
    ColBuilderExtraProps: {
      carId: UcarData.id,
      sateiID: UcarData.sateiID,
      storeId,
      UcarData,
      processCode,
    },
  })

  return (
    <Padding>
      <FitMargin>
        <ChildCreator
          {...{
            columns,
            ParentData: UcarData,
            models: {parent: 'ucar', children: 'ucarProcess'},
            additional: {
              where: {
                sateiID: UcarData?.sateiID,
                ucarId: undefined,
              },
              include: {
                User: {},
                Ucar: {},
              },
            },

            useGlobalProps,
            ...limitEditting({exclusiveTo: scopes.admin}),
          }}
        />
      </FitMargin>
    </Padding>
  )
}

export default UcarProcessInputter
