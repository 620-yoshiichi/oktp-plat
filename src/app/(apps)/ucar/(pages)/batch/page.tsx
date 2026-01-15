'use client'
import {Fields} from '@cm/class/Fields/Fields'
import {PrismaModelNames} from '@cm/types/prisma-types'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, Padding, R_Stack} from '@cm/components/styles/common-components/common-components'
import {CssString} from '@cm/components/styles/cssString'
import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {cl} from '@cm/lib/methods/common'
import {toast} from 'react-toastify'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import React from 'react'
import useSWR from 'swr'
import {getUcarActions} from '@app/(apps)/common/admin/batch/batchActions'

const getActions = (offset: number, limit: number) => getUcarActions(offset, limit)

export default function Page() {
  const {toggleLoad, query, addQuery} = useGlobal()
  const {BasicForm, latestFormData} = useBasicFormProps({
    formData: query,
    columns: new Fields([]).transposeColumns(),
  })
  const limit = Number(query.limit ?? 5000)
  const offset = Number(query.offset ?? 0)

  const actions = getActions(offset, limit)
  const key = JSON.stringify(actions)

  const {data: count} = useSWR(key, async () => {
    // const res = await fetchAlt(`${basePath}/ucar/api/cron/count`, {})
    const countList = await Promise.all(
      actions.map(async action => {
        if (action.tableName) {
          const args = action.prismaArgs as any
          const res = await doStandardPrisma(action.tableName as PrismaModelNames, 'count', args as never)

          return {
            name: action.label,
            count: res.result,
          }
        }
      })
    )
    return Object.fromEntries(countList.filter(d => d !== undefined).map(d => [d.name, d.count]))
  })

  const {paddingTd, borderCerlls} = CssString.table

  // effectOnごとにアクションをグループ化
  const clickActions = actions.filter(action => action.effectOn === 'click')
  const batchActions = actions.filter(action => action.effectOn === 'batch')

  const renderTable = (actions: any, title: string) => (
    <div>
      <h2 className={`text-xl font-bold mb-4`}>{title}</h2>
      <div className={``}>
        <table className={cl(paddingTd, borderCerlls, `max-w-[90vw]`)}>
          <thead>
            <tr>
              <th>バッチ処理</th>
              <th>詳細</th>
              <th>用途</th>
              <th>種別</th>
              <th></th>
            </tr>
          </thead>
          <tbody className={``}>
            {actions.map((action, idx) => {
              return (
                <tr key={idx} className={`  `}>
                  <td className={`min-w-[320px]`}>
                    <R_Stack className={` justify-between`}>
                      {action.label}
                      {action.tableName && <span className={`text-sm text-blue-500 font-bold`}>{count?.[action.label]}</span>}
                    </R_Stack>
                  </td>
                  <td>
                    <MarkDownDisplay>{action.description}</MarkDownDisplay>
                  </td>
                  <td>
                    <MarkDownDisplay>{action.purpose}</MarkDownDisplay>
                  </td>
                  <td className={`w-[80px] text-center`}>{action.effectOn}</td>
                  <td>
                    <button
                      className={`t-link w-[100px] text-2xl`}
                      onClick={async () => {
                        const onClickFn = typeof action.onClick === 'function' ? action.onClick : action.onClick.main
                        const res = await toggleLoad(async () => await onClickFn())
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
    </div>
  )

  return (
    <Padding>
      <div>
        <BasicForm
          {...{
            latestFormData,
            alignMode: `row`,
            onSubmit: data => addQuery(data),
          }}
        >
          <Button>確定</Button>
        </BasicForm>
        <C_Stack className={` gap-10`}>
          <div>
            {renderTable(batchActions, 'バッチ実行処理')}
            <small>*自動で実行される</small>
          </div>

          <div>
            {renderTable(clickActions, 'クリック実行処理')}
            <small>*初回のみ手動で実行</small>
          </div>
        </C_Stack>
      </div>
    </Padding>
  )
}
