import {bigQuery__select} from '@app/api/google/big-query/bigQueryApi'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'

import prisma from 'src/lib/prisma'

import {NextRequest, NextResponse} from 'next/server'
import {isCron} from 'src/non-common/serverSideFunction'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {BQ_parser} from '@app/api/google/big-query/bigQueryParser'
import { ObjectMap} from '@cm/lib/methods/common'
import {Prisma} from '@prisma/generated/prisma/client'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'
import {UCAR_CONSTANTS} from '@app/(apps)/ucar/(constants)/ucar-constants'

// kobutsu = 古物台帳
// 古物台帳のデータを同期するためのAPI

export const GET = async (req: NextRequest) => {
  const shiireGroupUser = await prisma.user.findFirst({
    where: {code: UCAR_CONSTANTS.shiireGroupUserCode},
  })
  const result: any = {}
  if ((await isCron({req})) === false) {
    const res = {success: false, message: `Unauthorized`, result: null}
    const status = {status: 401, statusText: `Unauthorized`}
    return NextResponse.json(res, status)
  }

  const users = await prisma.user.findMany({where: {email: {not: null}}})

  const sqlString = sql`
  SELECT * FROM okayamatoyopet.Ucar_QR.QR_Prosess
  where email_0 not like '%ichiya%'  AND email_0 not like '%mutsuo%'
  `

  // if (!isDev) {
  //   //本番環境だとバッチが遅いので、新しいデータのみ
  //   sqlString += sql` ORDER BY max_update DESC LIMIT 3000`
  // }

  const body = await bigQuery__select({
    datasetId: 'Ucar_QR',
    tableId: 'AI_satei',
    sqlString,
  })

  await processBatchWithRetry({
    options: {batchSize: 1000, retries: 1},
    soruceList: body,
    mainProcess: async (batch: ucarProcessType[]) => {
      // データをクレンジング
      const cleansedData = batch.map(d => {
        return ObjectMap(d, (key, value) => {
          return BQ_parser.parseDate(value)
        }) as any
      })

      for (let i = 0; i < cleansedData.length; i++) {
        const d = cleansedData[i]
        {
          const {
            sateiId,
            Sorting_results,
            email_0,
            store_0,
            runnable_0,
            remarks_0,
            shitadoriKubun_0,
            orderNumber_0,
            max_update,
            ...rest
          } = d

          const runnableStr = UCAR_CODE.RUNNABLE.byCode(runnable_0)?.label
          const remarksStr = remarks_0 ?? ''

          // 発行時刻がなければ、最短の発行事項を表示
          let earliestDatetime: any = null
          if (!rest['datetime_0']) {
            earliestDatetime = Object.values(rest)
              .map(d => BQ_parser.parseDate(d))
              .filter(Boolean)
              .sort((a: any, b: any) => {
                return new Date(a).getTime() - new Date(b).getTime()
              })[0]
            if (!earliestDatetime) {
              console.log(`earliestDatetime is not found: ${sateiId}`)
            }
          }

          let processLastUpdatedAt = null

          const user = users.find(user => user.email === email_0)

          const userId = user?.id ?? shiireGroupUser?.id

          if (!userId) {
            console.log(`userId is not found: ${sateiId}`)
            return
          }

          const ucarCreatedAt = BQ_parser.parseDate(rest['datetime_0']) ?? earliestDatetime

          const restKeys = Object.keys(rest)

          await Promise.all(
            restKeys.map(async processKeyInBq => {
              if (processKeyInBq === `datetime_0`) {
                //Ucarデータ作成

                await prisma.ucar.upsert({
                  where: {sateiID: sateiId},
                  create: {
                    dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.BIG_QUERY_QR_PROCESS.code,
                    sateiID: sateiId,
                    userId,
                    storeId: user?.storeId,
                    qrIssuedAt: ucarCreatedAt,
                    createdAt: ucarCreatedAt,
                    runnable: runnableStr,
                    remarks: remarksStr,
                  },
                  update: {
                    userId,
                    storeId: user?.storeId,
                    qrIssuedAt: ucarCreatedAt,
                    createdAt: ucarCreatedAt,
                    dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.BIG_QUERY_QR_PROCESS.code,
                    runnable: runnableStr,
                    remarks: remarksStr,
                  },
                })
              }

              ///プロセスデータの作成
              const processCodeItem = UcarProcessCl.CODE.getBy('bqFieldName', processKeyInBq)

              if (processCodeItem?.code) {
                const datetime = BQ_parser.parseDate(rest[processKeyInBq])

                if (!datetime) {
                  return null
                }

                const unique_sateiID_date_processCode: Prisma.UcarProcessWhereUniqueInput['unique_sateiID_date_processCode'] = {
                  sateiID: sateiId,
                  processCode: processCodeItem.code,
                  date: datetime,
                }

                const payload: Prisma.UcarProcessUpsertArgs['create'] = {
                  ...unique_sateiID_date_processCode,
                  dataSource: UCAR_CODE.UCAR_DATA_SOURCE.raw.BIG_QUERY_QR_PROCESS.code,
                  userId: userId,
                  processCode: processCodeItem.code,
                }

                //プロセスデータ作成
                await prisma.ucarProcess.upsert({
                  where: {unique_sateiID_date_processCode},
                  create: payload,
                  update: payload,
                })

                if (processLastUpdatedAt === null || new Date(processLastUpdatedAt).getTime() < datetime.getTime()) {
                  processLastUpdatedAt = datetime
                }
              }
            })
          )

          //Ucarデータ更新
          await prisma.ucar.update({
            where: {sateiID: sateiId},
            data: {processLastUpdatedAt: processLastUpdatedAt},
          })
        }
      }
    },
  })

  return NextResponse.json({})
}
