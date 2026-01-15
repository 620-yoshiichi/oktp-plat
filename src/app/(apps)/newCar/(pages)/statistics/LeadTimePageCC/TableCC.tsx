'use client'
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'

import {Center, C_Stack} from '@cm/components/styles/common-components/common-components'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {Fields} from '@cm/class/Fields/Fields'

import {cl} from '@cm/lib/methods/common'
import {LeadTimeColumn, LeadTimeColumnList} from '@app/(apps)/newCar/(pages)/statistics/LeadTimePageCC/LeadTimeColumnsList'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {useLeadTimeUserModal} from '@app/(apps)/newCar/(pages)/statistics/LeadTimePageCC/useLeadTimeUserModal'
import {fetchRawSql} from '@cm/class/Fields/lib/methods'
import {CSVLink} from 'react-csv'

export const TableCC = (props: {SqlGetter; selectCols; LeadTimeColumnList: LeadTimeColumn[]; data; dataToCompare?: any}) => {
  const {SqlGetter, selectCols, LeadTimeColumnList, data, dataToCompare = []} = props

  const {setGMF_OPEN: setleadtimeTableUser} = useLeadTimeUserModal()

  // 様式B用のCSV出力
  const formatBLinkRef = useRef<any>(null)
  const [formatBCsvDataArr, setFormatBCsvDataArr] = useState<any[]>([])
  const [isLoadingFormatB, setIsLoadingFormatB] = useState(false)
  const formatBLinkId = useMemo(() => `csv-link-format-b-${Date.now()}`, [])

  const handleFormatBCsvExport = useCallback(async () => {
    setIsLoadingFormatB(true)
    try {
      // 全ユーザー分の詳細データを取得（additionalWherePhraseなし）
      const {leadTimeDetailSql} = SqlGetter({
        additionalWherePhrase: undefined,
      })

      const result = await fetchRawSql({sql: leadTimeDetailSql})
      const allData = result.rows ?? []

      // 店舗 > ユーザー順にソート
      const sortedData = [...allData].sort((a, b) => {
        const storeCompare = (a['storeName'] || '').localeCompare(b['storeName'] || '')
        if (storeCompare !== 0) return storeCompare
        return (a['userName'] || '').localeCompare(b['userName'] || '')
      })

      // モーダルの内容と同じ形式でCSVデータを整形
      const csvDataArray = sortedData.map(d => {
        const rowObj: any = {
          注文No: d['NO_CYUMON'] || '',
          買主名: d['KJ_KAINMEI1'] || '',
          名義人名: d['KJ_MEIGIME1'] || '',
          担当スタッフ: d['userName'] || '',
          車名: d['KJ_KURUMAME'] || '',
          納車日: formatDate(d['DD_NOSYA']) || '',
        }

        // LeadTimeColumnListの各カラムを追加
        LeadTimeColumnList.forEach(col => {
          rowObj[col.avgDataLabel] = d[col.avgDataKey] ?? ''
        })

        return rowObj
      })

      setFormatBCsvDataArr(csvDataArray)
    } catch (error) {
      console.error('様式B CSV出力エラー:', error)
      alert('CSV出力中にエラーが発生しました')
    } finally {
      setIsLoadingFormatB(false)
    }
  }, [SqlGetter])

  const outputFormatBCsv = useCallback(() => {
    if (formatBCsvDataArr.length > 0 && formatBLinkRef.current) {
      const link = document.getElementById(formatBLinkId)
      if (link) {
        link.click()
        alert('CSVファイルをダウンロードしました')
      }
    }
  }, [formatBCsvDataArr, formatBLinkId])

  useEffect(() => {
    if (formatBCsvDataArr.length > 0) {
      outputFormatBCsv()
    }
  }, [formatBCsvDataArr, outputFormatBCsv])

  const TB = CsvTable({
    ...{
      csvOutput: {fileTitle: `LeadTime.csv`},
      stylesInColumns: {},

      records: data.map(car => {
        const rowToCompare = dataToCompare?.find(carToCompare => carToCompare.recordName === car.recordName)
        const jpLabelObj = Object.fromEntries(
          LeadTimeColumnList.map(d => {
            return [d.avgDataKey, {value: car[d.avgDataKey], compare: rowToCompare?.[d.avgDataKey]}]
          })
        )

        const {userName} = car

        return {
          onClick: () => {
            const user = car
            setleadtimeTableUser({record: user, SqlGetter})
          },
          className: `hover:cursor-pointer hover:bg-yellow-200`,
          csvTableRow: [
            ...selectCols.map(col => {
              return {
                label: col.label,
                cellValue: car[col.key],
              }
            }),
            {label: `納車数`, cellValue: car.count},
            ...LeadTimeColumnList.map(d => {
              const {avgDataKey, avgDataLabel} = d
              const counterpart = jpLabelObj[avgDataKey].compare

              const diff = jpLabelObj[avgDataKey].value - counterpart

              const isLower = jpLabelObj[avgDataKey].value < counterpart
              const isHigher = jpLabelObj[avgDataKey].value > counterpart
              const isSame = jpLabelObj[avgDataKey].value === counterpart

              const textColor = isLower ? `text-blue-500` : isHigher ? `text-red-500` : `text-black`
              const plusMinus = isLower ? `▼` : isHigher ? `▲` : ``
              const compareValue = plusMinus + diff

              const value = jpLabelObj[avgDataKey].value

              return {
                label: avgDataLabel,
                style: {width: 100},
                cellValueRaw: value,
                cellValue:
                  value || value === 0 ? (
                    <C_Stack className={`justify-end gap-0.5  p-0.5 leading-4`}>
                      <div>
                        <div>{jpLabelObj[avgDataKey].value}</div>
                      </div>
                      <div>
                        {!isSame && counterpart && (
                          <div {...{className: cl(textColor, `text-xs leading-3`)}}>({compareValue})</div>
                        )}
                      </div>
                    </C_Stack>
                  ) : (
                    '-'
                  ),
              }
            }),
          ],
        }
      }),
    },
  })

  return (
    <Center>
      <C_Stack>
        <div className={` w-full justify-end flex gap-2`}>
          <TB.Downloader>{/* <button className={`t-link`}> CSV</button> */}</TB.Downloader>
          <div>
            <button
              onClick={handleFormatBCsvExport}
              className={`t-link`}
              type="button"
              disabled={isLoadingFormatB}
            >
              {isLoadingFormatB ? '読み込み中...' : 'CSV（様式B）'}
            </button>
            <CSVLink
              id={formatBLinkId}
              ref={formatBLinkRef}
              data={formatBCsvDataArr}
              filename="LeadTime_Detail.csv"
            />
          </div>
        </div>
        <TB.WithWrapper />
      </C_Stack>
    </Center>
  )
}

export const SelectorCC = ({
  formData,
  fromKey,
  toKey,
  // tableFilterQuery,settableFilter
}) => {
  const {addQuery, query} = useGlobal()

  const {BasicForm, latestFormData} = useBasicFormProps({
    onFormItemBlur: props => {
      addQuery({
        [fromKey]: formatDate(props.newlatestFormData[fromKey]),
        [toKey]: formatDate(props.newlatestFormData[toKey]),
      })
    },
    columns: new Fields([
      {id: fromKey, label: `開始`, type: `month`},
      {id: toKey, label: `終了`, type: `month`},
    ])
      .customAttributes(() => ({form: {}}))
      .transposeColumns(),
    formData: formData,
  })

  return (
    <BasicForm
      {...{
        latestFormData,
        ControlOptions: {ControlStyle: {width: 130, fontSize: 10}},
        alignMode: `row`,
      }}
    />
  )
}
