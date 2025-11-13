'use client'

import {EditForm} from '@app/(apps)/newCar/(pages)/torokuList/TorokuListCC/EditForm'
import {Filter} from '@app/(apps)/newCar/(pages)/torokuList/TorokuListCC/Filter'
import Table from '@app/(apps)/newCar/(pages)/torokuList/TorokuListCC/Table'

import {arr__splitIntoGroups} from '@cm/class/ArrHandler/array-utils/basic-operations'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import {Button} from '@cm/components/styles/common-components/Button'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'

import {Paper} from '@cm/components/styles/common-components/paper'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {cl} from '@cm/lib/methods/common'

import React, {Fragment, useState} from 'react'

export default function TorokuListCC({cars, stores}) {
  const {toggleLoad, addQuery, query} = useGlobal()
  const [showEditor, setshowEditor] = useState<any | null>(null)

  const count = cars.length
  const storeGroups = arr__splitIntoGroups(stores, 4)

  return (
    <div className={`mx-auto max-w-[1300px]  `}>
      <ShadModal
        {...{
          open: !!showEditor,
          onOpenChange: setshowEditor,
        }}
      >
        <EditForm {...{application: showEditor?.application}} />
      </ShadModal>

      <C_Stack>
        <Paper className={` col-stack`}>
          <R_Stack>
            <div className={`font-bold text-red-700`}>
              <p>初期表示では、未承認の申請一覧が表示されています。</p>
            </div>
            <small>{count}台分のリストを表示</small>
          </R_Stack>

          <R_Stack>
            {[
              {label: '書類状況問わず', color: 'gray', value: undefined},
              {label: 'ai21書類未', color: 'red', value: '0'},
              {label: 'ai21書類完', color: 'blue', value: '1'},
            ].map((data, i) => {
              const active = query?.DD_HONBSYOK === data.value

              return (
                <IconBtn
                  key={i}
                  active={active}
                  color={data.color}
                  className={` onHover ${active ? '' : 'opacity-30'}`}
                  onClick={() => addQuery({DD_HONBSYOK: data.value})}
                >
                  {data.label}
                </IconBtn>
              )
            })}
          </R_Stack>

          <div>
            <R_Stack className={`items-start gap-0 text-sm`}>
              {storeGroups.map((stores, i) => {
                return (
                  <C_Stack key={i} className={`w-1/6  max-w-[180px]  truncate p-1`}>
                    {stores.map((store: any, j) => {
                      const groupBy = store.groupBy
                      const active = query?.storeId === store.id.toString()
                      return (
                        <Fragment key={j}>
                          <button {...{className: active ? `` : `opacity-50`}} onClick={() => addQuery({storeId: store.id})}>
                            <R_Stack className={` justify-between gap-0 rounded-lg   bg-gray-300 font-bold `}>
                              <span className={`max-w-[150px]  truncate p-1`}>{store.name}</span>
                              <span
                                className={cl(
                                  //
                                  groupBy?._count ? `bg-primary-main text-white` : `bg-sub-main text-white opacity-20`,
                                  `p-1 `
                                )}
                              >
                                {groupBy?._count ?? 0}
                              </span>
                            </R_Stack>
                          </button>
                        </Fragment>
                      )
                    })}
                  </C_Stack>
                )
              })}
            </R_Stack>
          </div>

          {(query.storeId || query.DD_HONBSYOK) && (
            <Button color={`red`} onClick={() => addQuery({storeId: undefined, DD_HONBSYOK: undefined})}>
              <span className={`   cursor-pointer`}>フィルタ選択解除</span>
            </Button>
          )}
        </Paper>

        <Paper>
          <R_Stack className={`flex-nowrap   items-start`}>
            <div>
              <Table {...{cars, setshowEditor}} />
            </div>
            <div>
              <Filter {...{query, addQuery}} />
            </div>
          </R_Stack>
        </Paper>
      </C_Stack>
    </div>
  )
}
