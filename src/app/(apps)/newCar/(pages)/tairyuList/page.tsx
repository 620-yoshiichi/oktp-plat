'use client'
import {NEW_CAR_CONST} from '@app/(apps)/newCar/(constants)/newCar-constants'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Fields} from '@cm/class/Fields/Fields'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, FitMargin, R_Stack} from '@cm/components/styles/common-components/common-components'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {differenceInDays} from 'date-fns'
import React, {useState} from 'react'
import useSWR from 'swr'

const mode = {
  1: [
    {label: '振当', col: 'DD_FR', bool: true},
    {label: '配送希望', col: 'DD_HAISKIBO', bool: false},
  ],
  2: [
    {label: '振当', col: 'DD_FR', bool: true},
    {label: '登録', col: 'DD_TOUROKU', bool: true},
    {label: '配送希望', col: 'DD_HAISKIBO', bool: false},
  ],
  3: [
    {label: '振当', col: 'DD_FR', bool: true},
    {label: '登録', col: 'DD_TOUROKU', bool: false},
    {label: '配送希望', col: 'DD_HAISKIBO', bool: false},
  ],
  4: [
    {label: '振当', col: 'DD_FR', bool: true},
    {label: '登録', col: 'DD_TOUROKU', bool: false},
    {label: '配送希望', col: 'DD_HAISKIBO', bool: true},
  ],
  5: [
    {label: '振当', col: 'DD_FR', bool: true},
    {label: '登録', col: 'DD_TOUROKU', bool: true},
    {label: '配送希望', col: 'DD_HAISKIBO', bool: true},
    {label: '納車日', col: 'DD_NOSYA', bool: true},
  ],
  6: [
    {label: '振当', col: 'DD_FR', bool: true},
    {label: '登録', col: 'DD_TOUROKU', bool: true},
    {label: '配送希望', col: 'DD_HAISKIBO', bool: true},
    {label: '納車日', col: 'DD_NOSYA', bool: false},
  ],
}

const options = Object.keys(mode).map(key => {
  const array = mode[key]
  const name = array.map(op2 => op2.label + (op2.bool ? `(◎)` : `(×)`)).join(` & `)

  return {
    id: key,
    name: name,
    label: name,
    value: key,
  }
})

