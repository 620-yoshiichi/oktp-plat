import {colType} from '@cm/types/col-types'
import {JSX} from 'react'
export type dataCountArrForUserType = {
  key: string | number | undefined | null
  label: any | undefined
  color: any | undefined
  date: Date | undefined | null
  COUNT: number
  columnOrigin: colType[] | any[]
}

export type RowByUserProps = {
  day: Date
  user: UserData
  outcomeMasters: any[]
  purposeMaters: any[]
  query: any
}

export type columnOrigin = colType[] | any[]
export type countCagetory = {
  groupByArr: dataCountArrForUserType[]
  columnOrigin: columnOrigin
  categoryName?: string | JSX.Element
}
export type UserData =
  | {
      id: number | undefined
      name: string
      RentaStore: any
    }
  | {
      [key: string]: countCagetory
    }
