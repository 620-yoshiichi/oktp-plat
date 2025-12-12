import {Shinren} from '@app/(apps)/shinren/class/Shinren'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'
import {optionType} from '@cm/class/Fields/col-operator-types'
import prisma from 'src/lib/prisma'
import {Prisma} from '@prisma/generated/prisma/client'
import {addDays} from 'date-fns'

const commonSelect = {
  id: true,
  rentaCustomerId: true,
  isRead: true,
  isRead2: true,

  RentaCustomer: {
    select: {
      id: true,
      name: true,
      User: {select: {name: true}},
    },
  },
}

const commonorderBy: any[] = [{id: 'asc'}]

const makeCommonOR = userIdWhere => {
  return [
    {
      RentaCustomer: {
        userId: userIdWhere,
      },
    },
    {
      RentaDailyReport: {
        userId: userIdWhere,
      },
    },
  ]
}
export const getAlternateInfo = async ({whereQuery, userIdWhere}) => {
  const AlterNateInfo = await prisma.alternateInfo.findMany({
    select: {
      carName: true,
      dueDate: true,
      ...commonSelect,
    },
    where: {
      dueDate: whereQuery,
      OR: makeCommonOR(userIdWhere),
    },
    orderBy: commonorderBy,
  })
  return AlterNateInfo
}

export const getInsuranceInfo = async ({whereQuery, userIdWhere}) => {
  const InsuranceInfo = await prisma.insuranceInfo.findMany({
    select: {
      insuranceCompany: true,
      dueDate: true,
      imageUrl: true,
      ...commonSelect,
    },
    where: {
      dueDate: whereQuery,
      OR: makeCommonOR(userIdWhere),
    },
    orderBy: commonorderBy,
  })
  return InsuranceInfo
}
export const getExtraInfo = async ({whereQuery, userIdWhere}) => {
  const ExtraInfo = await prisma.extraInfo.findMany({
    select: {
      date: true,
      remarks: true,
      imageUrl: true,
      ...commonSelect,
    },
    where: {
      date: whereQuery,
      OR: makeCommonOR(userIdWhere),
    },
    orderBy: commonorderBy,
  })
  return ExtraInfo
}

export type CalendarInfoTypeAtom = {
  calendarDataType?: optionType
  item?: any | null
  date?: Date | null
  RentaCustomer?: Prisma.RentaCustomerUncheckedCreateInput | any
  before90Days?: boolean
  record: {
    isRead?: boolean
    [key: string]: any
  }
}
export type CalendarInfoType = {
  [key: string]: CalendarInfoTypeAtom[]
}

const calendarDataTypes = Shinren.constants.calendarDataTypes

const CalendarInfoPush = (props: {CalendarInfo: CalendarInfoType; payload: any}) => {
  const {CalendarInfo, payload} = props

  const dateKey = formatDate(payload.date)
  obj__initializeProperty(CalendarInfo, dateKey, [])

  CalendarInfo[dateKey].push({...payload})

  if (payload.calendarDataType.value === 'ExtraInfo') return
  const dateKeyBefore90Days = formatDate(addDays(payload.date, -90))
  obj__initializeProperty(CalendarInfo, dateKeyBefore90Days, [])
  CalendarInfo[dateKeyBefore90Days].push({
    ...payload,
    date: addDays(payload.date, -90),
    before90Days: true,
  })
}
export const createCalendarInfo = ({AlterNateInfo, InsuranceInfo, ExtraInfo}) => {
  const CalendarInfo: CalendarInfoType = {}

  AlterNateInfo.forEach(record => {
    const date = record['dueDate']
    const item = record['carName']

    const calendarDataType = calendarDataTypes.find(v => v.value === 'AlternateInfo')
    const payload = {item, date, calendarDataType, RentaCustomer: record.RentaCustomer, record: record}
    CalendarInfoPush({CalendarInfo, payload})
  })

  InsuranceInfo.forEach(record => {
    const date = record['dueDate']
    const item = record['insuranceCompany']
    const calendarDataType = calendarDataTypes.find(v => v.value === 'InsuranceInfo')
    const payload = {item, date, calendarDataType, RentaCustomer: record.RentaCustomer, record: record}
    CalendarInfoPush({CalendarInfo, payload})
  })
  ExtraInfo.forEach(record => {
    const date = record['date']
    const item = record['remarks']
    const calendarDataType = calendarDataTypes.find(v => v.value === 'ExtraInfo')
    const payload = {item, date, calendarDataType, RentaCustomer: record.RentaCustomer, record: record}
    CalendarInfoPush({CalendarInfo, payload})
  })

  return CalendarInfo
}
