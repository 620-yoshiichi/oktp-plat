import {bigQuery__select} from '@app/api/google/big-query/bigQueryApi'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'

import prisma from 'src/lib/prisma'

import {NextRequest, NextResponse} from 'next/server'
import {isCron} from 'src/non-common/serverSideFunction'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {BQ_parser} from '@app/api/google/big-query/bigQueryParser'
import {ObjectMap} from '@cm/lib/methods/common'
import {Prisma} from '@prisma/client'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'

// kobutsu = 古物台帳
// 古物台帳のデータを同期するためのAPI

export const GET = async (req: NextRequest) => {
  const result: any = {}
  if ((await isCron({req})) === false) {
    const res = {success: false, message: `Unauthorized`, result: null}
    const status = {status: 401, statusText: `Unauthorized`}
    return NextResponse.json(res, status)
  }

  const [users] = await Promise.all([prisma.user.findMany()])

  await prisma.ucarProcess.deleteMany({
    where: {dataSource: `BigQuery`},
  })

  const body = await bigQuery__select({
    datasetId: 'Ucar_QR',
    tableId: 'AI_satei',
    sqlString: sql`
    SELECT * FROM okayamatoyopet.Ucar_QR.QR_Prosess
    where email_0 not like '%ichiya%'  AND email_0 not like '%mutsuo%'
    `,
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

          let processLastUpdatedAt = null

          const user = users.find(user => user.email === email_0)
          const userId = user?.id

          if (!userId) {
            console.log(`userId is not found: ${email_0}`)
            return
          }

          const ucarCreatedAt = BQ_parser.parseDate(d['datetime_0'])

          const restKeys = Object.keys(rest)

          await Promise.all(
            restKeys.map(async processKeyInBq => {
              if (processKeyInBq === `datetime_0`) {
                await prisma.ucar.upsert({
                  where: {
                    sateiID: sateiId,
                  },
                  create: {
                    dataSource: `BigQuery`,
                    sateiID: sateiId,
                    userId,
                    storeId: user?.storeId,
                    qrIssuedAt: ucarCreatedAt,
                    createdAt: ucarCreatedAt,
                  },
                  update: {
                    userId,
                    storeId: user?.storeId,
                    qrIssuedAt: ucarCreatedAt,
                    createdAt: ucarCreatedAt,
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
                  dataSource: `spreadsheet`,
                  userId: userId,
                  processCode: processCodeItem.code,
                }

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

          const ucarUpdateRes = await prisma.ucar.update({
            where: {sateiID: sateiId},
            data: {processLastUpdatedAt: processLastUpdatedAt},
          })
        }
      }
    },
  })

  return NextResponse.json(result)
}
