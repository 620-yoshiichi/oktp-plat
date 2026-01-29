import React from 'react'
import { C_Stack, Padding, R_Stack } from '@cm/components/styles/common-components/common-components'

import { ChartBarIcon } from '@heroicons/react/20/solid'

import { Alert } from '@cm/components/styles/common-components/Alert'
import { CircledIcon, IconBtn } from '@cm/components/styles/common-components/IconBtn'
import { atomTypes, useJotaiByKey } from '@cm/hooks/useJotai'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import { TitleDescription } from '@cm/components/utils/Notation'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
const minBarCount = 6

const WaitingCarVisualizer = React.memo((props: { waitingListObject: any }) => {
  const { waitingListObject } = props

  const [isOpen, setisOpen] = useJotaiByKey<any>(`waitingCarVisualizerOpen`, true)
  // const [isOpen, setisOpen] = useState(true)

  const { groupedByDamage = [], damages = [] } = waitingListObject

  const CapacityCahrt = () => {
    const periodsInDate = 25
    const dataSourceArr = damages
      .filter(d => d.name !== 'QR')
      .map(d => {
        return {
          key: d.name,
          capacityPerDay: d.carPerDay,
        }
      })

    return (
      <div>
        <C_Stack>
          <TitleDescription
            className={`t-alert border-primary-main bg-blue-50`}
            {...{
              title: `作業許容量と充足度`,
              description: (
                <C_Stack>
                  <div>
                    <R_Stack>
                      この先
                      <Alert color="sub" className={`w-fit`}>
                        {periodsInDate}
                      </Alert>
                      日における、ダメージ別の作業
                      <Alert color="green">許容量（台数/日）</Alert>
                      を表示。
                    </R_Stack>
                  </div>
                  {/* <p className={`text-error-main text-lg font-bold`}>バーが示す日数先が納車目安です。</p> */}

                  <p className={`text-error-main`}>引取が完了できてない車、見積りができていない車は除きます</p>
                </C_Stack>
              ),
            }}
          />

          {CsvTable({
            records: dataSourceArr.map(source => {
              const { key, capacityPerDay } = source
              const damage = damages.find(d => {
                return d?.name === key
              })

              const count = groupedByDamage.find(g => g.damageNameMasterId === damage.id)?._count?.id ?? 0

              const dateCount = Math.max(Math.round(count / capacityPerDay)) + minBarCount

              const data = {
                name: damage?.name,
                realcount: count,
                count: dateCount,
                color: damage?.color,
              }
              return {
                csvTableRow: [
                  {
                    label: 'ダメージ',
                    cellValue: <IconBtn {...{ vivid: true, color: damage.color }}>{damage.name}</IconBtn>,
                  },
                  { label: '作業中台数', cellValue: data.realcount + '台' },
                  { label: '納期目安', cellValue: data.count + '日後' },
                  { label: '許容量', cellValue: source.capacityPerDay + '台/日' },
                ],
              }
            }),
          }).WithWrapper({})}
          {/* <C_Stack className={`gap-4 p-2`}>
            {dataSourceArr.map(source => {
              const {key, capacityPerDay} = source
              const damage = damages.find(d => {
                return d?.name === key
              })

              const count = groupedByDamage.find(g => g.damageNameMasterId === damage.id)?._count?.id ?? 0

              const dateCount = Math.max(Math.round(count / capacityPerDay)) + minBarCount

              const data = {
                name: damage?.name,
                realcount: count,
                count: dateCount,
                color: damage?.color,
              }

              return (
                <div key={key}>
                  <>
                    <R_Stack>
                      <IconBtn
                        {...{
                          vivid: true,
                          color: damage.color,
                        }}
                      >
                        {damage.name}
                      </IconBtn>
                      <ParameterCard label={'作業中台数'} value={`${data.realcount}台`} />
                      <ParameterCard label={'納期目安'} value={`${data.count}日後`} />
                      <R_Stack>
                        許容量:
                        <Alert color="green">{capacityPerDay}</Alert>
                        台/日
                      </R_Stack>
                    </R_Stack>
                  </>
                </div>
              )
            })}
          </C_Stack> */}
          <Alert className={`text-sm `}>
            ai21での移管作業後、CRで現車点検後、本システムで受け入れがなされたデータのみを対象としています。
          </Alert>
        </C_Stack>
      </div>
    )
  }

  return (
    <div className={``}>
      <CircledIcon onClick={() => setisOpen(true)} className={`bg-yellow-main border-yellow-700 text-yellow-700`}>
        <ChartBarIcon />
      </CircledIcon>

      <ShadModal
        {...{
          alertOnClose: false,
          open: isOpen,
          onOpenChange: () => setisOpen(false),
        }}
      >
        <Padding>
          <CapacityCahrt />
        </Padding>
      </ShadModal>
    </div>
  )
})

export default WaitingCarVisualizer
