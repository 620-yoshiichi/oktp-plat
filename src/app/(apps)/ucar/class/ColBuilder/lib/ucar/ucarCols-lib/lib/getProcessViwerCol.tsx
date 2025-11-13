import {Fields} from '@cm/class/Fields/Fields'

import {absSize} from '@cm/lib/methods/common'

import ProcessSummary from '@app/(apps)/ucar/(pages)/paperProcess/Summay/parts/ProcessSummary'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'

export const getProcessViwerCol = ({query}) => {
  const shiwakeCols = new Fields([
    {
      id: 'daihatsuReserve',
      label: 'ダイハツ予約枠',
      td: {
        hidden: true,
        getRowColor: (value, row) => {
          return UCAR_CODE.PROCESSED_AS.byCode(row.processedAs)?.color
        },
      },
    },

    {
      ...{id: 'destination', label: '仕分結果', form: {}},
      td: {hidden: true},
      forSelect: {
        optionsOrOptionFetcher: UCAR_CODE.SHIWAKE.array,
      },
    },
    {
      ...{id: 'storeToSend', label: '配布店舗', form: {}},
      td: {hidden: true},

      forSelect: {
        config: {
          modelName: `store`,
          orderBy: [{code: `asc`}],
          where: () => {
            return {OR: [{name: {contains: 'CHU BASE'}}, {name: {contains: 'ダイハツパーク'}}]}
          },
          nameChanger: op => ({...op, id: op.name, name: op.name}),
        },
      },
    },
  ]).buildFormGroup({groupName: `仕分関係`}).plain

  const mainProcessMasters = UcarProcessCl.CODE.array?.filter(process => process.list.includes(`main`))
  const subProcessMasters = UcarProcessCl.CODE.array?.filter(process => process.list.includes(`sub`))

  const ProcessMasterCols = new Fields([
    {
      id: 'AllProcesses',
      label: '加修工程',
      type: 'text',
      td: {style: {...absSize({width: 350})}},
      format: (value, row, col) => {
        const className = ``
        return <ProcessSummary {...{className, ucar: row, mainProcessMasters, subProcessMasters, query}} />
      },
    },
  ]).plain

  return {ProcessMasterCols, shiwakeCols}
}
