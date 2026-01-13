import React from 'react'

import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Prisma} from '@prisma/generated/prisma/client'

import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import AutoGridContainer from '@cm/components/utils/AutoGridContainer'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {Card} from '@cm/shadcn/ui/card'
import {TextGray, TextGreen, TextRed} from '@cm/components/styles/common-components/Alert'
import {isGarageSlotAvailable} from '@app/(apps)/ucar/(lib)/garage/garageUtils'
import {Button} from '@cm/components/styles/common-components/Button'

export default function GarageSlotMap({
  isValidating,
  currentSlot,
  loc,
  ucar,
  toggleLoad,
  setgarageHistoryModal,
  usedByCurrentCar,
  UcarGarageSlotMaster,
  mutateUcarFormDataBase,
}) {
  const {data: AppliedUcarGarageSlot, isLoading} = useDoStandardPrisma(`appliedUcarGarageSlot`, `findMany`, {
    where: {
      ucarGarageSlotMasterId: {
        in: UcarGarageSlotMaster.map(slot => slot.id),
      },
    },
    include: {
      Ucar: {
        include: {
          OldCars_Base: {select: {KI_HANKAKA: true}},
        },
      },
    },
  })

  if (!AppliedUcarGarageSlot || isLoading || isValidating) {
    return <PlaceHolder>Loading...</PlaceHolder>
  }

  return (
    <div>
      <div>
        <Card className={` p-3`}>
          <AutoGridContainer
            {...{
              className: 'gap-4 max-h-[55vh] overflow-y-auto ',
              maxCols: {
                md: 6,
                lg: 8,
              },
            }}
          >
            {UcarGarageSlotMaster.map((slot, i) => {
              const isCurrentSlot = currentSlot?.id === slot.id
              const slothistory = AppliedUcarGarageSlot.filter(data => {
                return data.ucarGarageSlotMasterId === slot.id
              })
              // 空きではない（使用中）スロットをフィルタリング
              const occupiedSlotList = slothistory.filter(slot => !isGarageSlotAvailable(slot))

              const occupiedSlotCount = occupiedSlotList.length
              const totalSLotCount = slothistory.length

              const Status =
                occupiedSlotCount === 0
                  ? {
                      available: true,
                      label: '空き',
                    }
                  : {
                      available: false,
                      label: '利用中',
                    }

              return (
                <C_Stack
                  key={i}
                  className={` border rounded gap-1 p-1.5
                    ${Status.available ? 'border-2 border-yellow-500 bg-yellow-50' : 'opacity-30'}
                    ${isCurrentSlot ? 'bg-blue-50 border-blue-500 border-2' : ''}
                    `}
                >
                  <R_Stack className={`  justify-between `}>
                    <R_Stack className={`gap-0.5`}>
                      <small>{loc.name}No.</small>
                      <div className={`text-center  font-bold text-lg `}>{slot.garageNumber}</div>
                    </R_Stack>
                    <div>
                      <span
                        onClick={async () => {
                          if (totalSLotCount === 0) {
                            alert('この車庫の利用登録履歴はありません。')
                            return
                          }

                          setgarageHistoryModal({ucarGarageSlotMasterId: slot.id})
                        }}
                        className={totalSLotCount > 0 ? 't-link cursor-pointer text-lg' : 'opacity-30'}
                      >
                        ({totalSLotCount})
                      </span>
                    </div>
                  </R_Stack>

                  <R_Stack className={` justify-end gap-1`}>
                    {/* <span className={occupiedSlotCount > 0 ? '' : 'opacity-30'}>{occupiedSlotCount}</span>
                    <small>/ </small> */}
                  </R_Stack>
                  <R_Stack className={` justify-end `}>
                    <div>
                      {isCurrentSlot ? (
                        <TextGreen className={` font-bold`}>適応中</TextGreen>
                      ) : Status.available ? (
                        currentSlot?.id ? (
                          <TextGray>{Status.label}</TextGray>
                        ) : (
                          <Button
                            size="sm"
                            className={usedByCurrentCar ? 'disabled' : ''}
                            onClick={async () => {
                              const query: Prisma.AppliedUcarGarageSlotCreateArgs = {
                                data: {
                                  appliedAt: new Date().toISOString(),
                                  UcarGarageSlotMaster: {connect: {id: slot.id}},
                                  Ucar: {connect: {id: ucar.id}},
                                },
                                include: {
                                  UcarGarageSlotMaster: {
                                    include: {
                                      UcarGarageLocationMaster: {},
                                    },
                                  },
                                },
                              }

                              if (!confirm(`発行しますか？`)) return
                              await toggleLoad(async () => {
                                const {result: appliedSlot} = await doStandardPrisma(`appliedUcarGarageSlot`, `create`, {
                                  include: query.include,
                                  data: query.data,
                                })

                                const {UcarGarageLocationMaster, garageNumber} = appliedSlot?.UcarGarageSlotMaster ?? {}
                                alert(
                                  `車庫証明書を発行しました。車庫番号：${garageNumber} 場所：${UcarGarageLocationMaster.name}`
                                )
                                mutateUcarFormDataBase()
                              })
                            }}
                          >
                            発行
                          </Button>
                        )
                      ) : (
                        <TextRed className={`text-xs`}>{Status.label}</TextRed>
                      )}

                      {/* {occupiedSlotCount === 0 ? (
                        <NotAvailable
                          reason={``}
                          alertOnClick={`すでに車庫が登録されています`}
                          isAvailable={usedByCurrentCar === null}
                        >

                        </NotAvailable>
                      ) : (
                        `利用中`
                      )} */}
                    </div>
                  </R_Stack>
                </C_Stack>
              )
            })}
          </AutoGridContainer>
        </Card>
      </div>
    </div>
  )
}
