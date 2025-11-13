import {BQ} from '@app/api/google/big-query/BigQuery'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import {useRawSql} from '@cm/class/SqlBuilder/useRawSql'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {NextRequest, NextResponse} from 'next/server'
import {JP_TABLE_NAME, UCAR_TABLES} from '@app/(apps)/ucar/(constants)/UCAR_TABLES'
import {isCron} from 'src/non-common/serverSideFunction'
import {PrismaModelNames} from '@cm/types/prisma-types'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {BQ_parser} from '@app/api/google/big-query/bigQueryParser'

// kobutsu = 古物台帳
// 古物台帳のデータを同期するためのAPI

export const GET = async (req: NextRequest) => {
  if ((await isCron({req})) === false) {
    const res = {success: false, message: `Unauthorized`, result: null}
    const status = {status: 401, statusText: `Unauthorized`}
    return NextResponse.json(res, status)
  }
  const result = {}

  const targetTasbles: JP_TABLE_NAME[] = [
    //
    '古物台帳DB',
    '在庫情報DB',
    // // 'AI査定',
    // 'QRプロセス',
  ]

  for (let i = 0; i < targetTasbles.length; i++) {
    const table = targetTasbles[i]

    const TableInfo = UCAR_TABLES.find(t => t.jpName === table)
    if (!TableInfo) {
      continue
    }
    const {enName, jpName, datasetId, uniqueKeyToUpsert, fields, whereStr} = TableInfo
    const BQ_TABLE = new BQ({datasetId: datasetId, tableId: enName})
    console.log({enName})

    try {
      await useRawSql({sql: sql`delete from "${enName}" `})
    } catch (error) {
      console.error(error.stack) //////////
    }

    const concatKey = uniqueKeyToUpsert.data
      // .map(d => d + `, '_' `)
      .join(`,`)

    // return
    const data = await BQ_TABLE.GET({
      sqlString: sql`
          with PartionByRowNumber as (
            select
              concat(${concatKey}) as combinedKey,
              row_number() over (partition by concat(${concatKey})
                 ${uniqueKeyToUpsert.orderBy ? `order by ${uniqueKeyToUpsert.orderBy} desc` : ''})
              as rn,
              *
            from okayamatoyopet.${datasetId}.${enName}
          )

          select * from  PartionByRowNumber
          where PartionByRowNumber.rn = 1
          `,
    })

    const transactionQueryList: transactionQuery[] = data.map(data => {
      Object.keys(data).forEach(key => {
        const isInField = fields.some(f => f.en === key)
        delete data['combinedKey']
        delete data['rn']

        // 査定データを作る
        if (enName === `AI_satei`) {
          const barrackSplit = data['Barracks'].split(`-`)
          data['NO_FRAME'] = barrackSplit?.[1] ?? data['Barracks']
        }

        if (!isInField) {
          delete data[key]
        }

        if (enName === `QR_Prosess`) {
          data[key] = BQ_parser.parseDate(data[key])
        }
      })

      return {
        model: enName as PrismaModelNames,
        method: `create`,
        queryObject: {
          data: data,
        },
      }
    })

    await processBatchWithRetry({
      mainProcess: async batch => {
        const res = await doTransaction({transactionQueryList: batch})
        return res
      },
      soruceList: transactionQueryList,
      options: {batchSize: 1000, retries: 1},
    })
  }

  return NextResponse.json(result)
}
