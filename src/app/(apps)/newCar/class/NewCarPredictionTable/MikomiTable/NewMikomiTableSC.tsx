'use client'

import {R_Stack} from '@cm/components/styles/common-components/common-components'

import React from 'react'

import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'

import useSWR from 'swr'
import {newMikomiTableFetcher} from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/newMikomiTableFetcher'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import {KeyValue} from '@cm/components/styles/common-components/ParameterCard'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

export default function NewMikomiTableSC({query}) {
  const thisMonth = toUtc(query.month)

  const {data, isLoading} = useSWR(JSON.stringify({thisMonth, name: 'newMikomiTableFetcher'}), async () => {
    return await newMikomiTableFetcher({thisMonth, query})
  })

  if (isLoading) {
    return <PlaceHolder />
  }
  const {dataByStore = {}, stores = []} = data ?? {}

  const TB = CsvTable({
    records: stores.map(store => {
      const storeId = store.id
      const data = dataByStore[storeId]
      const {storeName, months} = data

      return {
        csvTableRow: [
          //
          {label: '店舗名', cellValue: storeName},
          //
          ...Object.keys(months).map(month => {
            const torokuFlag = months[month]

            const sum =
              torokuFlag.torokuKanryo +
              torokuFlag.torokuYotei_FR +
              torokuFlag.torokuYotei_NO_FR +
              torokuFlag.torokuMikomi_FR +
              torokuFlag.torokuMikomi_NO_FR

            return {
              label: month,
              cellValue: (
                <div>
                  <R_Stack className={`gap-0.5   `}>
                    <KeyValue label="">
                      <div className={`w-5  `}>{sum || `0`}</div>
                    </KeyValue>

                    <R_Stack className={`gap-0 justify-center w-6`}>=</R_Stack>

                    <KeyValue label="">
                      <R_Stack className={`gap-0 justify-end w-5  `}>
                        <div className={torokuFlag.torokuKanryo ? ` text-blue-700 font-bold` : `opacity-30`}>
                          {torokuFlag.torokuKanryo || `0`}
                        </div>
                      </R_Stack>
                    </KeyValue>

                    <R_Stack className={`gap-0 justify-center w-6`}>+</R_Stack>

                    <KeyValue label="">
                      <R_Stack className={`gap-0 justify-end w-10  `}>
                        <div
                          className={
                            torokuFlag.torokuYotei_FR + torokuFlag.torokuYotei_NO_FR ? `text-green-700 font-bold` : `opacity-30`
                          }
                        >
                          <div>{torokuFlag.torokuYotei_FR + torokuFlag.torokuYotei_NO_FR}</div>
                        </div>
                        <small>({torokuFlag.torokuYotei_FR || `0`})</small>
                      </R_Stack>
                    </KeyValue>

                    <R_Stack className={`gap-0 justify-center w-6`}>+</R_Stack>

                    <KeyValue label="">
                      <R_Stack className={`gap-0 justify-end w-10  `}>
                        <div
                          className={torokuFlag.torokuMikomi_FR + torokuFlag.torokuMikomi_NO_FR ? `text-red-700 ` : `opacity-30`}
                        >
                          <div>{torokuFlag.torokuMikomi_FR + torokuFlag.torokuMikomi_NO_FR}</div>
                        </div>
                        <small>({torokuFlag.torokuMikomi_FR || `0`})</small>
                      </R_Stack>
                    </KeyValue>
                  </R_Stack>

                  {/* <div>{torokuFlag.torokuKanryo}</div>
                  <div>{torokuFlag.torokuYotei_FR}</div>
                  <div>{torokuFlag.torokuYotei_NO_FR}</div>
                  <div>{torokuFlag.torokuMikomi_FR}</div>
                  <div>{torokuFlag.torokuMikomi_NO_FR}</div> */}
                </div>
              ),
            }
          }),
        ],
      }
    }),
  })

  return <>{TB.WithWrapper({})}</>
}
