'use client'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import React from 'react'

export default function MikomiTableCC({records, stylesInColumns}) {
  const TABLE = CsvTable({records, stylesInColumns})
  return (
    <>
      {TABLE.WithWrapper({
        className: `border-2 border-black  text-sm
           [&_td]:!p-0
           [&_td]:!border
           [&_td]:!align-middle
           [&_th]:text-sm`,
      })}
    </>
  )
}
