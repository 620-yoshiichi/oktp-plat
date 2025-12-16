'use client'

import {CenterScreen} from '@cm/components/styles/common-components/common-components'
import {CssString} from '@cm/components/styles/cssString'
import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import {basePath, cl} from '@cm/lib/methods/common'
import React from 'react'
import {fetchAlt} from '@cm/lib/http/fetch-client'
import {toast} from 'react-toastify'

export default function Page() {
  const {toggleLoad} = useGlobal()

  const btnClass = cl(`  font-bold`)

  const actions = [
    {
      label: `顔ナビユーザー連携`,
      description: `顔ナビAPIを用いてユーザー情報を取得し、DBに保存する`,
      purpose: ``,
      onClick: {
        name: `kaonaviBatch`,
        main: async () => {
          const res = await fetchAlt(`/oktpCommon/api/seeder/kaonavi`, {})
          return res
        },
      },
    },
    {
      label: `注残データ作成`,
      description: `sheet API とBigQueryを用いてデータを更新`,
      purpose: ``,
      onClick: {
        name: `upsertNewCarOrders`,
        main: async () => {
          const res = await fetchAlt(`${basePath}/newCar/api/cron/orderUpsert`, {}, {method: 'GET'})
          return res
        },
      },
    },
    {
      label: `追工データ更新`,
      description: `BigQueryを用いてデータを更新`,
      purpose: ``,
      onClick: {
        name: `tenpoTsuikoUpsert`,
        main: async () => {
          const res = await fetchAlt(`${basePath}/newCar/api/cron/tenpoTsuikoUpsert`, {}, {method: 'GET'})
          return res
        },
      },
    },

    {
      label: `生産予定フェッチ`,
      description: ``,
      purpose: ``,
      onClick: {
        name: `fetchSeisanYoteiDiff`,
        main: async () => {
          const res = await fetchAlt(`${basePath}/newCar/api/cron/fetchSeisanYoteiDiff`, {}, {method: 'GET'})
          return res
        },
      },
    },
    {
      label: `生産予定通知`,
      description: ``,
      purpose: ``,
      onClick: {
        name: `notifySeisanYoteiDiff`,
        main: async () => {
          const res = await fetchAlt(`${basePath}/newCar/api/cron/notifySeisanYoteiDiff`, {}, {method: 'GET'})
          return res
        },
      },
    },
    {
      label: `日次集計`,
      description: ``,
      purpose: ``,
      onClick: {
        name: `aggregateProgress`,
        main: async () => {
          const res = await fetchAlt(`${basePath}/newCar/api/cron/aggregateProgress`, {}, {method: 'GET'})
          return res
        },
      },
    },
    {
      label: `稼働日カレンダー更新`,
      description: ``,
      purpose: ``,
      onClick: {
        name: `updateCalendar`,
        main: async () => {
          const res = await fetchAlt(`${basePath}/newCar/api/seed/calendar`, {})

          return res
        },
      },
    },
  ]
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
                        const res = await toggleLoad(async () => await action?.onClick?.main())
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
