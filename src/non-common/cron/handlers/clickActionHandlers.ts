import {fetchAlt} from '@cm/lib/http/fetch-client'
import {basePath} from '@cm/lib/methods/common'

/**
 * clickアクション用のハンドラー関数
 * APIエンドポイントを呼び出す
 */

export const executeNum98 = async () => {
  const res = await fetchAlt(`${basePath}/ucar/api/seeder/num98`, {}, {method: 'POST'})
  return res
}

export const executeUcarProcessDeleteAndCreate = async () => {
  const res = await fetchAlt(`${basePath}/ucar/api/seeder/ucarProcess/deleteAndCreate`, {}, {method: 'GET'})
  return res
}

export const executeQrPaper = async () => {
  const res = await fetchAlt(`${basePath}/ucar/api/seeder/qrPaper`, {}, {method: 'POST'})
  return res
}

export const executeTenchoShoruiSakusei = async () => {
  const res = await fetchAlt(`${basePath}/ucar/api/seeder/tenchoShoruiSakusei`, {}, {method: 'POST'})
  return res
}

export const executeShiwake = async () => {
  const res = await fetchAlt(`${basePath}/ucar/api/seeder/shiwake`, {}, {method: 'POST'})
  return res
}

export const executeTax = async () => {
  const res = await fetchAlt(`${basePath}/ucar/api/seeder/tax`, {}, {method: 'POST'})
  return res
}

export const executeGarage = async () => {
  const res = await fetchAlt(`${basePath}/ucar/api/seeder/garage`, {}, {method: 'POST'})
  return res
}

export const executeLinkOldCars = async () => {
  const res = await fetchAlt(`${basePath}/ucar/api/seeder/linkOldCars`, {}, {method: 'POST'})
  return res
}

export const executeKaonaviBatch = async () => {
  const res = await fetchAlt(`${basePath}/oktpCommon/api/seeder/kaonavi`, {}, {method: 'POST'})
  return res
}

export const executeActivateBpSpread = async () => {
  const res = await fetchAlt(`${basePath}/QRBP/seeder/activate-bp-spread`, {}, {method: 'GET'})
  return res
}

export const executeBankMaster = async () => {
  const res = await fetchAlt(`${basePath}/ucar/api/seeder/bank`, {}, {method: 'POST'})
  return res
}
