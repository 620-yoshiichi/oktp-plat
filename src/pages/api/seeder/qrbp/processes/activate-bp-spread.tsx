import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'

import {superTrim} from '@cm/lib/methods/common'
import prisma from 'src/lib/prisma'
import {fetchAlt} from '@cm/lib/http/fetch-client'

import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

export default async function ActivateBpSpread(req, res) {
  const cars = await prisma.car.findMany({})
  const processNameMasters = await prisma.processNameMaster.findMany({})
  const users = await prisma.user.findMany({})
  const acceptionProcess = await BP_Car.getProcessNameMasterByName('CR受入')
  const directionProcess = await BP_Car.getProcessNameMasterByName('着工許可')

  const damageNameMaster = await prisma.damageNameMaster.findMany({})

  if (req.body.deleteProcess) {
    const deleteCount = await prisma.process.deleteMany()
    console.log(`${deleteCount}件削除`)
  }
  const adminUserId = users.find(user => user.name.includes('吉市'))?.id
  async function getBpCars() {
    if (req.body.deleteProcess) {
      await prisma.process.deleteMany()
    }

    const doPostKey = process.env.BP_GAS_API_KEY ?? ''

    // let data = sampleData
    const data = await fetchAlt(doPostKey, {
      action: 'getProcesses',
    })

    return data
  }

  const data = await getBpCars()

  const master = {
    着工許可: '着工許可',
    着工開始済み: '着工指示',
    スタンバイ: '着工指示',
    磨き: '磨き',
    組み付け: '組み付け',
    板金修理: '板金修理',
    塗装下処理: '塗装下処理',
    エーミング: 'エーミング',
    塗装: '塗装',
    完成検査: '作業完了',
    洗車: '洗車',
    拠点受取: '拠点受取',
  }

  const transactionQueryList: transactionQuery<any, any>[] = []

  const carUpdators: transactionQuery<any, any>[] = []
  data.forEach((car, idx) => {
    const {advisorName, damage, estimate, schedule, carProcesses, processCount} = car
    if (processCount === 0) {
      return
    }

    const bpNumber = '30 ' + car.bpNumber
    const {id: carId, orderedAt} = cars.find(car => String(car.bpNumber) === String(bpNumber)) ?? {}

    if (!carId) {
      console.log(`${bpNumber}が見つかりません`)
      return
    }

    carUpdators.push({
      model: 'car',
      method: 'update',
      queryObject: {
        where: {
          bpNumber: String(bpNumber),
        },
        data: {
          damageNameMasterId: damageNameMaster.find(d => {
            return d.name === damage
          })?.id,
          currentEstimate: Number(estimate),
          scheduledAt: formatDate(schedule, 'iso'),
          crUserId: users.find(user => {
            return superTrim(user.name) === superTrim(advisorName)
          })?.id,
        },
      },
    })

    const processes = carProcesses
      .map(p => {
        const newName = master[p.processName]
        return {...p, processName: newName}
      })
      .map(p => {
        const processNameMasterId = processNameMasters.find(master => {
          return superTrim(master.name) === superTrim(p.processName)
        })?.id
        return {...p, processNameMasterId}
      })
      .filter(p => {
        return p.processNameMasterId
      })

    transactionQueryList.push({
      model: 'process',
      method: 'create',
      queryObject: {
        data: {
          name: `CR受入`,
          date: null,
          time: 0,
          userId: adminUserId,
          processNameMasterId: acceptionProcess?.id,
          carId: Number(carId),
        },
      },
    })

    transactionQueryList.push({
      model: 'process',
      method: 'create',
      queryObject: {
        data: {
          name: `着工指示`,
          date: null,
          time: 0,
          userId: adminUserId,
          processNameMasterId: directionProcess?.id,
          carId: Number(carId),
        },
      },
    })

    processes.forEach(p => {
      const {time, userName, date, processNameMasterId, processName} = p
      console.log(bpNumber, time, userName, date, processNameMasterId)
      const userId = users.find(user => superTrim(user.name) === superTrim(userName))?.id
      const processUpsertData = {
        data: {
          name: processName,
          date: formatDate(date, 'iso'),
          time: Number(time),
          carId: Number(carId),
          userId,
          processNameMasterId: processNameMasterId,
        },
      }
      transactionQueryList.push({
        model: 'process',
        method: 'create',
        queryObject: processUpsertData,
      })
    })
  })

  const result = await doTransaction({transactionQueryList})
  const updateCr = await doTransaction({transactionQueryList: carUpdators})

  return res.json({dataCount: transactionQueryList?.length, transactionQueryList})
}
