'use client'

import {PrismaModelNames} from '@cm/types/prisma-types'
import {Padding, R_Stack, C_Stack} from '@cm/components/styles/common-components/common-components'
import {CssString} from '@cm/components/styles/cssString'
import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {cl} from '@cm/lib/methods/common'
import {toast} from 'react-toastify'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import useSWR from 'swr'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'
import {getUcarActions, getNewCarActions, getQRBPActions, getCommonActions, BatchAction} from './batchActions'

export default function Page() {
  const {toggleLoad} = useGlobal()
  const limit = 5000
  const offset = 0

  const commonActions = getCommonActions()
  const ucarActions = getUcarActions(offset, limit)
  const newCarActions = getNewCarActions()
  const qrbpActions = getQRBPActions()

  // Ucarアプリのデータ件数取得
  const ucarKey = JSON.stringify(ucarActions)
  const {data: ucarCount} = useSWR(ucarKey, async () => {
    const countList = await Promise.all(
      ucarActions.map(async action => {
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

  const renderTable = (actions: BatchAction[], title: string, counts?: Record<string, number>) => {
    const hasEffectOn = actions.some(action => action.effectOn)

    return (
      <div>
        <h2 className={`text-xl font-bold mb-4`}>{title}</h2>
        <div className={``}>
          <table className={cl(paddingTd, borderCerlls, `max-w-[90vw]`)}>
            <thead>
              <tr>
                <th>バッチ処理</th>
                <th>詳細</th>
                <th>用途</th>
                {hasEffectOn && <th>種別</th>}
                <th></th>
              </tr>
            </thead>
            <tbody className={``}>
              {actions.map((action, idx) => {
                const count = counts?.[action.label]
                const handleClick = async () => {
                  const onClickFn = typeof action.onClick === 'function' ? action.onClick : action.onClick.main
                  const res = await toggleLoad(async () => await onClickFn())
                  if (res instanceof Error || res?.error || res?.success === false) {
                    const errorMessage = res?.message || res?.error?.message || res?.error || '不明なエラーが発生しました'
                    toast.error(`${action.label}の実行中にエラーが発生しました: ${errorMessage}`)
                  } else if (res?.success === true || res?.success === undefined) {
                    toast.success(`${action.label}が完了しました`)
                  }
                }

                return (
                  <tr key={idx} className={`  `}>
                    <td className={`min-w-[320px]`}>
                      <R_Stack className={` justify-between`}>
                        {action.label}
                        {count !== undefined && (
                          <span className={`text-sm text-blue-500 font-bold`}>{count.toLocaleString()}</span>
                        )}
                      </R_Stack>
                    </td>
                    <td>
                      <MarkDownDisplay>{action.description}</MarkDownDisplay>
                    </td>
                    <td>
                      <MarkDownDisplay>{action.purpose || ''}</MarkDownDisplay>
                    </td>
                    {hasEffectOn && <td className={`w-[80px] text-center`}>{action.effectOn || '-'}</td>}
                    <td>
                      <button className={`t-link w-[100px] text-2xl`} onClick={handleClick}>
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
  }

  const renderBatchTable = (actions: BatchAction[], appName: string, counts?: Record<string, number>) => {
    const batchActions = actions.filter(action => action.effectOn === 'batch')
    const clickActions = actions.filter(action => action.effectOn === 'click' || !action.effectOn)

    return (
      <C_Stack className={` gap-10`}>
        {batchActions.length > 0 && (
          <div>
            {renderTable(batchActions, 'バッチ実行処理', counts)}
            <small>*自動で実行される</small>
          </div>
        )}

        {clickActions.length > 0 && (
          <div>
            {renderTable(clickActions, 'クリック実行処理', counts)}
            <small>*初回のみ手動で実行</small>
          </div>
        )}
      </C_Stack>
    )
  }

  const tabComponents = [
    {
      label: '共通',
      component: <div>{renderBatchTable(commonActions, '共通')}</div>,
    },
    {
      label: 'Ucar',
      component: <div>{renderBatchTable(ucarActions, 'Ucar', ucarCount)}</div>,
    },
    {
      label: 'NewCar',
      component: <div>{renderBatchTable(newCarActions, 'NewCar')}</div>,
    },
    {
      label: 'QRBP',
      component: <div>{renderBatchTable(qrbpActions, 'QRBP')}</div>,
    },
  ]

  return (
    <Padding>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">バッチ処理管理</h1>
          <p className="text-gray-600">各アプリのバッチ処理を一覧で確認・実行できます</p>
        </div>

        <BasicTabs id="batch-tabs" TabComponentArray={tabComponents} headingText="アプリを選択" />
      </div>
    </Padding>
  )
}
