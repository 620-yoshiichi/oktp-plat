import {upassCols} from '@app/(apps)/ucar/files/upass/upass-columns'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {useRawSql} from '@cm/class/SqlBuilder/useRawSql'
import * as fs from 'fs'
import * as path from 'path'

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
  const result: any = {}
  const getUpassCsv = async () => {
    // CSVファイルのパスを取得
    const csvPath = path.join(process.cwd(), 'src/app/(apps)/ucar/files/upass/upass-sample2.csv')

    // CSVファイルを読み込む
    const csvContent = fs.readFileSync(csvPath, 'utf-8')

    // 改行文字の統一（CRLF、CR → LF）
    const normalizedContent = csvContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

    // 行に分割してパース
    const rows: string[][] = []
    let currentLine = ''
    let inQuotes = false

    for (let i = 0; i < normalizedContent.length; i++) {
      const char = normalizedContent[i]
      const nextChar = normalizedContent[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentLine += '"'
          i++ // 次の文字をスキップ
        } else {
          inQuotes = !inQuotes
        }
        currentLine += char
      } else if (char === '\n' && !inQuotes) {
        // クォート外の改行（行の終了）
        if (currentLine.trim()) {
          rows.push(parseCSVLine(currentLine))
        }
        currentLine = ''
      } else {
        currentLine += char
      }
    }

    // 最後の行を処理
    if (currentLine.trim()) {
      rows.push(parseCSVLine(currentLine))
    }

    const header = rows[0]
    const body = rows.slice(1)
    return {header, body}
  }
  const {header, body} = await getUpassCsv()

  result.header = header
  result.body = body

  // upassColsで定義されたヘッダーデータのみを取得し、{en: value}の形の配列に変換
  // importできないため、必要なデータをここで取得

  const necessaryDataList: any = []

  body.forEach(row => {
    const obj = Object.fromEntries(
      upassCols.map((col, idx) => {
        const colIndex = header.indexOf(col.jp)
        const value = String(row[colIndex])

        if (col.type === 'date') {
          return [col.en, value ? toUtc(formatDate(new Date(value), 'YYYY-MM-DD HH:mm:ss')) : null]
        }

        return [col.en, value]
      })
    )

    necessaryDataList.push(obj)
  })

  result['necessaryDataList'] = necessaryDataList

  const dataSource = 'upass'
  await useRawSql({sql: sql`delete from "UPASS" where "dataSource" = '${dataSource}' `})

  const created = await doTransaction({
    transactionQueryList: necessaryDataList.map(item => {
      return {
        model: 'UPASS',
        method: 'create',
        queryObject: {
          data: {
            ...item,
            dataSource: dataSource,
          },
        },
      }
    }),
  })

  result['created'] = created
  return result
}
