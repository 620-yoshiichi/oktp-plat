'use client'

import { ucarData } from '@app/(apps)/ucar/class/UcarCL'
import { upassCols } from '@app/(apps)/ucar/files/upass/upass-columns'

import { R_Stack } from '@cm/components/styles/common-components/common-components'

import AutoGridContainer from '@cm/components/utils/AutoGridContainer'


// export const WhenCreatingNewCar = ({ucar, router}) => {
//   return (
//     <R_Stack className={`mx-auto items-start`}>
//       <Paper>
//         <AiSateiDataDisplay {...{ucar}}></AiSateiDataDisplay>
//       </Paper>
//     </R_Stack>
//   )
// }

export const AiSateiDataDisplay = (props: { ucar: ucarData; cols?: any[]; wrapperWidth?: number }) => {
  const { ucar, } = props



  const fields = upassCols.filter(col => col.showIn?.qrCreate)

  return (
    <div className={`p-2 `}>
      <AutoGridContainer {...{ maxCols: { xl: 1 }, className: 'max-w-[1200px] gap-4 gap-y-8' }}>
        {fields.map(field => {
          const value = ucar?.UPASS?.[field.en] ?? 'データがありません'
          return (
            <R_Stack key={field.en} className={`border-b gap-4 `}>
              <div
                className="
                font-semibold text-gray-800 text-xl"
              >
                {field.showIn?.qrCreate?.label}
              </div>
              <div
                className="
                text-gray-700

              "
              >
                {value ?? <span className="text-gray-300">―</span>}
              </div>
            </R_Stack>
          )
        })}
      </AutoGridContainer>
    </div>
  )
}
