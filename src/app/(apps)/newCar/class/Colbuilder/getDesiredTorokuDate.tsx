'use client'

import { defaultRegister } from '@cm/class/builders/ColBuilderVariables'
import { Fields } from '@cm/class/Fields/Fields'

import { columnGetterType } from '@cm/types/types'

import { userForselectConfig } from '@app/(apps)/newCar/(constants)/forSelectConfig'

import { NEW_CAR_CONST } from '@app/(apps)/newCar/(constants)/newCar-constants'
import { IconBtn } from '@cm/components/styles/common-components/IconBtn'

// td: {
//   getRowColor: (value, row) => {
//     return "#006800"
//   }
// },

export const getDesiredTorokuDate = (props: columnGetterType) => {
  const { roles, accessScopes } = props.useGlobalProps
  return new Fields([
    ...new Fields([
      // {id: `id`, label: `ID`, type: 'number', form: {hidden: true}},
      // {id: '', label: '申請日', type: `date`, form: {hidden: true}},
      {
        id: 'createdAt', label: '申請日', type: `date`, form: { hidden: true },
      },

      {
        id: 'date', label: '登録希望日', type: `date`, form: { ...defaultRegister }, search: {},

      },

      {
        id: 'torokuType',
        label: '申請区分',
        forSelect: {
          optionsOrOptionFetcher: ['紙登録', 'OSS'],
        },
        form: { ...defaultRegister },
      },

      {
        id: 'status',
        label: 'ステータス',
        forSelect: {
          optionsOrOptionFetcher: NEW_CAR_CONST.TOROKU_STATUS_LIST,
        },


        format: (value, row, col) => {
          const theStatus = NEW_CAR_CONST.TOROKU_STATUS_LIST.find(d => d.value === row[col.id])
          const status = theStatus?.value
          const color = theStatus?.color
          return <IconBtn color={color}>{status ?? '保留中'}</IconBtn>
        },
        form: {
          disabled: accessScopes().getNewCarProps().isHQ ? false : true,
        },
      },
    ]).showSummaryInTd({}).plain,

    ...new Fields([
      //
      {
        id: 'remarks',
        label: '理由・メモ',
        type: `textarea`,
        form: {},
      },
    ]).showSummaryInTd({ wrapperWidthPx: 240 }).plain,
    ...new Fields([
      { id: `NewCar.NO_CYUMON`, label: '注文No', search: {} },
      { id: `NewCar.KJ_KURUMAME`, label: '車名', search: {} },
      { id: `NewCar.Store.name`, label: '店舗' },
      {
        id: `NewCar.User.name`,
        label: 'スタッフ',
        search: {},
        forSelect: { config: userForselectConfig },
        form: { hidden: true },
      },
    ]).showSummaryInTd({}).plain,
    ...new Fields([
      { id: `NewCar.KJ_KAINMEI1`, label: '買主名', search: {} },
      { id: `NewCar.KJ_MEIGIME1`, label: '名義人名', search: {} },
    ]).showSummaryInTd({}).plain,

    ...new Fields([
      { id: `NewCar.CUSTOM_DD_SEISANYOTEI`, label: '生産予定(J-SLIM)', type: `date` },
      { id: `NewCar.DD_FR`, label: '振当日', type: `date` },
      { id: `NewCar.DD_HONBSYOK`, label: '書類完備', type: `date` },
    ]).showSummaryInTd({ hideUndefinedValue: false }).plain,
  ]).transposeColumns()
}
