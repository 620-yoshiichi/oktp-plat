import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'

export const IsActiveDisplay = (query: any, key: `商品化` | `下取書類` | `自動車税`) => {
  const displayColumns = String(query.displayColumns).split(',')

  if (displayColumns.includes(key)) {
    return UCAR_CODE.DISPLAY_COLUMNS.array.find(d => d.label === key)
  }
}
