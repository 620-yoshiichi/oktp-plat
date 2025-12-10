'use client'
import React, {useState} from 'react'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'

import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import {number98Item} from '@app/(apps)/ucar/(lib)/num98/getAvailable98Numbers'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {NumHandler} from '@cm/class/NumHandler'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {Fields} from '@cm/class/Fields/Fields'
import {Button} from '@cm/components/styles/common-components/Button'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {number98Select} from '@app/(apps)/ucar/(lib)/num98/num98Constants'

const SearchForm = () => {
  const [number98List, setnumber98List] = useState<number98Item[]>([])
  const {addQuery, query} = useGlobal()
  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: new Fields([
      //
      {id: `number98`, label: `98番号`, form: {defaultValue: query.number98}, type: 'text'},
    ]).transposeColumns(),
  })

  return (
    <ShadModal {...{Trigger: <Button>98番号検索</Button>}}>
      <BasicForm
        {...{
          latestFormData,
          onSubmit: async data => {
            if (!data.number98) {
              setnumber98List([])
              return
            }

            const {result} = await doStandardPrisma(`number98`, `findMany`, {
              select: number98Select,
              where: {
                number: {contains: data.number98},
              },
            })
            if (result) {
              setnumber98List(result)
            }
          },
        }}
      >
        <Button>検索</Button>
      </BasicForm>

      {number98List.length > 0 && <Num98Table {...{number98List}} />}
    </ShadModal>
  )
}

export default function Number98ListCC({
  nextNumber98,
  available98Numbers,
  nonAvailable98Numbers,
}: {
  nextNumber98: string
  available98Numbers: number98Item[]
  nonAvailable98Numbers: number98Item[]
}) {
  return (
    <div className={`p-4 mx-auto w-fit`}>
      <div>
        <C_Stack className={`mx-auto w-fit items-center`}>
          <R_Stack className={` justify-between w-[500px]`}>
            <strong> 次の番号:{nextNumber98}</strong>
            <SearchForm />
          </R_Stack>

          <div></div>
          <div>
            <R_Stack className={`gap-10`}>
              <div>
                利用可能な番号(最大50件):
                <Num98Table {...{number98List: available98Numbers}} />
              </div>
              <div>
                利用不可な番号(最大50件):
                <Num98Table {...{number98List: nonAvailable98Numbers}} />
              </div>
            </R_Stack>
          </div>

          <div></div>
        </C_Stack>
      </div>
    </div>
  )
}

const Num98Table = ({number98List}: {number98List: number98Item[]}) => {
  return CsvTable({
    records: number98List.map(item => {
      const ucarCount = item.Ucar.length
      const kobutsuCount = item.OldCars_Base.length

      const hasSomeNonPricedOldCars = item.OldCars_Base.some(oldCarsBase => Number(oldCarsBase.KI_HANKAKA) === 0)

      return {
        className: hasSomeNonPricedOldCars ? `[&_td]:!bg-red-100` : ``,
        csvTableRow: [
          //
          {label: 'number', cellValue: item.number},
          {
            label: 'Ucar',
            cellValue: (
              <ShadModal Trigger={<div className={ucarCount > 0 ? `t-link` : ``}>{ucarCount}</div>}>
                {CsvTable({
                  records: item.Ucar.map(ucar => {
                    return {
                      csvTableRow: [{label: 'sateiID', cellValue: ucar.sateiID}],
                    }
                  }),
                }).WithWrapper({className: `max-h-[70vh] min-w-[500px]`})}
              </ShadModal>
            ),
          },
          {
            label: 'OldCars_Base',
            cellValue: (
              <ShadModal Trigger={<div className={kobutsuCount > 0 ? `t-link` : ``}>{kobutsuCount}</div>}>
                <div>
                  {CsvTable({
                    records: item.OldCars_Base.map((oldCarsBase, i) => {
                      const kobutsuPrice = oldCarsBase.KI_HANKAKA ? Number(oldCarsBase.KI_HANKAKA) : 0

                      return {
                        csvTableRow: [
                          {label: 'NO_SIRETYUM', cellValue: oldCarsBase.NO_SIRETYUM ?? ''},
                          {label: 'NO_SYARYOU', cellValue: oldCarsBase.NO_SYARYOU ?? ''},
                          {label: 'DD_SIIRE', cellValue: formatDate(oldCarsBase.DD_SIIRE ?? '', 'YYYY/MM/DD')},
                          {label: '売上金額', cellValue: NumHandler.WithUnit(kobutsuPrice, '円') ?? ''},
                        ],
                      }
                    }),
                  }).WithWrapper({className: `max-h-[70vh] min-w-[500px]`})}
                </div>
              </ShadModal>
            ),
          },
        ],
      }
    }),
  }).WithWrapper({className: ``})
}
