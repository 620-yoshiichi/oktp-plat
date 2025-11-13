import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'
import {Delivery} from '@app/(apps)/QRBP/class/Delivery'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import {anyObject} from '@cm/types/utility-types'

import {arr__sortByKey} from '@cm/class/ArrHandler/array-utils/sorting'

export type DELIVERY_CAR_OBJ_TYPE = {
  id: number
  deliveryId: string
  carName: string
  orderNumber: string
  StoreToDeliver: anyObject
  customerName: string
  katashiki: string
  frame: string
  orderedAt: Date
  deliverScheduledAt: Date
  bodyNumber?: string
}

export const getNewCarData = async ({dateWhere}) => {
  // let {result: cars} = await doStandardPrisma('newCar', 'findMany', {
  //   distinct: ['deliverScheduledAt'],
  //   where: {
  //     deliverScheduledAt: {...dateWhere},
  //   },
  //   include: {
  //     Store: {include: {Area: {}}},
  //     Slot: {},
  //   },
  //   orderBy: [{deliverScheduledAt: 'asc'}],
  // })

  const carsByDate = {}
  // cars = cars.map(car => {
  //   const dateKey = car?.deliverScheduledAt ? formatDate(car.deliverScheduledAt, 'MM-DD(ddd)') : '未定'
  //   obj__initializeProperty(carsByDate, dateKey, [])
  //   const DELIVERY_CAR_OBJ = Delivery.newCar.arrangeBasicInfo({car})
  //   carsByDate[dateKey].push(DELIVERY_CAR_OBJ)

  //   return DELIVERY_CAR_OBJ
  // })

  return {cars: [], carsByDate}
}

export const getBpCarData = async ({waitingCarWhereCondition, dateWhere}) => {
  let {result: cars} = await doStandardPrisma('car', 'findMany', {
    where: {
      ...waitingCarWhereCondition,
    },
    include: {
      Store: {include: {Area: {}}},
      Process: {
        include: {ProcessNameMaster: {}},
      },
      Slot: {},
    },
  })

  const carsByDate = {}
  cars = cars
    .filter(car => {
      return (
        formatDate(BP_Car.calcDelivelySchedule(car).deliverlyFrom) >= formatDate(dateWhere.gte) &&
        formatDate(BP_Car.calcDelivelySchedule(car).deliverlyFrom) <= formatDate(dateWhere.lte)
      )
    })
    .map(car => {
      const {showDelivelyScheduld, deliverlyFrom, deliverlyTo} = BP_Car.calcDelivelySchedule(car)
      const deliverScheduledAt = deliverlyFrom
      car = {...car, deliverScheduledAt}

      const DELIVERY_CAR_OBJ = Delivery.bpCar.arrangeBasicInfo({car})
      return DELIVERY_CAR_OBJ
    })

    .sort((a, b) => {
      return a.deliverScheduledAt - b.deliverScheduledAt
    })

  cars.forEach(car => {
    const dateKey = car.deliverScheduledAt ? formatDate(car.deliverScheduledAt, 'MM-DD(ddd)') : '未定'
    obj__initializeProperty(carsByDate, dateKey, [])
    carsByDate[dateKey].push(car)
  })
  cars = arr__sortByKey(cars, 'deliverScheduledAt')

  return {cars, carsByDate}
}
