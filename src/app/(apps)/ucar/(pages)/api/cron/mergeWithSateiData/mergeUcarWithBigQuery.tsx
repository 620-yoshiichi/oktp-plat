'use server'

import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import {sateiTableCompartionCols} from '@app/(apps)/ucar/class/ColBuilder/AI_SATEI_COLS'

import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {fetchBigQuery} from '@app/api/google/big-query/BigQueryClientOperator'
import {DH__convertDataType} from '@cm/class/DataHandler/type-converter'

export const mergeUcarWithBigQuery = async ({ucars, today = getMidnight()}) => {
  const mergedRecords: any[] = []
  const AssessmentIds = ucars.filter(p => !p.sateiID.match(/[ぁ-んァ-ン一-龯]/)).map(p => p.sateiID)

  if (AssessmentIds.length === 0) {
    console.info(`更新するデータが見つかりません`)
    return {
      success: true,
      message: `更新するデータが見つかりません`,
      result: mergedRecords,
    }
  }

  // BQの査定データを取得
  const sqlString = sql`
SELECT ${sateiTableCompartionCols.map(d => `${d.bqKeys.proto}`).join(`, `)}
FROM okayamatoyopet.Ucar_QR.AI_satei
WHERE Assessment_ID IN (${AssessmentIds.map(d => `'${d}'`).join(`,`)})
`
  console.warn(`AI査定データを全件取得しています。SQLを調整してください。`)

  const allData = await fetchBigQuery({
    datasetId: 'Ucar_QR',
    tableId: 'AI_satei',
    method: `GET`,
    args: {
      sqlString,
    },
  })

  const transactionQueryList: transactionQuery<'ucar', 'update'>[] = []
  ucars.forEach(ucar => {
    const BQ_Car = allData.find(BQ_Data => BQ_Data.Assessment_ID === ucar.Assessment_ID)

    if (!BQ_Car) {
      transactionQueryList.push({
        model: `ucar`,
        method: `update`,
        queryObject: {
          where: {id: ucar.id},
          data: {sateiDataConfirmedAt: today},
        },
      })
      return
    }

    const data = Object.fromEntries(
      sateiTableCompartionCols.map(d => {
        const {
          bqKeys: {proto, upass},
        } = d
        let value = BQ_Car[proto] || BQ_Car[upass] || null
        value = DH__convertDataType(value, d.type)
        return [proto, value]
      })
    )

    mergedRecords.push(data)
    transactionQueryList.push({
      model: `ucar`,
      method: `update`,
      queryObject: {
        where: {id: ucar.id},
        data: {
          ...data,
          sateiDataConfirmedAt: today,
        },
      },
    })
  })

  const res = await doTransaction({transactionQueryList})
  console.debug(`${res.result.length}件のデータを更新しました。`)
  return {...res, result: mergedRecords}
}
