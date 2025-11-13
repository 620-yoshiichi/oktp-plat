import {columnOrigin} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/types'
import {getColorStyles} from '@cm/lib/methods/colors'
import {CSSProperties, Fragment} from 'react'

export const Ths2 = (props: {columnOrigin: columnOrigin; categoryName: any}) => {
  const {columnOrigin} = props
  return (
    <Fragment>
      {columnOrigin.map((obj, i) => {
        const colorStyles = getColorStyles(obj?.color ?? '')
        return (
          <th
            style={{
              ...colorStyles,
              ...getCellStyle({}),
              top: 22,
              writingMode: 'vertical-lr',
              border: 'none',
            }}
            key={i}
          >
            {obj.value ?? obj.name}
          </th>
        )
      })}
      <th style={{...getCellStyle({total: true})}}>{props.categoryName}計</th>
    </Fragment>
  )
}

export const getCellStyle = (props: any) => {
  const {i, total} = props
  const result: CSSProperties = {
    ...(total ? {borderRight: '5px solid black'} : {}),
    ...(total ? {background: 'gray', color: 'white', fontWeight: 'bold'} : {}),
  }
  return result
}
