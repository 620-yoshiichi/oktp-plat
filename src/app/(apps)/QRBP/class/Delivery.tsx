import {DELIVERY_CAR_OBJ_TYPE} from '@app/(apps)/QRBP/admin/delivery/getter'

export type NBC_TYPE = 'newCar' | 'bpCar' | 'uCar'
export class Delivery {
  static constants = {
    COLOR_TYPES: ['#e98d6c', '#e9bb6c', '#e9dc6c', '#99aee0', '#99e0a8'],
    NBC: {
      newCar: {label: '新車', color: '#509e32', carKey: 'newCarId'},
      uCar: {label: '中古車', color: '#e96c6c', carKey: 'ucarId'},
      bpCar: {label: 'BP', color: '#f2b05a', carKey: 'carId'},
    },
  }

  static newCar = {
    arrangeBasicInfo: ({car}) => {
      const {
        id,
        orderNumber,
        buyerName,
        ownerName,
        katashiki,
        frame,
        bodyNumber,
        orderedAt,
        registeredAt,
        deliverScheduledAt,
        Store,
        Slot,
        slotId,
      } = car
      const StoreToDeliver = Store

      return {
        id,
        type: 'newCar',
        deliveryId: `newCar_${orderNumber}_${id}}`,
        Slot,
        slotId,
        carName: '車名',
        orderNumber,
        StoreToDeliver,
        customerName: buyerName,
        katashiki,
        bodyNumber,
        frame,
        orderedAt,
        deliverScheduledAt,
      } as DELIVERY_CAR_OBJ_TYPE
    },
    // getStoreToDeliver: ({car, stores}) => {
    //   const {orderNumber} = car
    //   const storeCode = String(orderNumber)?.slice(0, 2)
    //   const StoreToDeliver = stores.find(store => Number(store.code) === Number(storeCode))
    //   return StoreToDeliver
    // },
  }
  static bpCar = {
    arrangeBasicInfo: ({car}) => {
      const {id, bpNumber, carName, orderNumber, customerName, katashiki, frame, orderedAt, Store, Slot, slotId} = car

      // const {showDelivelyScheduld, deliverlyFrom, deliverlyTo} = BP_Car.calcDelivelySchedule(car)

      return {
        id,
        type: 'bpCar',
        deliveryId: `bpCar_${orderNumber}_${id}`,
        Slot,
        slotId,
        carName,
        orderNumber: bpNumber,
        StoreToDeliver: Store,
        customerName: customerName,
        katashiki,
        frame,
        orderedAt,
        deliverScheduledAt: car.deliverScheduledAt,
        bodyNumber: frame,
      } as DELIVERY_CAR_OBJ_TYPE
    },
  }

  static Slot = {
    getSlotUpdatePayload: ({theCar}) => {
      const updatePayload = {
        carId: theCar?.type === 'bpCar' ? theCar?.id : undefined,
        newCarId: theCar?.type === 'newCar' ? theCar?.id : undefined,
      }

      return updatePayload
    },
  }
}
