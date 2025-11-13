'use client'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {CssString} from '@cm/components/styles/cssString'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import {ColoredText} from '@cm/components/styles/common-components/colors'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import {AppliedUcarGarageSlot, Number98, Prisma, Ucar, UcarGarageLocationMaster, UcarGarageSlotMaster} from '@prisma/client'

type locationInfoType = {
  locationName: string
  address: string
  to: string
}

export default function SlotHistoryChecker({setgarageHistoryModal, ucarGarageSlotMasterId}) {
  const {toggleLoad, query} = useGlobal()
  const args: Prisma.AppliedUcarGarageSlotFindManyArgs = {
    where: {ucarGarageSlotMasterId},
    include: {
      Ucar: {
        include: {
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
      },
    },
  }
  const {data: AppliedUcarGarageSlot, isLoading} = useDoStandardPrisma(`appliedUcarGarageSlot`, `findMany`, args)

  if (!AppliedUcarGarageSlot || isLoading) {
    return <PlaceHolder />
  }

  return (
    <table className={` t-paper table-wrapper rounded text-center ${CssString.table.borderCerlls}`}>
      <thead>
        <tr>
          <th>査定ID</th>
          <th>98番号</th>
          <th>車種</th>
          <th>車台番号</th>
          <th>申請日</th>
          <th>利用状況</th>
          <th>車庫PDF</th>
        </tr>
      </thead>
      <tbody>
        {AppliedUcarGarageSlot?.map((slot, i) => {
          const ucar = slot?.Ucar

          const formData = getGaragePdfFormData(ucar)

          return (
            <tr key={i}>
              <td>{ucar.sateiID}</td>
              <td>{ucar?.Number98?.number}</td>
              <td>{ucar.brand_name}</td>
              <td>{ucar.Barracks}</td>
              {/* <td>{ucar.}</td> */}
              <td>{formatDate(slot.appliedAt)}</td>
              <td>
                <button
                  onClick={async () => {
                    toggleLoad(async () => {
                      await doStandardPrisma(`appliedUcarGarageSlot`, `update`, {
                        where: {id: slot.id},
                        data: {finishedAt: slot.finishedAt ? null : new Date().toISOString()},
                      })
                      setgarageHistoryModal(null)
                    })
                  }}
                >
                  <ColoredText className={`text-center`} bgColor={slot.finishedAt ? `green` : `red`}>
                    {slot.finishedAt ? `利用終了` : `使用中`}
                  </ColoredText>
                </button>
              </td>
              <td>
                <button
                  className={`t-link`}
                  onClick={async () => {
                    toggleLoad(async () => {
                      await generatePDF(formData)
                    })
                  }}
                >
                  PDF
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export const getGaragePdfFormData = (
  ucar: Ucar & {
    AppliedUcarGarageSlot: AppliedUcarGarageSlot & {
      UcarGarageSlotMaster: UcarGarageSlotMaster & {
        UcarGarageLocationMaster: UcarGarageLocationMaster
      }
    }
    Number98: Number98
  }
) => {
  const GarageLocation = ucar?.AppliedUcarGarageSlot?.UcarGarageSlotMaster?.UcarGarageLocationMaster
  const GarageNumber = ucar?.AppliedUcarGarageSlot?.UcarGarageSlotMaster?.garageNumber

  const locations: Record<string, locationInfoType> = {
    岡山: {
      locationName: `okayama`,
      address: `岡山県岡山市南区古新田1233-2`,
      to: `岡山南 警察署長`,
    },
    倉敷: {
      locationName: `kurashiki`,
      address: `倉敷市中島668` + ' No.' + GarageNumber,
      to: `倉敷 警察署長`,
    },
  }
  const locationInfo: locationInfoType = locations[GarageLocation?.name]

  const formData = {
    location: locationInfo.locationName,
    position: String(GarageNumber),
    textbox1: ucar?.brand_name ?? '',
    textbox2: ucar.Common_name_model,
    textbox3: String(ucar.Barracks ?? ''),
    textbox4: String(ucar.Vehicle_length ?? ''),
    textbox5: String(ucar.Vehicle_width ?? ''),
    textbox6: String(ucar.Vehicle_height ?? ''),
    textbox7: locationInfo.address,
    textbox8: '同上',
    textbox9: '',
    textbox10: locationInfo.to,
    textbox11: new Date().getFullYear().toString(),
    textbox12: new Date().getMonth().toString() + 1,
    textbox13: new Date().getDate().toString(),
    textbox14: '岡山市北区伊福町1丁目20番12号',
    textbox15: '086',
    textbox16: '897',
    textbox17: '1004',
    textbox18: '岡山トヨペット株式会社',
    textbox19: '代表取締役 末長 一範',
    textbox20: '岡山トヨペット株式会社',
    textbox21: '897',
    textbox22: '1004',
  }
  console.debug(formData)
  return formData
}
export const generatePDF = async formData => {
  try {
    const credentials = btoa('admin:password1234')
    const response = await fetch('https://asia-northeast1-qr-pdf-support.cloudfunctions.net/generatePDF2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      throw new Error('PDF生成に失敗しました')
    }

    const blob = await response.blob()
    // 新規ウィンドウでPDFを表示
    window.open(URL.createObjectURL(blob), '_blank')
  } catch (error) {
    console.error('エラー:', error.message)
    alert('PDFのプレビューに失敗しました')
  }
}
