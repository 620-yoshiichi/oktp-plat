'use client'

import {ucarData} from '@app/(apps)/ucar/class/UcarCL'
import {upassCols} from '@app/(apps)/ucar/files/upass/upass-columns'

import {R_Stack} from '@cm/components/styles/common-components/common-components'

import AutoGridContainer from '@cm/components/utils/AutoGridContainer'

import useWindowSize from '@cm/hooks/useWindowSize'

// export const WhenCreatingNewCar = ({ucar, router}) => {
//   return (
//     <R_Stack className={`mx-auto items-start`}>
//       <Paper>
//         <AiSateiDataDisplay {...{ucar}}></AiSateiDataDisplay>
//       </Paper>
//     </R_Stack>
//   )
// }

export const AiSateiDataDisplay = (props: {ucar: ucarData; cols?: any[]; wrapperWidth?: number}) => {
  const {width} = useWindowSize()
  const {
    ucar,
    // cols = [
    //   // 'Assessment_ID', `brand_name`, `Grade_name`, `Mission_name`, 'Model_name', 'Barracks', `Model_year`
    // ],
    wrapperWidth = Math.min(width ?? 0 / 2, 1000),
  } = props

  // const targetCols = sateiColOrigin.filter(obj => {
  //   const hit = cols === undefined ? true : cols?.includes(obj.id)

  //   return hit
  // })

  const fields = upassCols.filter(col => col.showIn?.qrCreate)
  // [
  //   {id: 'sateiID', label: '査定ID', type: 'text', form: {}},
  //   {id: 'brandName', label: 'ブランド名', type: 'text', form: {}},
  //   {id: 'grade', label: 'グレード名', type: 'text', form: {}},
  //   {id: 'type', label: '型式', type: 'text', form: {}},
  //   {id: 'commonType', label: '通称型式', type: 'text', form: {}},
  //   {id: 'transmissionType', label: 'ミッション名称', type: 'text', form: {}},
  //   {id: 'frameNumber', label: 'フレーム番号', type: 'text', form: {}},
  //   // {id: 'mission_name', label: 'ミッション名', type: 'text', form: {}},
  //   // {id: 'modelName', label: '車種名', type: 'text', form: {}},
  //   // {id: 'Barracks', label: '車台番号', type: 'text', form: {}},
  //   // {id: 'Model_year', label: 'モデル年式', type: 'text', form: {}},
  // ]

  return (
    <div className={`p-2 `}>
      <AutoGridContainer {...{maxCols: {xl: 1}, className: 'max-w-[1200px] gap-4 gap-y-8'}}>
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
