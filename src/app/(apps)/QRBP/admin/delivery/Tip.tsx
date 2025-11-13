import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
IconBtn

const Tip = ({children, ...rest}) => (
  <IconBtn {...rest} className={`bg-blue-light h-[70px] w-[140px]  py-2 `}>
    {children}
  </IconBtn>
)

export default Tip
