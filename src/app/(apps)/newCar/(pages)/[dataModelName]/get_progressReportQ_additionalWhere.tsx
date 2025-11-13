import {getQueryByMonth} from '@app/(apps)/newCar/class/ProgressReport/(lib)/getQueryByMonth'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {Days} from '@cm/class/Days/Days'

export const get_progressReportQ_additionalWhere = async ({query, newCarWhere}) => {
  const [monthStr, fieldName] = query[`progressReportQ`].split(`__`)

  const month = toUtc(monthStr + `-01`)
  const queryByMonth = getQueryByMonth({
    months: [month],
    newCarWhere,
    userId: newCarWhere.userId,
    storeId: newCarWhere.storeId,
  })
  const theQuery = queryByMonth.find(d => Days.validate.isSameDate(d.month as Date, month))
  const theCondition = theQuery?.wheres.find(w => w.key === fieldName)?.condition

  return {
    month,
    theCondition,
    fieldName,
  }
}
