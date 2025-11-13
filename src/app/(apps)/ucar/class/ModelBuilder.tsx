'use client'

import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'
import {getter} from '@cm/components/layout/breadcrumbs/useDetailedModelData'

import {generalDoStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

const ucar: getter = async (modelName, dataId) => {
  const {result: dataById} = await generalDoStandardPrisma(modelName, `findUnique`, {
    where: {id: Number(dataId)},
  })

  const ucarData = await UcarCL.fetcher.getUcarDataBySateiId(dataById.sateiID)

  const {modelName: ucarModelName, plate} = new UcarCL(ucarData).notation
  const displayName = [ucarModelName, plate].join(' ')

  return {dataById, displayName, ucarData}
}
export class ModelBuilder {
  static breadCrumbDisplayMethods = {
    ucar,
  }
}
