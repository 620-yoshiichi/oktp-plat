'use client'

import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {Number98} from '@prisma/generated/prisma/client'
import React from 'react'

export default function Number98HistoryChecker(props: {number98: Number98}) {
  const {data} = useDoStandardPrisma(`number98`, `findUnique`, {
    where: {id: props.number98.id},
    include: {
      Ucar: {},
    },
  })

  if (!data) return <PlaceHolder />

  return (
    <div>
      {CsvTable({
        records: data.Ucar.map(d => {
          return {
            csvTableRow: [
              //
              {label: `ID`, cellValue: d.id},
              {label: `査定ID`, cellValue: d.sateiID},
              {label: `車台番号`, cellValue: d.Barracks},
              {label: `在庫店舗名`, cellValue: d.CD_ZAIKOTEN_NAME},
              {label: `販売価格`, cellValue: d.KI_HANKAKA},
            ],
          }
        }),
      }).WithWrapper({})}
    </div>
  )
}
