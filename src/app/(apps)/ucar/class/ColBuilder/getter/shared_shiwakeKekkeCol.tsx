
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'
import {colType} from '@cm/types/col-types'

export const __shared_get_shiwakeKekkeCol = (): colType => ({
  id: 'destination',
  label: '仕分結果',
  form: {},
  td: {editable: {}},
  // format: (value, row) => {
  //   const codeItem = UCAR_CODE.SHIWAKE.byCode(row.destination)
  //   return (
  //     <Coloring mode="text" color={codeItem?.color}>
  //       {codeItem?.label}
  //     </Coloring>
  //   )
  // },
  forSelect: {
    codeMaster: UCAR_CODE.SHIWAKE,
  },
})
