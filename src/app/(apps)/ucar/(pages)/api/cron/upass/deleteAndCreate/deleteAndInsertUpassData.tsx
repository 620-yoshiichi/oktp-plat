import {upassCols} from '@app/(apps)/ucar/files/upass/upass-columns'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {useRawSql} from '@cm/class/SqlBuilder/useRawSql'
import {bigQuery__select} from '@app/api/google/big-query/bigQueryApi'

// CSV行をパースする関数（クォートや改行を適切に処理）
const parseCSVLine = (line: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // エスケープされたダブルクォート（""）
        current += '"'
        i += 2
      } else {
        // クォートの開始または終了
        inQuotes = !inQuotes
        i++
      }
    } else if (char === ',' && !inQuotes) {
      // クォート外のカンマ（区切り文字）
      result.push(current)
      current = ''
      i++
    } else {
      current += char
      i++
    }
  }

  result.push(current)
  return result
}

export const deleteAndInsertUpassData = async () => {
  const body = await bigQuery__select({
    datasetId: 'Ucar_QR',
    tableId: 'UPASS_RAW',
    sqlString: sql`
    select * from okayamatoyopet.Ucar_QR.UPASS_RAW
    `,
  })

  // upassColsで定義されたヘッダーデータのみを取得し、{en: value}の形の配列に変換
  // importできないため、必要なデータをここで取得

  const necessaryDataList: any = body.map(row => {
    const obj = Object.fromEntries(
      upassCols.map((col, idx) => {
        // const colIndex = header.indexOf(col.jp)

        const value = String(row[col.jp])

        if (col.type === 'date') {
          return [col.en, value ? toUtc(formatDate(new Date(value), 'YYYY-MM-DD HH:mm:ss')) : null]
        }

        return [col.en, value]
      })
    )

    return obj
  })

  const dataSource = 'upass'
  await useRawSql({sql: sql`delete from "UPASS" where "dataSource" = '${dataSource}' `})

  const created = await doTransaction({
    transactionQueryList: necessaryDataList.map(item => {
      const sateiID = item.sateiID

      return {
        model: 'UPASS',
        method: 'create',
        queryObject: {
          data: {
            ...item,
            dataSource: dataSource,
            shitadoriRelationAssessmentNumber: item.palAssessmentNumber ? item.palAssessmentNumber : undefined,
          },
        },
      }
    }),
  })

  return {
    count: necessaryDataList.length,
  }
}
