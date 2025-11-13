'use client'

import React, {useMemo} from 'react'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import ProcessInputer from '@app/(apps)/QRBP/components/QRBP/engineer/ProcessInputer'
import {useGlobalPropType} from '@cm/hooks/globalHooks/useGlobalOrigin'
import {C_Stack} from '@cm/components/styles/common-components/common-components'

import {WhoAreYou} from '@app/(apps)/QRBP/(public)/engineer/WhoAreYou'

export default function Base({serverFetchProps, initialModelRecords}) {
  const useGlobalProps: useGlobalPropType = useGlobal('engineer global props')
  const {addQuery, query} = useGlobalProps

  const MEMO_WhoAreYou = useMemo(() => <WhoAreYou {...{addQuery, query}} />, [addQuery, query])

  return (
    <div>
      <div>
        {query?.userId ? (
          <div>
            <ProcessInputer
              {...{
                serverFetchProps,
                initialModelRecords,
                MEMO_WhoAreYou,
                useGlobalProps,
              }}
            />
          </div>
        ) : (
          <>
            <C_Stack className={`items-center`}>
              <div>作業者を選択してください</div>
              <div>{MEMO_WhoAreYou}</div>
            </C_Stack>
          </>
        )}
      </div>
    </div>
  )
}
