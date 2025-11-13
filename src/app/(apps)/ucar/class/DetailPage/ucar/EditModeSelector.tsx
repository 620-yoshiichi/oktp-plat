'use client'

import {DetailPagePropType} from '@cm/types/types'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

import {getQueryIds} from '@cm/lib/methods/urls'

import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'

const EditModeSelector = (props: DetailPagePropType) => {
  const {router, pathname, addQuery, query} = props.useGlobalProps
  const displayColumns = UCAR_CODE.DISPLAY_COLUMNS.array.map(d => {
    return {...d, value: d.label}
  })
  const {chechIsActive, idsArrToString} = getQueryIds({
    query,
    queryKey: `displayColumns`,
    data: displayColumns,
    dataId: `value`,
  })

  return (
    <div>
      <R_Stack>
        {displayColumns.map((item, index) => {
          const {isActive, toQueryStr} = chechIsActive(item, `value`)

          return (
            <IconBtn
              key={index}
              rounded={false}
              onClick={() => addQuery({displayColumns: toQueryStr})}
              className={`w-fit  cursor-pointer text-xs`}
              active={isActive}
              color={item.color}
              // style={{...getColorStyles(item.color)}}
            >
              {item.value}
            </IconBtn>
          )
        })}
      </R_Stack>
    </div>
  )
}

export default EditModeSelector
