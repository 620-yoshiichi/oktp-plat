'use client'

import {CenterScreen} from '@cm/components/styles/common-components/common-components'
import {CssString} from '@cm/components/styles/cssString'
import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import {cl} from '@cm/lib/methods/common'
import React from 'react'
import {toast} from 'react-toastify'
import {getNewCarActions} from '@app/(apps)/common/admin/batch/batchActions'

export default function Page() {
  const {toggleLoad} = useGlobal()

  const btnClass = cl(`  font-bold`)

  const actions = getNewCarActions()
  const {paddingTd, borderCerlls} = CssString.table
  return (
    <CenterScreen>
      <div className={`t-paper `}>
        <table className={cl(paddingTd, borderCerlls, `w-[1000px]`)}>
          <thead>
            <tr>
              <th>バッチ処理</th>
              <th>詳細</th>
              <th>用途</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {actions.map((action, idx) => {
              return (
                <tr key={idx} className={`  `}>
                  <td className={btnClass}>{action.label}</td>
                  <td className={``}>
                    <MarkDownDisplay>{action.description}</MarkDownDisplay>
                  </td>
                  <td className={``}>
                    <MarkDownDisplay>{action.purpose}</MarkDownDisplay>
                  </td>
                  <td>
                    <button
                      className={`t-link w-[100px] text-2xl`}
                      onClick={async () => {
                        const onClickFn = typeof action.onClick === 'function' ? action.onClick : action.onClick.main
                        const res = await toggleLoad(async () => await onClickFn())
                        console.info(res)
                        if (res instanceof Error || res?.error || res?.success === false) {
                          const errorMessage = res?.message || res?.error?.message || res?.error || '不明なエラーが発生しました'
                          toast.error(`${action.label}の実行中にエラーが発生しました: ${errorMessage}`)
                        } else if (res?.success === true) {
                          toast.success(`${action.label}が完了しました`)
                        }
                      }}
                    >
                      実行
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </CenterScreen>
  )
}
