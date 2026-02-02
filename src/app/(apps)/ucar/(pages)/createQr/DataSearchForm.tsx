'use client'
import { Fields } from '@cm/class/Fields/Fields'

import { Button } from '@cm/components/styles/common-components/Button'

import { R_Stack } from '@cm/components/styles/common-components/common-components'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import { useCallback } from 'react'
import { isDev } from '@cm/lib/methods/common'
import { UcarCL } from '@app/(apps)/ucar/class/UcarCL'

export const useDataSearchForm = ({ sateiID, setsateiID }: { sateiID: string; setsateiID: (sateiID: string) => void }) => {
  const columns = Fields.transposeColumns([
    {
      id: 'sateiID',
      label: '査定ID',
      type: 'text',
      form: {
        defaultValue: sateiID ?? (isDev ? UcarCL.testSateiID : ''),

      },
    },
  ])
  const { BasicForm, latestFormData, formRef } = useBasicFormProps({
    columns,
    values: {},
  })

  const DataSearchForm = useCallback(() => {
    return (
      <R_Stack>
        <BasicForm
          alignMode="row"
          latestFormData={latestFormData}
          onSubmit={async data => {
            if (String(data.sateiID).startsWith('T')) {
              alert('「T」で始まる値は使用できません。AI査定またはUPASSの査定番号を入力してください。')
              return
            }
            const { result: foundInDb } = await doStandardPrisma('ucar', 'findUnique', {
              where: { sateiID: String(data.sateiID) },
              include: { UPASS: {} },
            })

            if (foundInDb) {
              setsateiID(data.sateiID)

              return { foundInDb }
            } else {
              const { result: foundInUpass } = await doStandardPrisma('uPASS', 'findUnique', {
                where: { sateiID: String(data.sateiID) },
              })

              if (foundInUpass) {
                setsateiID(data.sateiID)
                return { foundInUpass }
              } else {
                // UPASSにデータがない場合、Ucarデータは作成せず、入力フォームで入力してもらう
                setsateiID(data.sateiID)
                return { foundInUpass: null }
              }

              // return {rows}
            }
          }}
          {...{ ControlOptions: { ControlStyle: { width: 200 } } }}
        >
          <Button>検索</Button>
        </BasicForm>
      </R_Stack>
    )
  }, [])
  return {
    sateiID_Input: latestFormData?.sateiID,
    DataSearchForm,
  }
}
