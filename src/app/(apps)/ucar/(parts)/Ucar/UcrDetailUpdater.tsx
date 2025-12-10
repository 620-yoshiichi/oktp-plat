import {ColBuilder} from '@app/(apps)/ucar/class/ColBuilder/ColBuilder'

import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'
import {myFormDefaultUpsert} from '@cm/lib/formMethods/myFormDefaultUpsert'

import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {Paper} from '@cm/components/styles/common-components/paper'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

import React, {useEffect, useState} from 'react'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

export default function UcrDetailUpdater({sateiID, close, getAvailable98NumbersReturn}) {
  const useGlobalProps = useGlobal()

  const [data, setdata] = useState<any>(null)
  useEffect(() => {
    UcarCL.fetcher.getUcarDataBySateiId(sateiID).then(ucar => {
      setdata({ucar})
    })
  }, [])

  if (!data) return <PlaceHolder>読み込み中</PlaceHolder>

  return (
    <div>
      <Main {...{close, useGlobalProps, ucar: data.ucar, getAvailable98NumbersReturn}} />
    </div>
  )
}

const Main = ({close, useGlobalProps, ucar, getAvailable98NumbersReturn}) => {
  const {query, router, toggleLoad} = useGlobalProps

  const formData = ucar

  const columns = ColBuilder.ucar({
    useGlobalProps,
    ColBuilderExtraProps: {
      currentNumber98: ucar.number98,
      getAvailable98NumbersReturn,
    },
  })

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
    const number98 = data.number98

    const {result: prevRecord} = await doStandardPrisma(`ucar`, `findUnique`, {where: {id: data.id}})
    const numberChanged = prevRecord?.number98 !== number98

    if (numberChanged && confirm('98番号を更新します。よろしいですか？') === false) {
      close()
      alert('データ更新を中止しました。')
      return
    }

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

        //98番号が変更の場合
        if (numberChanged && res.success) {
          const {result: last98Number} = await doStandardPrisma('number98', 'findFirst', {orderBy: {sortNumber: 'desc'}})
          const isLast98Number = last98Number?.number === number98

          if (isLast98Number) {
            //最後の番号だったら履歴を削除
            await doStandardPrisma('number98IssueHistory', 'deleteMany', {where: {}})
          } else {
            // それ以外は履歴を作成
            await doStandardPrisma('number98IssueHistory', 'create', {data: {number: number98}})
          }
        }

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
        <div className={`sticky bottom-0 mx-auto w-full text-center`}>
          <Button {...{onClick: () => onSubmit(latestFormData)}}>更新</Button>
        </div>
      </Paper>
    </C_Stack>
  )
}
