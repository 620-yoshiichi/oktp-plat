import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

export default async function createUcarDataByAssessmentId(props: {sateiIdList: number[]}) {
  const ucarGarageSlotMasterQuery: transactionQuery<'ucar', 'upsert'>[] = []
  props.sateiIdList.map(async row => {
    const sateiID = row?.[4]
    if (sateiID) {
      ucarGarageSlotMasterQuery.push({
        model: `ucar`,
        method: `upsert`,
        queryObject: {
          select: {sateiID: true},
          where: {sateiID},
          create: {sateiID},
          update: {sateiID},
        },
      })
    }
  })

  return await doTransaction({transactionQueryList: ucarGarageSlotMasterQuery})
}
