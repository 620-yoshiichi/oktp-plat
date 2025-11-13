import {bigQuery__select} from '@app/api/google/big-query/bigQueryApi'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'

import prisma from 'src/lib/prisma'

import {NextRequest, NextResponse} from 'next/server'
import {isCron} from 'src/non-common/serverSideFunction'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {doTransactionUcarBaseList} from '@app/(apps)/ucar/(pages)/api/seeder/oldProcess/helper/upsertUcarBaseLIst'
import {BQ_parser} from '@app/api/google/big-query/bigQueryParser'
import {ObjectMap} from '@cm/lib/methods/common'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {Prisma} from '@prisma/client'

// kobutsu = 古物台帳
// 古物台帳のデータを同期するためのAPI

export const GET = async (req: NextRequest) => {
  const result: any = {}
  if ((await isCron({req})) === false) {
    const res = {success: false, message: `Unauthorized`, result: null}
    const status = {status: 401, statusText: `Unauthorized`}
    return NextResponse.json(res, status)
  }

  const body = await bigQuery__select({
    datasetId: 'Ucar_QR',
    tableId: 'AI_satei',
    sqlString: sql`SELECT * FROM okayamatoyopet.Ucar_QR.QR_Prosess`,
  })

  const adminUser = await prisma.user.findUnique({
    where: {email: `admin@gmail.com`},
  })

  const [users, processes] = await Promise.all([prisma.user.findMany(), prisma.ucarProcess.findMany()])

  await prisma.ucarProcess.deleteMany({where: {dataSource: `spreadsheet`}})

  await processBatchWithRetry({
    soruceList: body,
    mainProcess: async batch => {
      // データをクレンジング
      const cleansedData = batch.map(d => {
        return ObjectMap(d, (key, value) => {
          return BQ_parser.parseDate(value)
        }) as ucarProcessType
      })

      // 手始めにQRシート発行データのみを作成し、その他のプロセスのリストを作成する。
      const ucarBaseUpsertRes = await doTransactionUcarBaseList({
        cleansedData,
        users,
        adminUser,
        processes,
      })

      if (!ucarBaseUpsertRes.success) {
        throw new Error(`ucarBaseUpsertRes.success is false`)
      }

      const transactionQueryList: transactionQuery[] = []

      if (ucarBaseUpsertRes.result) {
        // シート発行以外のプロセスデータを作成する。
        ucarBaseUpsertRes.result.forEach(ucar => {
          const list = ucar.list
          list?.forEach(d => {
            const {theProcessMaster, date} = d ?? {}

            const ucarProcessCreateArgs: Prisma.UcarProcessCreateArgs = {
              data: {
                dataSource: `spreadsheet`,
                Ucar: {connect: {id: ucar?.id ?? 0}},
                User: {connect: {id: ucar?.userId ?? 0}},
                // Store: {connect: {id: ucar?.storeId ?? 0}},
                processCode: theProcessMaster.code,
                date: date,
              },
            }

            transactionQueryList.push({
              model: `ucarProcess`,
              method: `create`,
              queryObject: ucarProcessCreateArgs,
            })

            const lastUpdatedProcessMaster = list[list.length - 1]

            // let LastProcessData
            if (lastUpdatedProcessMaster?.theProcessMaster) {
              transactionQueryList.push({
                model: `ucar`,
                method: `update`,
                queryObject: {
                  where: {id: ucar?.id},
                  data: {
                    ucarLastProcessMasterId: lastUpdatedProcessMaster.theProcessMaster.id,
                  },
                },
              })
            }
          })
        })
      }

      const upsertRes = await doTransaction({
        transactionQueryList,
      })
    },
  })

  return NextResponse.json(result)
}
