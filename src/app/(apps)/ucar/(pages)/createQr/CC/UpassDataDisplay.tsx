'use client'

import {UPASS} from '@prisma/client'
import {upassCols} from '@app/(apps)/ucar/files/upass/upass-columns'

import {R_Stack} from '@cm/components/styles/common-components/common-components'

import AutoGridContainer from '@cm/components/utils/AutoGridContainer'

export const UpassDataDisplay = ({upassData}: {upassData: UPASS}) => {
  const fields = upassCols.filter(col => col.showIn?.qrCreate)

  return (
    <div className={`p-2 `}>
      <AutoGridContainer {...{maxCols: {xl: 1}, className: 'max-w-[1200px] gap-4 gap-y-8'}}>
        {fields.map(field => {
          const value = upassData?.[field.en as keyof UPASS] ?? 'データがありません'
          return (
            <R_Stack key={field.en} className={`border-b gap-4 `}>
              <div className="font-semibold text-gray-800 text-xl">
                {field.showIn?.qrCreate?.label}
              </div>
              <div className="text-gray-700">
                {value && value !== 'データがありません' ? (
                  String(value)
                ) : (
                  <span className="text-gray-300">―</span>
                )}
              </div>
            </R_Stack>
          )
        })}
      </AutoGridContainer>
    </div>
  )
}








