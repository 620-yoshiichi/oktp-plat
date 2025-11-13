'use client'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'

import {useGlobalPropType} from '@cm/hooks/globalHooks/useGlobal'

import {cl, shorten} from '@cm/lib/methods/common'

import React from 'react'
import {JoinedQuery} from '@cm/class/JoinedQuery'
const btnClass = cl('text-responsive leading-4 ', 'w-[50px]   lg:w-[65px] xl:w-[90px]').toString()

const StuffSelector = React.memo((props: {useGlobalProps: useGlobalPropType; allUsers; RentaStore}) => {
  const {useGlobalProps, RentaStore} = props
  const {addQuery, query, pathname} = useGlobalProps
  const allowSelectMany = [].some(path => pathname.includes(path)) ? false : true

  const UserJQ = new JoinedQuery({
    query,
    queryKey: `g_userIdArr`,
    modelDataArr: RentaStore.map(d => d.User).flat(),
    uniqueKeyOnModel: `id`,
    type: `add`,
  })

  if (!RentaStore) return <PlaceHolder />

  return (
    <div className={` max-h-[50vh] overflow-y-auto `}>
      <C_Stack className={`flex-wrap `}>
        {RentaStore.map(store => {
          const stuffOnStore = store.User

          const allGlobalUserQueryArr = UserJQ.extract().array().current

          const storeUserQueryArr = stuffOnStore?.map(d => String(d.id))

          const StoreMemberIsAllSelected = storeUserQueryArr.every(d => allGlobalUserQueryArr.includes(d))

          const activateAllStoreStuff = () => {
            if (StoreMemberIsAllSelected) {
              const removed = allGlobalUserQueryArr.filter(d => !storeUserQueryArr.includes(d))
              addQuery({g_userIdArr: removed.join(',')}, 'push')
            } else {
              const g_userIdArr = [...allGlobalUserQueryArr, ...storeUserQueryArr].sort((a, b) => a - b).join(',')
              addQuery({g_userIdArr}, 'push')
            }
          }

          return (
            <div key={store.id} className={` col-stack md:row-stack flex-nowrap items-start`}>
              {/* 拠点名 */}
              <Button
                color={`blue`}
                className={`w-full min-w-[60px] text-sm md:w-fit`}
                active={StoreMemberIsAllSelected}
                onClick={() => activateAllStoreStuff()}
              >
                {store.name.slice(0, 2)}
              </Button>

              {/* ユーザー */}
              <R_Stack className={``}>
                {stuffOnStore?.map((d, idx) => {
                  const isActive = UserJQ.checkIsActive({modelData: d})
                  const toQueryStr = UserJQ.buildQueryStr({modelData: d})

                  return (
                    <Button
                      onClick={() => {
                        if (allowSelectMany) {
                          addQuery({g_userIdArr: toQueryStr})
                        } else {
                          addQuery({g_userIdArr: d.id})
                        }
                      }}
                      key={idx}
                      className={cl(
                        'max-w-[55px] rounded  px-0.5 text-[11px]',
                        btnClass,
                        isActive ? 'bg-primary-main' : 'opacity-30'
                      )}
                    >
                      {shorten(d.name, 4, `..`)}
                    </Button>
                  )
                })}
              </R_Stack>
            </div>
          )
        })}
      </C_Stack>
    </div>
  )
})

export default StuffSelector
