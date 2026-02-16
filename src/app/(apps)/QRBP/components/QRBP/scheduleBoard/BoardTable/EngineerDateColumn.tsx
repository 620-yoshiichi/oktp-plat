'use client'
import {Fragment} from 'react'
import EngineerDraggableCar from '../EngineerDraggableCar'

const EngineerDateColumn = props => {
  const {colId, cars, setcarOnModal, lastTouchedCarId, setlastTouchedCarId} = props

  return (
    <div>
      {cars?.length === 0 && <div></div>}
      {cars?.length > 0 && (
        <div className={`flex flex-wrap justify-start`}>
          {cars?.map((car, i) => {
            return (
              <Fragment key={i}>
                <div id={car.id} className={`p-1`}>
                  <EngineerDraggableCar
                    {...{
                      car,
                      setcarOnModal,
                      lastTouchedCarId,
                      setlastTouchedCarId,
                    }}
                  />
                </div>
              </Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default EngineerDateColumn
