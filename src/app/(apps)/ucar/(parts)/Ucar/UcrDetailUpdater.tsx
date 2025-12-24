import {ColBuilder} from '@app/(apps)/ucar/class/ColBuilder/ColBuilder'

import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'

import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

import React, {useEffect, useState} from 'react'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {updateNumber98IssueHistory} from '@app/(apps)/ucar/(lib)/num98/updateNumber98IssueHistory'

export default function UcrDetailUpdater({sateiID, close, getAvailable98NumbersReturn, useRecordsReturn}) {
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
      <Main {...{close, useGlobalProps, ucar: data.ucar, getAvailable98NumbersReturn, useRecordsReturn}} />
    </div>
  )
}

const Main = ({close, useGlobalProps, ucar, getAvailable98NumbersReturn, useRecordsReturn}) => {
  const formData = ucar

  const columns = ColBuilder.ucar({
    useGlobalProps,
    ColBuilderExtraProps: {
      currentNumber98: ucar?.number98 ?? '',
      getAvailable98NumbersReturn,
    },
  })

  const {BasicForm, latestFormData, ReactHookForm} = useBasicFormProps({
    onFormItemBlur: ({value, name, id, e, newlatestFormData: data, ReactHookForm}) => {
      if (name === 'processedAs' && data.processedAs) {
        ReactHookForm.setValue(`meihenBi`, null)
        ReactHookForm.setValue(`masshoBi`, null)
      }

      if (name === 'bankMasterId') {
        ReactHookForm.setValue(`bankBranchMasterId`, null)
        ReactHookForm.setValue(`yuchoShitenNo`, null)
      }
    },
    columns: columns,
    formData,
  })

  const onSubmit = async data => {
    Object.keys(data).forEach(key => {
      if (key.includes('readOnly')) {
        delete data[key]
      }
    })

    const number98 = data?.number98

    const {result: prevRecord} = await doStandardPrisma(`ucar`, `findUnique`, {
      where: {sateiID: data?.sateiID ?? ''},
    })
    const numberChanged = prevRecord?.number98 !== number98

    if (numberChanged && confirm('98番号を更新します。よろしいですか？') === false) {
      close()
      alert('データ更新を中止しました。')
      return
    }

    if (confirm(`データを更新しますか？`)) {
      const sateiID = data?.sateiID ?? ''

      // updateでは除外すべきフィールド
      const updateData = {...data}
      delete updateData.sateiID // whereで指定した@uniqueフィールドはupdateから除外（エラー回避のため）

      // create用のデータ（sateiIDは必須）
      const createData = {...updateData, sateiID}

      const res = await doStandardPrisma('ucar', 'upsert', {
        where: {sateiID},
        create: createData,
        update: updateData,
      })

      //98番号が変更の場合
      if (numberChanged && res.success) {
        await updateNumber98IssueHistory({
          prevNumber98: prevRecord?.number98,
          newNumber98: number98,
        })
      }

      close()
      useRecordsReturn.updateData()
    }
  }

  return (
    <C_Stack>
      {/* <Paper>
        <InlineGarageEditor {...{row: ucar, setshowGarageRegister: null}} />
      </Paper> */}

      {/* 基本情報の編集 */}
      <div className={`w-[1140px]`}>
        <BasicForm
          {...{
            alignMode: 'rowBlock',
            latestFormData,
            onSubmit,
          }}
        >
          <div className={`sticky bottom-0 mx-auto w-full text-center `}>
            <Button color="blue" className={`w-[120px] p-2 text-xl`}>
              更新
            </Button>
          </div>
        </BasicForm>
      </div>
    </C_Stack>
  )
}
