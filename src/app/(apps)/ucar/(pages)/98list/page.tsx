import {getAvailable98Numbers} from '@app/(apps)/ucar/(lib)/num98/getAvailable98Numbers'
import Number98ListCC from '@app/(apps)/ucar/(pages)/98list/Number98ListCC'

export default async function Page({params, searchParams: query}) {
  const {next98Number, available98Numbers, used98Numbers} = await getAvailable98Numbers({take: 100000})

  return <Number98ListCC {...{next98: next98Number, used98Numbers, available98Numbers}} />
}
