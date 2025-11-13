import {C_Stack, FitMargin, R_Stack} from '@cm/components/styles/common-components/common-components'
import {useGlobalModalForm} from '@cm/components/utils/modal/useGlobalModalForm'
import useLoader from '@cm/hooks/globalHooks/useLoader'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {atomTypes} from '@cm/hooks/useJotai'
import React, {useState} from 'react'

import BasicTabs from '@cm/components/utils/tabs/BasicTabs'

import SlotHistoryChecker, {generatePDF, getGaragePdfFormData} from '@app/(apps)/ucar/(pages)/garage/SlotHistoryChecker'

import {Button} from '@cm/components/styles/common-components/Button'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import {Alert, TextBlue} from '@cm/components/styles/common-components/Alert'
import GarageSlotMap from '@app/(apps)/ucar/(parts)/Garage/GarageSlotMap'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'
import {toast} from 'react-toastify'

export default function useGarageEditorGMF() {
  return useGlobalModalForm<atomTypes[`showGarageRegister`]>(`showGarageRegister`, null, {
    mainJsx: props => {
      return (
        <div>
          <GarageRegister
            {...{
              close: props.close,
              ucarId: props.GMF_OPEN?.ucar?.id,
              garageSlot: props.GMF_OPEN?.UcarGarageLocationMaster,
            }}
          />
        </div>
      )
    },
  })
}

export const GarageRegister = ({ucarId}) => {
  const [garageHistoryModal, setgarageHistoryModal] = useState<null | {ucarGarageSlotMasterId: number}>(null)

  const {data: GarageLocation = []} = useDoStandardPrisma(`ucarGarageLocationMaster`, `findMany`, {
    include: {UcarGarageSlotMaster: {orderBy: [{garageNumber: 'asc'}]}},
  })

  const {
    data: ucarFormDataBase,
    mutate: mutateUcarFormDataBase,
    isValidating,
  } = useDoStandardPrisma(`ucar`, `findUnique`, {
    where: {id: ucarId},
    include: {
      User: {},
      Store: {},
      UPASS: {},
      Number98: {},
      AppliedUcarGarageSlot: {
        include: {
          UcarGarageSlotMaster: {
            include: {
              UcarGarageLocationMaster: {},
            },
          },
        },
      },
    },
  })

  const {toggleLoad} = useLoader()
  const usedByCurrentCar = ucarFormDataBase?.AppliedUcarGarageSlot

  const CarInfo = () => {
    if (!ucarFormDataBase) return <></>

    const ucarInst = new UcarCL(ucarFormDataBase)

    return (
      <div className={`text-center font-bold text-lg flex gap-6`}>
        <span>{ucarInst.notation.brandName}</span>
        <span>{ucarInst.notation.modelName} </span>
        <span> {ucarInst.notation.plate}</span>
      </div>
    )
  }

  return (
    <div className={` w-[90vw]`}>
      <C_Stack>
        <FitMargin>
          <CarInfo />
          {usedByCurrentCar && !isValidating && (
            <>
              <Alert color="blue">
                <TextBlue className={` text-center font-bold`}>この車は、すでに車庫に登録されています。</TextBlue>
                <R_Stack>
                  <R_Stack className={` `}>
                    <small>車庫:</small>
                    <span className={`text-blue-main  font-bold`}>
                      {usedByCurrentCar.UcarGarageSlotMaster?.UcarGarageLocationMaster?.name}
                    </span>

                    <small>番号:</small>
                    <span className={`text-blue-main  font-bold`}>{usedByCurrentCar.UcarGarageSlotMaster?.garageNumber}</span>
                  </R_Stack>
                </R_Stack>
                <R_Stack className={` justify-end gap-2 w-full mx-auto`}>
                  <Button
                    color="red"
                    onClick={async () => {
                      if (!confirm('登録を削除しますか？名抹処理日も削除されます')) return
                      await toggleLoad(async () => {
                        await doStandardPrisma(`appliedUcarGarageSlot`, `delete`, {
                          where: {id: usedByCurrentCar.id},
                        })
                        // 作成日の登録
                        await doStandardPrisma('ucar', 'update', {
                          where: {id: ucarId},
                          data: {meihenMasshoShoribi: null},
                        })
                        mutateUcarFormDataBase()
                      })
                    }}
                  >
                    車庫登録削除
                  </Button>
                  <Button
                    onClick={async () => {
                      const formData = getGaragePdfFormData(ucarFormDataBase)
                      toast.success('PDFの発行が完了すると自動でタブが開きます。')
                      await generatePDF(formData)
                    }}
                  >
                    車庫証明PDF表示
                  </Button>
                </R_Stack>
              </Alert>
            </>
          )}
        </FitMargin>
        <div>
          <ShadModal open={!!garageHistoryModal} onOpenChange={setgarageHistoryModal}>
            <SlotHistoryChecker
              {...{
                setgarageHistoryModal,
                ucarGarageSlotMasterId: garageHistoryModal?.ucarGarageSlotMasterId,
              }}
            />
          </ShadModal>
        </div>
        <BasicTabs
          {...{
            id: `garageRegister`,
            showAll: false,
            style: {
              minWidth: '90vw',
            },
            TabComponentArray: GarageLocation.map(loc => {
              return {
                label: loc.name,
                component: (
                  <div key={loc.id}>
                    <GarageSlotMap
                      {...{
                        isValidating,
                        currentSlot: usedByCurrentCar?.UcarGarageSlotMaster,
                        loc,
                        ucar: ucarFormDataBase,
                        toggleLoad,
                        setgarageHistoryModal,
                        UcarGarageSlotMaster: loc.UcarGarageSlotMaster,
                        usedByCurrentCar,
                        mutateUcarFormDataBase,
                      }}
                    />
                  </div>
                ),
              }
            }),
          }}
        ></BasicTabs>
      </C_Stack>
    </div>
  )
}
