'use client'
import {Button} from '@cm/components/styles/common-components/Button'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

const Btns = () => {
  const {query, addQuery} = useGlobal()
  return (
    <div className={`m-2`}>
      <R_Stack className={`gap-4`}>
        <Button
          className={`text-sm`}
          onClick={e =>
            addQuery({
              userId: '',
              processNameMasterId: '',
              fullOpen: false,
            })
          }
        >
          絞り込み解除
        </Button>
        <Button className={`text-sm`} onClick={e => addQuery({fullOpen: true})}>
          フルオープン
        </Button>
      </R_Stack>
    </div>
  )
}
export default Btns
