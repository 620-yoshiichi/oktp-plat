'use client'
import { Fragment } from 'react'
import DraggableCar from '../DraggableCar'

const DateColumn = props => {
  const { colId, cars, setcarOnModal, lastTouchedCarId, setlastTouchedCarId } = props

  return (
    <div className={`flex flex-wrap max-h-[300px] overflow-y-auto gap-1 p-1`}>
      {(cars ?? []).map((car, i) => (
        <Fragment key={i}>
          <DraggableCar
            {...{
              car,
              setcarOnModal,
              lastTouchedCarId,
              setlastTouchedCarId,
            }}
          />
        </Fragment>
      ))}
    </div>
  )
}

export default DateColumn
