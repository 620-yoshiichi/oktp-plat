'use client'

import { C_Stack } from '@cm/components/styles/common-components/common-components'
import { Paper } from '@cm/components/styles/common-components/paper'
import { cl } from '@cm/lib/methods/common'
import { Button } from '@cm/components/styles/common-components/Button'

import React, { Fragment } from 'react'

export const StoreSidebar = ({ stores, query, addQuery }) => {
  const activeStoreId = query.storeId

  return (
    <div className={`w-[180px] shrink-0`}>
      <div className={`col-stack gap-1`}>
        <div className={`text-xs font-bold text-red-600`}>店舗フィルタ</div>
        <small className={`text-[10px] text-gray-500`}>スタッフ別にレコードを表示</small>

        <C_Stack className={`gap-1`}>
          <button
            className={cl(
              `w-full rounded-lg p-1.5 text-left text-sm font-bold`,
              !activeStoreId ? `bg-primary-main text-white` : `bg-gray-200 opacity-70`
            )}
            onClick={() => addQuery({ storeId: undefined })}
          >
            All
          </button>

          {stores.map((store: any) => {
            const count = store.groupBy?._count ?? 0
            const active = activeStoreId === store.id.toString()

            return (
              <Fragment key={store.id}>
                <button
                  className={cl(
                    `flex w-full items-center justify-between rounded-lg text-sm`,
                    active ? `bg-gray-300 font-bold` : count > 0 ? `bg-gray-100` : `bg-gray-100 opacity-40`
                  )}
                  onClick={() => addQuery({ storeId: store.id })}
                >
                  <span className={`max-w-[120px] truncate p-1.5`}>{store.name}</span>
                  <span
                    className={cl(
                      `min-w-[28px] rounded-r-lg p-1.5 text-center text-xs`,
                      count > 0 ? `bg-primary-main text-white` : `bg-sub-main text-white opacity-30`
                    )}
                  >
                    {count}
                  </span>
                </button>
              </Fragment>
            )
          })}
        </C_Stack>

        {activeStoreId && (
          <Button color={`red`} onClick={() => addQuery({ storeId: undefined })}>
            <span className={`cursor-pointer text-xs`}>フィルタ解除</span>
          </Button>
        )}
      </div>
    </div>
  )
}
