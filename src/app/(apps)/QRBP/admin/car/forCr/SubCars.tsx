import {DoubledBP} from '@app/(apps)/QRBP/class/doubledBpNumber'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
IconBtn

import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import {Alert} from '@cm/components/styles/common-components/Alert'

export const SubCars = ({car, subCarsInCurrentCars, setformData}) => {
  const subCarsForThisCar = subCarsInCurrentCars?.filter(subCar => {
    const {bpNumber, ordereAtString} = DoubledBP.goodbyCode.split(subCar)

    const hit1 = bpNumber === String(car.bpNumber)
    const hit2 = formatDate(car.orderedAt) === ordereAtString

    return hit1 && hit2
  })

  if (!subCarsForThisCar) return <PlaceHolder />
  return (
    <>
      <div className={`mt-1`}>
        {car.representativeCarBpNumber && (
          <small className={`t-alert-warning inline-block w-full p-[1px]`}>➡︎ {car.representativeCarBpNumber}</small>
        )}
        {subCarsForThisCar.length > 0 && (
          <Alert color="red" className="p-0.5">
            <R_Stack className={`justify-around   gap-0.5`}>
              <div className={`text-[9px]`}>子:</div>
              {subCarsForThisCar.map(car => {
                return (
                  <IconBtn onClick={() => setformData(car)} key={car.id} className="p-[1px] text-[9px] leading-3">
                    {car.bpNumber.replace('30 ', '')}
                  </IconBtn>
                )
              })}
            </R_Stack>
          </Alert>
        )}
      </div>
    </>
  )
}
