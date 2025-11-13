'use client'
import {Alert} from '@cm/components/styles/common-components/Alert'
import {CenterScreen} from '@cm/components/styles/common-components/common-components'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {knockEmailApi} from '@cm/lib/methods/knockEmailApi'
import React from 'react'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'

export default function LoginCheckPage({searchParams: query}) {
  const {session, toggleLoad} = useGlobal()
  const {data: user = {}} = useDoStandardPrisma(`user`, `findUnique`, {where: {id: session.id}})

  const {loginCheck} = user ?? {}

  const color = loginCheck ? 'green' : 'red'
  const text = loginCheck ? 'ログインチェック完了' : 'ログイン報告'

  return (
    <CenterScreen>
      <button
        onClick={async () => {
          if (!loginCheck) {
            toggleLoad(async () => {
              await doStandardPrisma(`user`, `update`, {
                where: {id: session.id},
                data: {loginCheck: new Date()},
              })
              const subject = `${session?.name ?? ''}さんがログイン`
              await knockEmailApi({subject: subject, text: subject, to: [`mutsuo_yoshiichi@toch-holdings.com`]})
            })
          } else {
            alert('ログインチェック済みです')
          }
        }}
      >
        <Alert color={color}>{text}</Alert>
      </button>
    </CenterScreen>
  )
}