export default function TairyuList() {
  const {query, addQuery} = useGlobal()
  const conditionNumber = query.conditionNumber
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 100

  const {data, isValidating} = useSWR(JSON.stringify(conditionNumber ?? ''), async () => {
    const selectedMode = mode[conditionNumber]

    if (selectedMode) {
      const where = {
        ...NEW_CAR_CONST.NEW_CAR.WHERE.COMMON_WHERE,
      }
      selectedMode.forEach(op => {
        if (op.bool) {
          where[op.col] = {
            not: null,
          }
        } else {
          where[op.col] = null
        }
      })

      const {result} = await doStandardPrisma(`newCar`, `findMany`, {
        where,
        include: {
          Store: {},
          User: {},
        },
        orderBy: {DD_FR: 'asc'},
      })

      return result
    } else {
      return []
    }
  })

  const selectedModeName = options.find(op => op.value === conditionNumber)?.name

  const {BasicForm, latestFormData} = useBasicFormProps({
    formData: query,
    columns: new Fields([
      //
      {
        id: `conditionNumber`,
        label: `抽出条件`,
        forSelect: {
          optionsOrOptionFetcher: options,
          option: {
            style: {width: 320},
          },
        },
        form: {
          defaultValue: query.conditionNumber,
          style: {width: 320},
        },
      },
    ]).transposeColumns(),
  })

  if (!data) {
    return <PlaceHolder />
  }

  // ページネーション用の計算
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, data.length)
  const currentData = data.slice(startIndex, endIndex)

  const handlePageChange = page => {
    setCurrentPage(page)
  }

  const TABLE =
    data.length > 0
      ? CsvTable({
          csvOutput: {
            fileTitle: `滞留リスト_${selectedModeName}`,
            dataArranger: async props => {
              const records = data.map(item => {
                return {
                  注文No: item.NO_CYUMON,
                  店舗: item.Store.name,
                  担当スタッフ: item.User.name,
                  買主名: item.KJ_KAINMEI1,
                  名義人名: item.KJ_MEIGIME1,
                  車名: item.KJ_KURUMAME,
                  振当: formatDate(item.DD_FR),
                  登録見込月: formatDate(item.m1_toroku_prediction, 'YYYY-MM'),
                  登録予定日: formatDate(item.lastApprovedDesiredTorokuDate),
                  登録: formatDate(item.DD_TOUROKU),
                  配送希望: formatDate(item.DD_HAISKIBO),
                  納車日: formatDate(item.DD_NOSYA),
                  振当からの経過日: differenceInDays(new Date(), item.DD_FR),
                }
              })
              return records
            },
          },
          records: currentData.map(item => {
            {
              return {
                csvTableRow: [
                  {
                    label: `注文No`,
                    cellValue: item.NO_CYUMON,
                    style: {width: 120},
                  },
                  {
                    label: `店舗`,
                    cellValue: item.Store.name,
                    style: {width: 120},
                  },
                  {
                    label: `担当スタッフ`,
                    cellValue: item.User.name,
                    style: {width: 120},
                  },
                  {
                    label: `買主名`,
                    cellValue: item.KJ_KAINMEI1,
                    style: {width: 180},
                  },
                  {
                    label: `名義人名`,
                    cellValue: item.KJ_MEIGIME1,
                    style: {width: 180},
                  },

                  {
                    label: `車名`,
                    cellValue: item.KJ_KURUMAME,
                    style: {width: 180},
                  },

                  {
                    label: `振当`,
                    cellValue: formatDate(item.DD_FR, 'short'),
                    style: {width: 110},
                  },
                  {
                    label: `登録見込月`,
                    cellValue: formatDate(item.m1_toroku_prediction, 'YYYY-MM'),
                    style: {width: 110},
                  },
                  {
                    label: `登録予定日`,
                    cellValue: formatDate(item.lastApprovedDesiredTorokuDate, 'short'),
                    style: {width: 110},
                  },
                  {
                    label: `登録`,
                    cellValue: formatDate(item.DD_TOUROKU, 'short'),
                    style: {width: 110},
                  },
                  {
                    label: `配送希望`,
                    cellValue: formatDate(item.DD_HAISKIBO, 'short'),
                    style: {width: 110},
                  },
                  {
                    label: `納車日`,
                    cellValue: formatDate(item.DD_NOSYA, 'short'),
                    style: {width: 110},
                  },
                  {
                    label: `振当からの経過日`,
                    cellValue: differenceInDays(new Date(), item.DD_FR),
                    style: {width: 80},
                  },
                ],
              }
            }
          }),
        })
      : null

  // ページネーションコンポーネント
  const Pagination = () => {
    return (
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          最初
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          前へ
        </button>
        <span className="mx-2">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          次へ
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          最後
        </button>
      </div>
    )
  }

  return (
    <FitMargin className={` p-4`}>
      <C_Stack>
        <section>
          <BasicForm
            {...{
              alignMode: `row`,
              latestFormData,
              onSubmit: async data => addQuery(data),
            }}
          >
            <Button>更新</Button>
          </BasicForm>
        </section>

        {TABLE && (
          <section>
            <C_Stack>
              <R_Stack>
                <div>
                  {data?.length}件（{startIndex + 1}〜{endIndex}件表示）
                </div>
                <TABLE.Downloader />
              </R_Stack>
              <TABLE.WithWrapper {...{className: 'max-h-[80vh] max-w-[95vw]'}} />
              <Pagination />
            </C_Stack>
          </section>
        )}
      </C_Stack>
    </FitMargin>
  )
}
