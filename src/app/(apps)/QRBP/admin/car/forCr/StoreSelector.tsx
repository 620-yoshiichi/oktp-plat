import {DoubledBP} from '@app/(apps)/QRBP/class/doubledBpNumber'
import {Fields} from '@cm/class/Fields/Fields'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {shorten} from '@cm/lib/methods/common'
import {HREF} from '@cm/lib/methods/urls'

const StoreSelector = ({addQuery, query, storeQueryObj}) => {
  const {stores, paramKey} = storeQueryObj

  const storeState = {}
  query[paramKey]?.split(',').forEach(id => {
    storeState[id] = true
  })

  const Form = () => {
    const {BasicForm, latestFormData} = useBasicFormProps({
      columns: new Fields([{id: `bpNumber`, label: `QRシート発行`, form: {}, type: 'text'}]).transposeColumns(),
    })
    return (
      <BasicForm
        {...{
          alignMode: 'col',
          latestFormData,
          onSubmit: async data => {
            const bpNumber = `30 ` + data.bpNumber

            const result = await DoubledBP.getLatestCarByBpNumber(bpNumber)
            const params = DoubledBP.params.create(result)

            if (!result) return alert('該当するBP番号がありません')
            const path = HREF(`/QRBP/admin/car/forCr/qrsheet`, {...params}, query)
            window.open(path, '_blank')
          },
        }}
      />
    )
  }

  return (
    <div>
      <R_Stack className={` flex-nowrap  items-end`}>
        <div>
          <Form />
        </div>

        <div>
          <R_Stack className={` gap-1.5 gap-y-0.5 items-start `}>
            {[{name: '全表示', id: 'all'}, ...stores].map((store, i) => {
              const active = storeState[store.id]
              return (
                <div key={i}>
                  <IconBtn
                    className={`w-[90px] h-[20px] overflow-hidden  text-[10px]  cursor-pointer onHover`}
                    color={active ? 'primary' : 'gray'}
                    size="sm"
                    onClick={e => {
                      if (store.id === 'all') {
                        addQuery({[paramKey]: undefined})
                      } else {
                        const newStoreState = {...storeState, [store.id]: !storeState[store.id]}
                        const param = Object.keys(newStoreState)
                          .filter(key => newStoreState[key])
                          .join(',')
                        addQuery({[paramKey]: param})
                      }
                    }}
                  >
                    {shorten(store.name, 8, `..`)}
                  </IconBtn>
                </div>
              )
            })}
          </R_Stack>
        </div>
      </R_Stack>
    </div>
  )
}

export default StoreSelector
