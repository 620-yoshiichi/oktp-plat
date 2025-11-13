'use client'
import {NEW_CAR_CONST} from '@app/(apps)/newCar/(constants)/newCar-constants'
import {Fields} from '@cm/class/Fields/Fields'
import {Button} from '@cm/components/styles/common-components/Button'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import React from 'react'

export type TransferStatus = '移動なし' | '移動中' | '回収済'

export default function VehicleTransferFilter() {
  const {addQuery, query} = useGlobal()
  const {BasicForm, latestFormData} = useBasicFormProps({
    formData: query,
    columns: new Fields([
      //
      {id: `NO_CYUMON`, label: `注文番号`, form: {}},
      {id: `NO_FRAME`, label: `フレームNo`, form: {}},

      {
        id: `trasferStutus`,
        label: `ステータス`,
        form: {},
        forSelect: {
          optionsOrOptionFetcher: [
            //
            `移動なし`,
            `移動中`,
            `回収済`,
          ],
        },
      },
      {
        id: `transferType`,
        label: `移動可能`,
        form: {},
        forSelect: {
          optionsOrOptionFetcher: [`可能`, `不可`],
        },
      },
      {
        id: `location`,
        label: `置き場`,
        form: {},
        forSelect: {
          optionsOrOptionFetcher: NEW_CAR_CONST.CAR_TRANSFER.CAR_TRANSFER_HISTORY_LOCATIONS,
        },
      },
    ]).transposeColumns(),
  })

  const onSubmit = async data => {
    const {NO_CYUMON, NO_FRAME, trasferStutus, transferType, location} = data

    addQuery({
      NO_CYUMON: NO_CYUMON || null,
      NO_FRAME: NO_FRAME || null,
      trasferStutus: trasferStutus || null,
      transferType: transferType || null,
      location: location || null,
    })
  }

  return (
    <div>
      <BasicForm
        {...{
          latestFormData,
          onSubmit,
          ControlOptions: {
            ControlStyle: {width: 150},
          },
          alignMode: `row`,
        }}
      >
        <Button>検索</Button>
      </BasicForm>
    </div>
  )
}
