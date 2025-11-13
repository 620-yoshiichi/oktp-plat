import {Circle, C_Stack} from '@cm/components/styles/common-components/common-components'
import {cl} from '@cm/lib/methods/common'

const Card = ({label, count}) => {
  return (
    <C_Stack className={cl(` items-center justify-around`, count === 0 ? ' opacity-20' : '')}>
      <div className={`w-12 truncate text-[10px]`}>{label}</div>
      <Circle width={24} className={`icon-btn  `}>
        {count}
      </Circle>
    </C_Stack>
  )
}
export default Card
