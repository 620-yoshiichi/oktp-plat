import {getColorStyles} from '@cm/lib/methods/colors'
import {Button} from '@cm/components/styles/common-components/Button'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
IconBtn

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'
import {ParameterCard} from '@cm/components/styles/common-components/ParameterCard'
import AutoGridContainer from '@cm/components/utils/AutoGridContainer'
import {generateColorCodeInRange} from '@cm/lib/methods/common'

const ProcessDetailOnUser = ({processArrayForUser, editModalOpen, seteditModalOpen}) => {
  return (
    <div className={`h-[50vh] overflow-y-auto`}>
      <AutoGridContainer maxCols={{sm: 1, md: 2, lg: 3, xl: 4}} className={`gap-4 p-4`}>
        {processArrayForUser
          .sort((a, b) => {
            return a.id - b.id
          })
          .map((process, i) => {
            const processColor = getColorStyles(process.ProcessNameMaster.color)
            const processTypeColor = BP_Car.const.processTypes.find(p => p.value === process.type)?.color ?? ''
            return (
              <ParameterCard
                key={i}
                {...{
                  styling: {
                    styles: {
                      wrapper: {
                        height: 140,
                        background: `${processColor.backgroundColor}70`,
                      },
                    },
                  },
                  label: (
                    <>
                      <div className={`float-right`}>
                        <Button onClick={() => seteditModalOpen(process)}>編集</Button>
                      </div>
                      <label>日時 / 時間 / 内容 / BP番号 / 車両</label>
                    </>
                  ),
                  value: (
                    <div>
                      <R_Stack className={`py-2`}>
                        <IconBtn>{formatDate(process.date)}</IconBtn>
                        <IconBtn style={{...getColorStyles(generateColorCodeInRange(process.time, 0, 5))}}>
                          {process.time}
                          <small>時間</small>
                        </IconBtn>
                        <IconBtn style={{...processColor}}>{process.ProcessNameMaster.name}</IconBtn>
                        <IconBtn>{process.Car?.bpNumber}</IconBtn>
                        <IconBtn>{process.Car?.carName}</IconBtn>
                        <IconBtn style={{...getColorStyles(processTypeColor)}}>{process.type}</IconBtn>
                      </R_Stack>
                    </div>
                  ),
                }}
              />
            )
          })}
      </AutoGridContainer>
    </div>
  )
}

export default ProcessDetailOnUser
