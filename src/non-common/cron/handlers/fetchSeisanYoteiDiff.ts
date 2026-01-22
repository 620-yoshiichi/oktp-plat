'use server'
import {BQ} from '@app/api/google/big-query/BigQuery'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import prisma from 'src/lib/prisma'
import {transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {Prisma} from '@prisma/generated/prisma/client'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

/**
 * 生産予定フェッチバッチ
 * 生産予定履歴テーブルを作成する
 */
export const executeFetchSeisanYoteiDiff = async () => {
  const createSeisanYoteiHistoryTableRes = await createSeisanYoteiHistoryTable()

  return {
    success: true,
    message: `生産予定フェッチ完了 ${createSeisanYoteiHistoryTableRes.count}件`,
    result: {count: createSeisanYoteiHistoryTableRes.count},
  }
}

/**
 * 生産予定履歴テーブルを作成する
 */
async function createSeisanYoteiHistoryTable() {
  const lastRecordSq = sql`
  WITH rn_added AS (
    SELECT
      CreatedDate,
      NO_CYUMON,
      tcrm__SeisanYoteiBi__c,
      tcrm__SeisanYotei__c,
      CreatedAt,
      LastModifiedDate,
      APPINDEX_FKEY,
      APPINDEX,
      ROW_NUMBER() OVER (PARTITION BY APPINDEX_FKEY ORDER BY CreatedAt DESC) as row_number
    FROM okayamatoyopet.OrdersDB.SF_JSLIM_HISTORY
  )



  SELECT * from rn_added
  WHERE
      row_number <=2
      AND APPINDEX_FKEY  --履歴が2件以上あるデータに限定
          IN (SELECT APPINDEX_FKEY FROM rn_added where row_number  >=2)
  `

  const rows = await new BQ({datasetId: `OrdersDB`, tableId: `Orders_Base`}).GET({sqlString: lastRecordSq})

  const ToObject = rows.reduce((acc, cur) => {
    const {
      CreatedDate,
      NO_CYUMON,
      tcrm__SeisanYoteiBi__c,
      tcrm__SeisanYotei__c,
      CreatedAt,
      LastModifiedDate,
      APPINDEX_FKEY,
      APPINDEX,
      row_number,
    } = cur
    if (acc[APPINDEX_FKEY] === undefined) {
      acc[APPINDEX_FKEY] = []
    }

    acc[APPINDEX_FKEY].push({
      NO_CYUMON,
      APPINDEX_FKEY,
      CreatedAt,
      tcrm__SeisanYoteiBi__c,
      tcrm__SeisanYotei__c,
      row_number,
    })
    return acc
  }, {})

  const transactionQueryList: transactionQuery<'seisanYoteiHistory', 'upsert'>[] = []

  await Promise.all(
    Object.keys(ToObject).map(async (APPINDEX_FKEY, idx) => {
      const latest = ToObject[APPINDEX_FKEY].find(v => v.row_number === 1)
      const previous = ToObject[APPINDEX_FKEY].find(v => v.row_number === 2)

      const from: string = previous.tcrm__SeisanYotei__c
      const to: string = latest.tcrm__SeisanYotei__c
      const fromDate = previous.tcrm__SeisanYoteiBi__c ? toUtc(previous.tcrm__SeisanYoteiBi__c) : null
      const toDate = latest.tcrm__SeisanYoteiBi__c ? toUtc(latest.tcrm__SeisanYoteiBi__c) : null

      const seisan_switch_notice_APPINDEX_FKEY = [
        //
        APPINDEX_FKEY,
        previous.tcrm__SeisanYotei__c,
        previous.CreatedAt,
        latest.tcrm__SeisanYotei__c,
        latest.CreatedAt,
      ].join(`_`)

      const newCar = await prisma.newCar.findUnique({
        select: {id: true},
        where: {APPINDEX: APPINDEX_FKEY},
      })

      const newCarId: number = newCar?.id ?? 0
      if (!newCarId) {
        return
      }

      if (from === to) {
        return
      }
      const key = seisan_switch_notice_APPINDEX_FKEY
      const payload = {
        key,
        from,
        to,
        fromDate,
        toDate,
        issuedAt: toUtc(latest.CreatedAt),
        newCarId,
      }
      const args: Prisma.SeisanYoteiHistoryUpsertArgs = {
        where: {key},
        create: payload,
        update: payload,
      }

      transactionQueryList.push({
        model: `seisanYoteiHistory`,
        method: `upsert`,
        queryObject: args,
      })
    })
  )

  const res = await processBatchWithRetry({
    soruceList: transactionQueryList,
    mainProcess: async batch => {
      return await doTransaction({transactionQueryList: batch})
    },
  })

  return {
    count: Object.keys(ToObject).length,
  }
}
