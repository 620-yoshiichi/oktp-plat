'use client'

import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { CssString } from '@cm/components/styles/cssString'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import { ColoredText } from '@cm/components/styles/common-components/colors'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import {
  AppliedUcarGarageSlot,
  Number98,
  Prisma,
  Ucar,
  UcarGarageLocationMaster,
  UcarGarageSlotMaster,
} from '@prisma/generated/prisma/client'
import { UcarCL } from '@app/(apps)/ucar/class/UcarCL'
import { getGarageSlotStatusLabel } from '@app/(apps)/ucar/(lib)/garage/garageUtils'

type locationInfoType = {
  locationName: string
  address: string
  to: string
  garageNumber: string
}

export default function SlotHistoryChecker({ setgarageHistoryModal, ucarGarageSlotMasterId }) {
  const { toggleLoad, query } = useGlobal()
  const args: Prisma.AppliedUcarGarageSlotFindManyArgs = {
    where: { ucarGarageSlotMasterId },
    include: {
      Ucar: {
        include: {
          Number98: {},
          OldCars_Base: { select: { KI_HANKAKA: true } },
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
  const {
    data: AppliedUcarGarageSlot,
    isLoading,
    mutate: mutateAppliedUcarGarageSlot,
  } = useDoStandardPrisma(`appliedUcarGarageSlot`, `findMany`, args)

  if (!AppliedUcarGarageSlot || isLoading) {
    return <PlaceHolder />
  }

  return (
    <table className={` t-paper [&_td]:p-1 rounded text-center ${CssString.table.borderCerlls}`}>
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

          // 空き状況のステータスを取得
          const status = getGarageSlotStatusLabel(slot)

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
                    if (confirm('この車庫登録を強制的に「空き」にしますか？')) {
                      // 強制空きフラグの切り替え（finishedAtのトグル）
                      await doStandardPrisma(`appliedUcarGarageSlot`, `update`, {
                        where: { id: slot.id },
                        data: { finishedAt: slot.finishedAt ? null : new Date().toISOString() },
                      })

                      mutateAppliedUcarGarageSlot()
                    }
                  }}
                >
                  <ColoredText className={`text-center`} bgColor={status.color}>
                    {status.label}
                  </ColoredText>
                </button>
              </td>
              <td>
                <button
                  className={`t-link`}
                  onClick={async () => {
                    toggleLoad(async () => {
                      const formData = await getGaragePdfFormData(ucar)
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

export const getGaragePdfFormData = async (
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
      garageNumber: ' No.',
      to: `岡山南 警察署長`,
    },
    倉敷: {
      locationName: `kurashiki`,
      address: `倉敷市中島668`,
      garageNumber: ' No.' + GarageNumber,
      to: `倉敷 警察署長`,
    },
  }
  const locationInfo: locationInfoType = locations[GarageLocation?.name]

  const getUcarRawData = await UcarCL.fetcher.getUcarDataBySateiId(ucar.sateiID)

  const ucarInst = new UcarCL(getUcarRawData)
  const {
    //
    brandName, //店舗査定_ブランド名称
    modelName, //店舗査定_車種名称
    frameNumber, //店舗査定_フレーム��
    chassisNumber, //店舗査定_車台番号
    type, //型式
    grade, //グレード
    modelYear, //モデル年式
    length, //車寸（長さ）
    width, //車寸（幅）
    height, //車寸（高さ）
  } = ucarInst.notation

  const formData = {
    location: locationInfo.locationName,
    position: String(GarageNumber),
    textbox1: brandName ?? '',
    textbox2: type,
    textbox3: chassisNumber,
    textbox4: String(length ?? ''),
    textbox5: String(width ?? ''),
    textbox6: String(height ?? ''),
    textbox7: locationInfo.address,
    textbox8: '同上' + " " + locationInfo.garageNumber,
    textbox9: '',
    textbox10: locationInfo.to,
    textbox11: '',
    textbox12: '',
    textbox13: '',
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
