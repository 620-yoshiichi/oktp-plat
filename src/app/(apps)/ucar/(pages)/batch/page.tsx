'use client'
import {Fields} from '@cm/class/Fields/Fields'
import {PrismaModelNames} from '@cm/types/prisma-types'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, Padding, R_Stack} from '@cm/components/styles/common-components/common-components'
import {CssString} from '@cm/components/styles/cssString'
import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {fetchAlt} from '@cm/lib/http/fetch-client'

import {basePath, cl} from '@cm/lib/methods/common'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import React from 'react'
import useSWR from 'swr'

const getActions = (offset: number, limit: number) => [
  {
    label: `古物 Rawデータ取り込み`,
    description: ` /api/cron/oldCars/deleteAndCreate`,
    effectOn: 'batch',
    purpose: ``,
    tableName: 'oldCars_Base',
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/cron/oldCars/deleteAndCreate`, {}, {method: `GET`})
      console.debug(res)
    },
  },
  {
    label: `在庫 Rawデータ取り込み`,
    description: ` /api/cron/zaiko/deleteAndCreate`,
    effectOn: 'batch',
    purpose: ``,
    tableName: 'zAIKO_Base',
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/cron/zaiko/deleteAndCreate`, {}, {method: `GET`})
      console.debug(res)
    },
  },
  {
    label: `AI査定 Rawデータ取り込み`,
    description: ` /api/cron/aisatei/deleteAndCreate`,
    effectOn: 'batch',
    purpose: ``,

    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/cron/aisatei/deleteAndCreate`, {}, {method: `GET`})

      console.debug(res)
    },
  },
  {
    label: `U-PASS Rawデータ取り込み`,
    description: ` /api/cron/upass/deleteAndCreate`,
    effectOn: 'batch',
    purpose: ``,
    tableName: 'uPASS',
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/cron/upass/deleteAndCreate`, {}, {method: `GET`})

      console.debug(res)
    },
  },
  {
    label: `受注下取りDB Rawデータ取り込み`,
    description: `/api/cron/juchuShitadoriDb/deleteAndCreate`,
    effectOn: 'batch',
    purpose: ``,
    tableName: 'juchuShitadoriDb',
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/cron/juchuShitadoriDb/deleteAndCreate`, {}, {method: `GET`})

      console.debug(res)
    },
  },

  // クリック実行処理

  {
    label: `1. UcarProcess 初期シーディング`,
    description: `/api/seeder/ucarProcess/deleteAndCreate`,
    effectOn: 'click',
    purpose: `BigQuery Ucar_QR.AI_satei テーブルからデータを取り込む。`,
    tableName: 'ucarProcess',
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/seeder/ucarProcess/deleteAndCreate`, {}, {method: `GET`})

      console.debug(res)
    },
  },

  {
    label: `2. UcarPaperデータ作成`,
    description: `/api/seeder/qrPaper`,
    effectOn: 'click',
    purpose: `QR PAPER(「新システム反映用」シート)よりデータを作成し、ucarテーブルに反映する。`,
    tableName: 'ucar',
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/seeder/qrPaper`, {})
      console.debug(res)
    },
  },
  {
    label: `3. 銀行データ作成`,
    description: `/api/seeder/bank`,
    effectOn: 'click',
    purpose: `bankMaster.csvから銀行データを作成する。`,
    tableName: 'bankMaster',
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/seeder/bank`, {})
      console.debug(res)
    },
  },
  {
    label: `4. 98データ作成`,
    description: `/api/seeder/num98`,
    effectOn: 'click',
    purpose: `ai21の98番号一覧データを作成する`,
    tableName: 'number98',
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/seeder/num98`, {})
      console.debug(res)
    },
  },

  {
    label: `5. 車庫データ作成`,
    description: `/api/seeder/garage`,
    effectOn: 'click',
    purpose: `QR PAPER「車庫空き状況」シートよりデータを作成し、反映する`,
    tableName: 'UcarGarageSlotMaster',
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/seeder/garage`, {})
      console.debug(res)
    },
  },
  {
    label: `6. 店長書類送信データ作成`,
    description: `/api/seeder/tenchoShoruiSakusei`,
    effectOn: 'click',
    purpose: ``,
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/seeder/tenchoShoruiSakusei`, {})
      console.debug(res)
    },
  },
  {
    label: `7. 仕分け結果`,
    description: `/api/seeder/shiwake`,
    effectOn: 'click',
    purpose: ``,
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/seeder/shiwake`, {})
      console.debug(res)
    },
  },
  {
    label: `8. 自動車税データ作成`,
    description: `/api/seeder/tax`,
    effectOn: 'click',
    purpose: ``,
    onClick: async () => {
      const res = await fetchAlt(`${basePath}/ucar/api/seeder/tax`, {})
      console.debug(res)
    },
  },
]

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
          const res = await doStandardPrisma(action.tableName as PrismaModelNames, 'count', {})

          return {
            name: action.tableName,
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
                  <td>
                    <R_Stack className={` justify-between`}>
                      {action.label}
                      {action.tableName && <span className={`text-sm text-blue-500 font-bold`}>{count?.[action.tableName]}</span>}
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
                        toggleLoad(async () => await action?.onClick?.())
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
