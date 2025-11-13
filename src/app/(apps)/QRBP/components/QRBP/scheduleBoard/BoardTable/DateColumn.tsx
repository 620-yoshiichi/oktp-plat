'use client'
import {Fragment} from 'react'
import DraggableCar from '../DraggableCar'

const DateColumn = props => {
  const {colId, cars, setcarOnModal, lastTouchedCarId, setlastTouchedCarId} = props

  return (
    <div>
      {cars?.length === 0 && <div></div>}
      {cars?.length > 0 && (
        <div className={`flex  flex-wrap justify-start    `}>
          {cars?.map((car, i) => {
            return (
              <Fragment key={i}>
                <div id={car.id} className={`  p-1`}>
                  <DraggableCar
                    {...{
                      car,
                      setcarOnModal,
                      lastTouchedCarId,
                      setlastTouchedCarId,
                    }}
                  ></DraggableCar>
                </div>
              </Fragment>
            )
          })}
        </div>
      )}
    </div>
    // </Droppable>
  )
}

export default DateColumn
