import {BQ} from '@app/api/google/big-query/BigQuery'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import {Prisma} from '@prisma/client'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {BQ_parser} from '@app/api/google/big-query/bigQueryParser'

export const createUcarByQrIssueBigQuery = async ({allUsers}) => {
  const AiSateiUser = await new BQ({
    datasetId: `Ucar_QR`,
    tableId: `QR_Prosess`,
  }).GET({
    sqlString: sql`
 SELECT
    sateiId,
    datetime_0,
    email_0,
    store_0,
    remarks_0,
    shitadoriKubun_0,
    orderNumber_0
    FROM okayamatoyopet.Ucar_QR.QR_Prosess
 `,
  })

  const transactionQueryList: transactionQuery[] = []
  AiSateiUser.map(async user => {
    const {sateiId, datetime_0, email_0, store_0, remarks_0, runnable_0, shitadoriKubun_0, orderNumber_0} = user

    const theUser = allUsers.find(user => user.email === email_0)
    if (theUser) {
      const payload = {
        sateiID: sateiId,
        userId: theUser.id,
        storeId: theUser.storeId,
        createdAt: BQ_parser.parseDate(datetime_0),
        remarks: remarks_0,
        runnable: runnable_0,
        storeToPickUp: store_0,
      }
      const ucarUpsertPayload: Prisma.UcarUpsertArgs = {
        where: {sateiID: payload.sateiID},
        create: payload,
        update: payload,
      }
      transactionQueryList.push({
        model: 'ucar',
        method: 'upsert',
        queryObject: ucarUpsertPayload,
      })
    }
  })
  return await doTransaction({transactionQueryList})
}
