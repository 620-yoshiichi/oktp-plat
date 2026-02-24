'use client'

import { C_Stack } from '@cm/components/styles/common-components/common-components'
import { cl } from '@cm/lib/methods/common'
import { Button } from '@cm/components/styles/common-components/Button'

import React, { Fragment } from 'react'

const isInputComplete = (car: any) => !!car.furiate_chien_riyu || !!car.nouki_mishitei_riyu

export const StoreSidebar = ({ stores, allCars, query, addQuery, maxHeighClass }) => {
  const activeStoreId = query.storeId

  const allTotal = allCars.length
  const allComplete = allCars.filter(isInputComplete).length

  return (
    <div className={`w-[200px] shrink-0`}>
      <div className={`col-stack gap-1`}>
        <div className={`text-xs font-bold text-red-600`}>店舗フィルタ</div>
        <small className={`text-[10px] text-gray-500`}>スタッフ別にレコードを表示</small>

        <C_Stack className={`gap-2`}>
          <button
            className={cl(
              `flex w-full items-center justify-between rounded-lg text-sm font-bold`,
              !activeStoreId ? `bg-primary-main text-white` : `bg-gray-200 opacity-70`
            )}
            onClick={() => addQuery({ storeId: undefined })}
          >
            <span className={`p-1.5`}>All</span>
            <span className={`p-1.5 text-xs`}>
              {allComplete}/{allTotal}
            </span>
          </button>

          <C_Stack className={`${maxHeighClass}  gap-2`}>
            {stores.map((store: any) => {
              const storeCars = allCars.filter((c: any) => c.storeId === store.id)
              const total = storeCars.length
              const complete = storeCars.filter(isInputComplete).length
              const active = activeStoreId === store.id.toString()

              return (
                <Fragment key={store.id}>
                  <button
                    className={cl(
                      `flex w-full items-center justify-between rounded-lg text-sm`,
                      active ? `bg-gray-300 font-bold` : total > 0 ? `bg-gray-100` : `bg-gray-100 opacity-40`
                    )}
                    onClick={() => addQuery({ storeId: store.id })}
                  >
                    <span className={`max-w-[110px] truncate p-1.5`}>{store.name}</span>
                    <span
                      className={cl(
                        `min-w-[50px] rounded-r-lg p-1.5 text-center text-xs`,
                        total > 0 ? `bg-primary-main text-white` : `bg-sub-main text-white opacity-30`
                      )}
                    >
                      {complete}/{total}
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
        </C_Stack>
      </div>
    </div>
  )
}
