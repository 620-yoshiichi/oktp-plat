import React from 'react'

import {IconBtn} from '@cm/components/styles/common-components/IconBtn'

import {basePath} from '@cm/lib/methods/common'
import useGarageEditorGMF from '@app/(apps)/ucar/(parts)/templateHooks/useGarageEditorGMF'
import {T_LINK} from '@cm/components/styles/common-components/links'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import Coloring from '@cm/lib/methods/Coloring'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

export default function InlineGarageEditor({row}) {
  const GarageEditorGMF = useGarageEditorGMF()

  const processCodeItem = UCAR_CODE.PROCESSED_AS.byCode(row.processedAs)

  if (processCodeItem?.label === `名義変更`) {
    const garageCreated = row?.AppliedUcarGarageSlot
    return <div>{getGarageMakeIcon({garageCreated, row, setshowGarageRegister: GarageEditorGMF.setGMF_OPEN})}</div>
  }

  return null
}

const getGarageMakeIcon = ({garageCreated, row, setshowGarageRegister}) => {
  return (
    <Coloring
      mode="bg"
      className={`cursor-pointer`}
      color={garageCreated ? 'gray' : 'red'}
      asLink
      onClick={() => setshowGarageRegister({ucar: row, garageSlot: null})}
    >
      <C_Stack className={`gap-0 py-0.5 leading-3 `}>
        <div>{garageCreated ? getGarageNotation({row}) : `車庫証明`}</div>
        <div>
          <small>{formatDate(row?.AppliedUcarGarageSlot.createdAt)}</small>
        </div>
      </C_Stack>
    </Coloring>
  )
  if (garageCreated) {
    return (
      <T_LINK href={[basePath, `ucar`, `shakoshomei`, row.sateiID].join(`/`)} target={`_blank`}>
        <div>{garageCreated ? getGarageNotation({row}) : `車庫証明`}</div>
      </T_LINK>
    )
  } else {
    return (
      <div>
        <IconBtn color={`blue`} onClick={() => setshowGarageRegister({ucar: row, garageSlot: null})}>
          {garageCreated ? getGarageNotation({row}) : `車庫証明`}
        </IconBtn>
      </div>
    )
  }
}
const getGarageNotation = ({row}) => {
  const AppiedGarage = row?.AppliedUcarGarageSlot
  const location = AppiedGarage?.UcarGarageSlotMaster?.UcarGarageLocationMaster
  const garageNumber = AppiedGarage?.UcarGarageSlotMaster?.garageNumber

  const garageNotation = location ? (
    <R_Stack>
      <div>車庫:{`${location?.name} ` + ` ` + ` ${garageNumber}`}</div>
      {/* <span className={`text-xs`}>{`(作成日:${formatDate(AppiedGarage.createdAt)} )`}</span> */}
    </R_Stack>
  ) : (
    ''
  )

  return garageNotation
}
