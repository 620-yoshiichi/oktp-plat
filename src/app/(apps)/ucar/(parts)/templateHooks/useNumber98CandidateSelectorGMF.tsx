'use client'
import { Button } from '@cm/components/styles/common-components/Button'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { useGlobalModalForm } from '@cm/components/utils/modal/useGlobalModalForm'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import { atomKey } from '@cm/hooks/useJotai'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { toUtc } from '@cm/class/Days/date-utils/calculations'

export default function useNumber98CandidateSelectorGMF() {
  return useGlobalModalForm<{ number98: string; sateiID: string }>(`useNumber98CandidateSelectorGMF` as atomKey, null, {
    mainJsx: props => {
      const { number98, sateiID } = props?.GMF_OPEN

      return (
        <div>
          <Selector
            {...{
              number98,
              sateiID,
              close: props.close,
            }}
          />
        </div>
      )
    },
  })
}

const Selector = ({ number98, sateiID, close }) => {
  const { router } = useGlobal()
  const { data = [] } = useDoStandardPrisma('oldCars_Base', `findMany`, {
    where: {
      NO_SYARYOU: number98,
    },
    include: {
      Ucar: {},
    },
  })

  return (
    <div>
      {CsvTable({
        records: data.sort((a, b) => {
          return a.DD_SIIRE.getTime() - b.DD_SIIRE.getTime()
        }).map(item => {



          const linkedToOtherCar = item?.Ucar?.sateiID && item?.Ucar?.sateiID !== sateiID

          const thisCarInLinked = item?.Ucar?.sateiID && (item?.Ucar?.sateiID === sateiID)


          return {
            className: `${linkedToOtherCar ? 'bg-gray-100' : thisCarInLinked ? 'bg-green-300' : ''}`,
            csvTableRow: [
              //
              { label: '98番号', cellValue: item.NO_SYARYOU },
              { label: '仕入日', cellValue: formatDate(item.DD_SIIRE) },
              { label: '仕入時注文番号', cellValue: item.NO_SIRETYUM },
              { label: '車台番号', cellValue: item.NO_SYADAIBA },
              { label: '車名', cellValue: item.MJ_SYAMEI },
              { label: '売上', cellValue: item.KI_HANKAKA },
              {
                label: '連携先査定ID',
                cellValue: <div>


                  {thisCarInLinked ? `自車連携【${sateiID}】` : ''}
                  {linkedToOtherCar ? `他車連携【${item?.Ucar?.sateiID}】` : ''}


                </div>,
                className: `text-center `,
              },
              {
                label: '選択',
                cellValue: (
                  <Button
                    onClick={async () => {
                      if (linkedToOtherCar) {
                        alert('他の車両紐との紐付けを解除してから、連携してください。')
                        return
                      }
                      const data = {
                        number98: item.NO_SYARYOU,
                        NO_SIRETYUM: item.NO_SIRETYUM,
                        DD_SIIRE: toUtc(formatDate(item.DD_SIIRE)),
                      }

                      await doStandardPrisma('ucar', 'update', {
                        where: { sateiID: sateiID },
                        data,
                      })

                      router.refresh()
                      close()
                    }}
                  >
                    選択
                  </Button>
                ),
              },
            ],
          }
        }),
      }).WithWrapper({ className: 'min-w-[1000px]' })}
    </div>
  )
}

export const Number98CandidateSelectorSwitch = ({ number98, sateiID }) => {
  const GMF_Number98CandidateSelector = useNumber98CandidateSelectorGMF()
  return (
    <div>
      <Button size='xs' onClick={() => GMF_Number98CandidateSelector.setGMF_OPEN({ number98, sateiID })}>98連携</Button>
    </div>
  )
}
