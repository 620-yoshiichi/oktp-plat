'use client'

import {NEW_CAR_CONST} from '@app/(apps)/newCar/(constants)/newCar-constants'
import PenadingCarTableList from '@app/(apps)/newCar/(pages)/crOperation/PenadingCarTableList'

import ScheduledCarTable from '@app/(apps)/newCar/(pages)/crOperation/ScheduledCarTable'
import {NewCarClass} from '@app/(apps)/newCar/class/NewCarClass/NewCarClass'
import {useCrScheduleSwitcherModal} from '@app/(apps)/newCar/templateHooks/useCrScheduleSwitcherModal'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Fields} from '@cm/class/Fields/Fields'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {LabelValue} from '@cm/components/styles/common-components/ParameterCard'

import Accordion from '@cm/components/utils/Accordions/Accordion'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useLocalLoading from '@cm/hooks/globalHooks/useLocalLoading'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import {NewCar} from '@prisma/client'
import React, {useState} from 'react'

export default function CrOperationCC({crHolidays, from, to, newCars, pendingCars}) {
  const {asPath} = useGlobal()
  const CrScheduleSwitcherModal_HK = useCrScheduleSwitcherModal()

  return (
    <C_Stack>
      <R_Stack className={` items-start`}>
        <NewDateSwitcher />
        <SerachForm />
        <Marker />
      </R_Stack>

      <R_Stack className={`flex-nowrap items-start  justify-start `}>
        <Accordion {...{label: `作業着工予定リスト`, closable: false, defaultOpen: true}}>
          <div>
            <small>各日付に着工予定の車が「注文番号」で並んでいます。</small>
            <ScheduledCarTable {...{from, to, crHolidays, newCars, CrScheduleSwitcherModal_HK}} />
          </div>
        </Accordion>
        <C_Stack>
          <Accordion {...{label: `保留リスト`, closable: false, defaultOpen: true}}>
            <div className={``}>
              <PenadingCarTableList {...{pendingCars, crHolidays, CrScheduleSwitcherModal_HK}} />
            </div>
          </Accordion>
        </C_Stack>
      </R_Stack>
    </C_Stack>
  )
}

const Marker = () => {
  const {
    CR_OPERATION: {ALERT_COLORS, STATUS_COLORS},
  } = NEW_CAR_CONST

  return (
    <R_Stack className={`gap-10`}>
      <R_Stack>
        {ALERT_COLORS.map((d, i) => (
          <div key={i}>
            <IconBtn {...{vivid: true, color: d.color}}>{d.value}</IconBtn>
          </div>
        ))}
      </R_Stack>

      <R_Stack>
        {STATUS_COLORS.map((d, i) => (
          <div key={i}>
            <div
              {...{
                style: {
                  padding: `1px 4px`,
                  fontSize: 14,
                  border: `4px ridge ${d.color}`,
                },
              }}
            >
              {d.value}
            </div>
          </div>
        ))}
      </R_Stack>
    </R_Stack>
  )
}

const SerachForm = () => {
  const {toggleLocalLoading, LocalLoader} = useLocalLoading()
  const [selectedCar, setselectedCar] = useState<NewCar[] | null>(null)
  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: new Fields([
      //
      {id: `NO_CYUMON`, label: `注文番号`, form: {}},
    ]).transposeColumns(),
  })

  return (
    <div>
      <LocalLoader />
      <ShadModal
        {...{
          open: !!selectedCar,
          onOpenChange: setselectedCar,
        }}
      >
        <C_Stack>
          {selectedCar?.map(car => {
            const newCarCl = new NewCarClass(car)
            const pendingDate = newCarCl.chakko.getPendingDateOrDD_SAGTYYO()

            return (
              <div key={car.id}>
                <LabelValue {...{label: `注文番号`}}>{car.NO_CYUMON}</LabelValue>
                <LabelValue {...{label: `車名`}}>{car.KJ_KURUMAME}</LabelValue>
                <LabelValue {...{label: `着工予定`}}>{formatDate(pendingDate)}</LabelValue>
                <LabelValue {...{label: `登録予定`}}>{formatDate(newCarCl.car.lastApprovedDesiredTorokuDate)}</LabelValue>
              </div>
            )
          })}
        </C_Stack>
      </ShadModal>
      <div className={`w-fit`}>
        <BasicForm
          {...{
            latestFormData,
            alignMode: `row`,
            onSubmit: async data => {
              toggleLocalLoading(async () => {
                const {result: cars} = await doStandardPrisma(`newCar`, `findMany`, {
                  where: {NO_CYUMON: {contains: data.NO_CYUMON}},
                  include: {
                    ...NEW_CAR_CONST.CR_OPERATION.INCLUDE,
                    CrInspectionHistory: {},
                  },
                })

                if (cars.length > 0) {
                  setselectedCar(cars)
                }
              })
            },
          }}
        >
          <Button>検索</Button>
        </BasicForm>
      </div>
    </div>
  )
}
