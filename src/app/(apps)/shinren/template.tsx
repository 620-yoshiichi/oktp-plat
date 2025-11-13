'use client'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {Z_INDEX} from '@cm/lib/constants/constants'

import React from 'react'
import {RentaCustomDateSwithcer} from '@app/(apps)/shinren/AdminLayoutController/AdminLayoutController-methods'
import StuffSelector from '@app/(apps)/shinren/class/DetailPage/StuffSelector'
import {Paper} from '@cm/components/styles/common-components/paper'
import {Button} from '@cm/components/styles/common-components/Button'
import GlobalModal from '@cm/components/utils/modal/GlobalModal'
import {T_LINK} from '@cm/components/styles/common-components/links'
import {Center, C_Stack} from '@cm/components/styles/common-components/common-components'
import {cn} from '@cm/shadcn/lib/utils'

const ShinrenTemplate = (props: any) => {
  const origin = location.origin

  const useGlobalProps = useGlobal()
  const {query, pathname, accessScopes} = useGlobalProps
  const {admin} = accessScopes()

  const {data: RentaStore = []} = useDoStandardPrisma(
    `rentaStore`,
    'findMany',
    {
      select: {name: true, id: true, User: {select: {name: true, id: true}}},
    },
    {deps: [pathname, query]}
  )

  if (!RentaStore) return <PlaceHolder />
  let page = 'common'
  if (pathname.includes('/shinren/admin/calendar')) {
    page = 'calendar'
  }
  const allUsers = RentaStore.map(d => d.User).flat()

  if (!admin && origin.includes(`oktp-plat.vercel.app`)) {
    return (
      <Center>
        <C_Stack>
          <div>このURLは利用できません。</div>
          新しいアプリは<T_LINK href={`https://shinren-plat.vercel.app/shinren`}>こちら</T_LINK>からお使いください。
        </C_Stack>
      </Center>
    )
  }

  return (
    <div>
      <div className={`pb-10`}>{props.children}</div>
      <div className={` fixed  bottom-0 right-2 w-fit p-1`} style={{zIndex: Z_INDEX.thead}}>
        <GlobalModal {...{id: `stuffSelector`, alertOnClose: false, btnComponent: <Button>範囲設定</Button>}}>
          <Paper>
            <div
              className={cn(
                `col-stack   md:row-stack  mx-auto   flex-nowrap items-start justify-center  gap-2 p-1 pb-1 md:items-start `
              )}
            >
              <Paper>
                <StuffSelector {...{useGlobalProps, allUsers, RentaStore}} />
              </Paper>
              <Paper>
                <RentaCustomDateSwithcer pathname={pathname} />
              </Paper>
            </div>
          </Paper>
        </GlobalModal>
      </div>
    </div>
  )
}
export default ShinrenTemplate
