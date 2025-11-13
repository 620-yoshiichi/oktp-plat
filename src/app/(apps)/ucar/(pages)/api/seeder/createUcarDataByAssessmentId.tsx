import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

export default async function createUcarDataByAssessmentId(props: {sateiIdList: number[]}) {
  const ucarGarageSlotMasterQuery: transactionQuery[] = []
  props.sateiIdList.map(async row => {
    const Assessment_ID = row?.[4]
    if (Assessment_ID) {
      ucarGarageSlotMasterQuery.push({
        model: `ucar`,
        method: `upsert`,
        queryObject: {
          select: {Assessment_ID: true},
          where: {Assessment_ID},
          create: {Assessment_ID},
          update: {Assessment_ID},
        },
      })
    }
  })

  return await doTransaction({transactionQueryList: ucarGarageSlotMasterQuery})
}
