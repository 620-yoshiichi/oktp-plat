import {ColBuilder} from '@app/(apps)/ucar/class/ColBuilder/ColBuilder'

import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'
import {myFormDefaultUpsert} from '@cm/lib/formMethods/myFormDefaultUpsert'

import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {Paper} from '@cm/components/styles/common-components/paper'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

import React from 'react'
import useSWR from 'swr'

export default function UcrDetailUpdater({sateiID, close}) {
  const useGlobalProps = useGlobal()

  const key = [sateiID, 'UcrDetailUpdater'].join('_')

  const {data} = useSWR(key, async () => {
    // const {available98Numbers, next98Number} = await getAvailable98Numbers({})

    const ucar = await UcarCL.fetcher.getUcarDataBySateiId(sateiID)

    // const {result: next98NumberModel} = await doStandardPrisma(`number98`, `findFirst`, {where: {number: next98Number}})

    return {
      ucar,
      // next98NumberModel,
      // available98Numbers,
    }
  })

  if (!data) return <PlaceHolder>読み込み中</PlaceHolder>

  return (
    <div>
      <Main {...{close, useGlobalProps, ucar: data.ucar}} />
    </div>
  )
}

const Main = ({close, useGlobalProps, ucar}) => {
  const {query, router, toggleLoad} = useGlobalProps

  const formData = ucar

  const columns = ColBuilder.ucar({useGlobalProps})

  const {BasicForm, latestFormData, ReactHookForm} = useBasicFormProps({
    onFormItemBlur: ({value, name, id, e, newlatestFormData: data, ReactHookForm}) => {
      if (name === 'processedAs' && processedAs) {
        ReactHookForm.setValue(`meihenBi`, null)
        ReactHookForm.setValue(`masshoBi`, null)
      }
    },
    columns: columns,
    formData,
  })

  const {processedAs} = latestFormData

  const onSubmit = async data => {
    if (confirm(`データを更新しますか？`)) {
      toggleLoad(async () => {
        const res = await myFormDefaultUpsert({
          latestFormData: data,
          dataModelName: `ucar`,
          columns,
          extraFormState: {},
          additional: {},
          formData,
        })
        close()
      })
    }
  }

  return (
    <C_Stack>
      {/* <Paper>
        <InlineGarageEditor {...{row: ucar, setshowGarageRegister: null}} />
      </Paper> */}

      {/* 基本情報の編集 */}
      <Paper>
        <BasicForm
          {...{
            alignMode: 'console',
            latestFormData,
          }}
        />
        <div className={`sticky bottom-0 mx-auto w-full  bg-white text-center`}>
          <Button {...{onClick: () => onSubmit(latestFormData)}}>更新</Button>
        </div>
      </Paper>
    </C_Stack>
  )
}
