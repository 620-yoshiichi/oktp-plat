import {QueryBuilder} from '@app/(apps)/QRBP/class/QueryBuilder'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

export class DoubledBP {
  /**BP番号2周対策 受注日が新しい方の車両を取得*/
  static getLatestCarByBpNumber = async (bpNumber, options?: {queryObject: any}) => {
    const {queryObject} = options ?? {}
    const {result: cars} = await doStandardPrisma('car', 'findMany', {
      ...queryObject,
      where: {bpNumber},
      orderBy: {orderedAt: 'desc'},
    })
    const logMessage = `BP番号${bpNumber}の車両が${cars.length}件あります。`
    console.log(logMessage)
    return cars[0]
  }

  /**BP番号に一致するすべての車両を取得*/
  static getAllCarsByBpNumber = async (bpNumber, options?: {queryObject: any}) => {
    const {queryObject} = options ?? {}
    const {result: cars} = await doStandardPrisma('car', 'findMany', {
      ...queryObject,
      where: {bpNumber},
      orderBy: {orderedAt: 'desc'},
    })
    const logMessage = `BP番号${bpNumber}の車両が${cars.length}件あります。`
    console.log(logMessage)
    return cars
  }

  static params = {
    create: car => {
      const params = {bpNumber: car?.bpNumber, orderedAt: formatDate(car?.orderedAt)}
      return params
    },
    getCarByParams: async ({bpNumber, orderedAtString}) => {
      const orderedAtIso = toUtc(orderedAtString).toISOString()

      const where = {bpNumber, orderedAt: orderedAtIso}

      const {result: car} = await doStandardPrisma('car', 'findMany', {
        where,
        include: QueryBuilder.getInclude({}).car.include,
      })

      return car?.[0]
    },
  }

  static getComplexKey = car => {
    const {bpNumber, orderedAt} = car
    const complexKey = `${bpNumber}_${formatDate(orderedAt)}`
    return complexKey
  }
  static goodbyCode = {
    split: car => {
      const [bpNumber, ordereAtString] = String(car.representativeCarBpNumber).split('_')
      return {bpNumber, ordereAtString}
    },

    make: car => {
      return `${car.bpNumber}_${formatDate(car.orderedAt)}`
    },
  }
}
