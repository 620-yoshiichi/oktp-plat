import {unsold} from '@app/(apps)/ucar/(constants)/ucar-constants'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Prisma} from '@prisma/generated/prisma/client'

export const number98Validation = async (value, formValues) => {
  const {result: currentCarData} = await doStandardPrisma(`ucar`, `findUnique`, {where: {id: formValues.id}})

  const tryingToUpdateWithoutChangeIn98 = currentCarData?.number98 === value

  const isNull = [undefined, ``, null].includes(value)
  const numbersAligned = String(value).match(/^98 [0-9]{4} \d$/)

  const args: Prisma.UcarFindManyArgs = {
    where: {
      Number98: {number: String(value)},
      ...unsold,
    },
  }
  const {result: allCarsWithSame98} = await doStandardPrisma(`ucar`, `findMany`, args)

  const excludeThisCar = allCarsWithSame98.filter(car => car.id !== formValues.id)

  let message
  if (isNull) {
    message = undefined
  } else if (tryingToUpdateWithoutChangeIn98) {
    message = undefined
  } else if (!numbersAligned) {
    message = '正しい形式で入力してください'
  } else if (excludeThisCar.length !== 0) {
    message = '98番号が重複しています'
  }

  return message
}
