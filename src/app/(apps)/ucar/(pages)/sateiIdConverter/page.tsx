'use client'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Fields} from '@cm/class/Fields/Fields'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import React from 'react'
import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'
import useSWR from 'swr'

export default function page() {
  // const [TreeList, setTreeList] = useState<any[]>([])
  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: new Fields([
      //
      {
        id: `sateiID`,
        label: `変換前査定ID`,
        form: {...defaultRegister},
        type: 'text',
      },
    ]).transposeColumns(),
  })

  const key = latestFormData.sateiID
  const {data} = useSWR(key, async () => {
    return await UcarCL.getUpassFaimilyTree({sateiID: latestFormData.sateiID})
  })
  const {Tree = [], AlertComponent, lastSateiId} = data ?? {}

  return (
    <C_Stack className={` p-2 mx-auto w-fit`}>
      <BasicForm
        {...{
          alignMode: 'col',
          latestFormData,
          onSubmit: async data => {},
        }}
      >
        {/* <Button>査定IDのつながりを検索</Button> */}
      </BasicForm>

      <section>
        <C_Stack>
          {AlertComponent}

          {CsvTable({
            records: Tree.map(item => {
              return {
                csvTableRow: [
                  {label: '査定ID', cellValue: item?.sateiID},
                  {label: '査定日時', cellValue: formatDate(item.sateiDate, 'YYYY-MM-DD HH:mm:ss')},
                  {label: 'ルート査定ID', cellValue: item.rootSateiID},
                ],
              }
            }),
          }).WithWrapper({})}
        </C_Stack>
      </section>
    </C_Stack>
  )
}
