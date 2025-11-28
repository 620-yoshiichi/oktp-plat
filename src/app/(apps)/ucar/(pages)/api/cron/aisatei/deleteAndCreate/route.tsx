import {sateiTableCompartionCols} from '@app/(apps)/ucar/class/ColBuilder/AI_SATEI_COLS'
import {upassCols} from '@app/(apps)/ucar/files/upass/upass-columns'

import {bigQuery__select} from '@app/api/google/big-query/bigQueryApi'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import prisma from 'src/lib/prisma'

import {NextRequest, NextResponse} from 'next/server'
import {isCron} from 'src/non-common/serverSideFunction'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {useRawSql} from '@cm/class/SqlBuilder/useRawSql'

// kobutsu = 古物台帳
// 古物台帳のデータを同期するためのAPI

export const GET = async (req: NextRequest) => {
  const result: any = {}
  if ((await isCron({req})) === false) {
    const res = {success: false, message: `Unauthorized`, result: null}
    const status = {status: 401, statusText: `Unauthorized`}
    return NextResponse.json(res, status)
  }

  const selectString = sateiTableCompartionCols.map(d => `${d.bqKeys.proto}`).join(`, `)

  const body = await bigQuery__select({
    datasetId: 'Ucar_QR',
    tableId: 'AI_satei',
    sqlString: sql`SELECT ${selectString} FROM okayamatoyopet.Ucar_QR.AI_satei
    -- ORDER BY Assessment_ID DESC LIMIT 1
    `,
  })

  result.BQ_DATA_RAW = body

  const aiSateiListToCreate: any[] = []
  const upassListToCreate: any[] = []

  body.forEach(row => {
    const aiSateiObj = {}
    const upassObj = {
      dataSource: 'aisatei',
    }

    sateiTableCompartionCols.map((col, idx) => {
      const aisateiColKey = col.bqKeys.proto
      const upassCol = upassCols.find(d => d.en === col.bqKeys.upass)

      let value = row[aisateiColKey]

      // if (col.bqKeys.upass === 'scheduledArrivalDate') {
      //   console.log({value})
      // }

      if (col.type === 'date') {
        value = value ? toUtc(formatDate(new Date(value), 'YYYY-MM-DD HH:mm:ss')) : null
      }

      aiSateiObj[col.bqKeys.proto] = value
      if (upassCol) {
        upassObj[upassCol.en] = value
      }
    })

    aiSateiListToCreate.push(aiSateiObj)
    upassListToCreate.push(upassObj)
  })

  result.aiSateiListToCreate = aiSateiListToCreate
  result.upassListToCreate = upassListToCreate

  //データの削除
  await useRawSql({sql: sql`delete from "UPASS" where "dataSource" = 'aisatei' `})

  //UPASSデータの作成
  await processBatchWithRetry({
    soruceList: upassListToCreate,
    mainProcess: async batch => {
      await prisma.uPASS.createMany({
        data: batch.map(d => ({
          ...d,
          shitadoriRelationAssessmentNumber: d.sateiID,
        })),
      })
    },
  })

  return NextResponse.json(result)
}
