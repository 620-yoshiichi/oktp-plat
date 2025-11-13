import {Shinren} from '@app/(apps)/shinren/class/Shinren'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
IconBtn
import {getColorStyles} from '@cm/lib/methods/colors'
import {useCallback, useState} from 'react'

export const useDataTypeToggler = () => {
  const activeInfoTypeOrigins = Shinren.constants.calendarDataTypes.map(v => v.value)
  const [activeInfoType, setactiveInfoType] = useState<any[]>(activeInfoTypeOrigins)
  const toggleActiveInfoType = (value: string) => {
    const isActive = activeInfoType?.includes(value)
    if (isActive) {
      const newActiveInfoType = activeInfoType.filter(v => v !== value)
      setactiveInfoType(newActiveInfoType)
    } else {
      setactiveInfoType([...activeInfoType, value])
    }
  }

  const DataTypeToggler = useCallback(() => {
    return (
      <R_Stack>
        {Shinren.constants.calendarDataTypes.map((data, index) => {
          const isActive = activeInfoType?.includes(data.value)
          return (
            <div key={index} onClick={() => toggleActiveInfoType(data.value)}>
              <IconBtn className={isActive ? '' : 'opacity-30'} style={{...getColorStyles(data.color)}}>
                {data.name}
              </IconBtn>
            </div>
          )
        })}
      </R_Stack>
    )
  }, [activeInfoType, toggleActiveInfoType])

  return {
    activeInfoType,
    toggleActiveInfoType,
    DataTypeToggler,
  }
}
