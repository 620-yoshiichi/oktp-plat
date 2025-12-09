import {
  getAvailable98Numbers,
  getAvailable98NumbersReturn,
  getNonAvailable98Numbers,
} from '@app/(apps)/ucar/(lib)/num98/getAvailable98Numbers'
import Number98ListCC from '@app/(apps)/ucar/(pages)/98list/Number98ListCC'

export default async function Page({params, searchParams: query}) {
  const {nextNumber98, available98Numbers} = await getAvailable98Numbers({take: 50})
  const {nonAvailable98Numbers} = await getNonAvailable98Numbers({take: 50})

  return (
    <Number98ListCC
      {...{
        nextNumber98,
        available98Numbers,
        nonAvailable98Numbers,
      }}
    />
  )
}
