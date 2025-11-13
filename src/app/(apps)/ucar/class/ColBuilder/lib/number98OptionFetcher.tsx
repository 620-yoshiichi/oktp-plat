import {superTrim} from '@cm/lib/methods/common'

export const number98OptionFetcher = async ({latestFormData, col, additionalWhere, ColBuilderExtraProps}) => {
  const {Last98NumberCar, used98Numbers} = ColBuilderExtraProps

  let options: any[] = []
  options.push({number: latestFormData.number98})
  options = [...options, ...ColBuilderExtraProps.available98Numbers]

  const prevNumbers: any[] = []
  const afterNumbers: any[] = []

  options?.filter(d => {
    const number = d.number

    if (number === latestFormData?.number98 || Number(superTrim(number)) >= Number(superTrim(Last98NumberCar.number98))) {
      afterNumbers.push({
        id: number,
        value: number,
        label: number,
        color: `black`,
      })
    } else {
      prevNumbers.push({
        id: number,
        value: number,
        label: number,
        color: `red`,
      })
    }
  })

  const resultData = [...prevNumbers, ...afterNumbers]

  return resultData
}
