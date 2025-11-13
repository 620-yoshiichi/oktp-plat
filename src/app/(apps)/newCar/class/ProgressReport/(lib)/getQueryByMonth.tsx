import {getQueryByMonthType, getWheres} from '@app/(apps)/newCar/class/ProgressReport/(lib)/getWheres'

export const getQueryByMonth = ({months, newCarWhere, userId, storeId}) => {
  const result: getQueryByMonthType[] = [
    ...months.map(month => {
      const wheres = getWheres({userId, storeId, newCarWhere, month, firstMonth: months[0]})

      return {month, wheres, storeId}
    }),
  ]

  return result
}
