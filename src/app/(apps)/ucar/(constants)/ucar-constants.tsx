import { Fields } from '@cm/class/Fields/Fields'

import { Prisma } from '@prisma/generated/prisma/client'
import { defaultRegister } from '@cm/class/builders/ColBuilderVariables'
import { isDev } from '@cm/lib/methods/common'
import { toUtc } from '@cm/class/Days/date-utils/calculations'
import { UCAR_CODE } from '@app/(apps)/ucar/class/UCAR_CODE'
const showDefaultValue = isDev

export const sold: Prisma.UcarWhereInput = {
  // KI_HANKAKA: {gt: 0}
}
export const unsold: Prisma.UcarWhereInput = {
  // KI_HANKAKA: {not: {gt: 0}}
}

const THRESHOLD_DATE = toUtc(new Date(`2025-01-01`))

export const UCAR_CONSTANTS: {
  shiireGroupUserCode: number
  commonQuery: Prisma.UcarWhereInput
  columns: any
} = {
  shiireGroupUserCode: 99999931,
  commonQuery: {
    OR: [
      // { DD_SIIRE: null },
      {
        AND: [


          {
            OR: [
              { OldCars_Base: { KI_HANKAKA: '0' } }, //まだ売り上げが立っていないもの
              { createdAt: { gte: THRESHOLD_DATE } }, //作成日が2025-01-01以降のもの
            ],
          },

          { active: true },
        ],
      }
    ]

  },

  columns: {
    getQrSheetIssueInfoCol: ({ stores }) =>
      new Fields([
        {
          id: `storeToPickUp`,
          form: { register: { required: `必須です` } },
          label: `引取先拠点`,
          forSelect: {
            optionsOrOptionFetcher: (stores ?? [])
              .sort((a, b) => {
                return a.code - b.code
              })
              ?.map(s => s.name),
          },
        },
        {
          id: `runnable`,
          form: { register: { required: `必須です` } },
          label: `自力走行可`,
          forSelect: {
            radio: {},
            codeMaster: UCAR_CODE.RUNNABLE,
          },
        },
        {
          id: `remarks`,
          label: `店舗特記事項`,
          form: {},
          type: 'textarea',
        },
        {
          id: `shitadoriKbn`,
          label: `下取区分`,
          form: { ...defaultRegister },
          forSelect: { codeMaster: UCAR_CODE.SHITADORI_KBN },
        },
        {
          id: `kounyuShaOrderNumber`,
          label: `注文No`,
          form: {
            descriptionNoteAfter: `「買取（下取扱い）」の時のみ入力`,
            register: {
              validate: (value, row) => {
                const SHITADORI_KBN_CODE = UCAR_CODE.SHITADORI_KBN.byCode(row.shitadoriKbn)
                if (SHITADORI_KBN_CODE?.requireChumonNo) {
                  value = String(value ?? '')
                  const reg = /^\d{2}\s\d{5}$/
                  if (!reg.test(value)) {
                    return '「2桁数字」「半角スペース」「5桁数字」で入力してください。'
                  }
                }
              },
            },
          },
          type: 'text',
        },
      ]).buildFormGroup({ groupName: '入庫時情報' }).plain,

    getTmpCarInfoCol: () =>
      new Fields([

        {
          id: `tmpChassisNumber`,
          form: { ...defaultRegister, defaultValue: showDefaultValue ? 'AZSH35-4002743' : null },
          label: `車台番号`,
          type: 'text',
          inputProps: { placeholder: 'AZSH35-4002743' },
        },
        {
          id: `tmpColor`,
          form: { ...defaultRegister, defaultValue: showDefaultValue ? 'パール' : null },
          label: `色`,
          type: 'text',
          inputProps: { placeholder: 'パール' },
        },
        {
          id: `tmpModelYear`,
          form: { ...defaultRegister, defaultValue: showDefaultValue ? '2024' : null },
          label: `年式`,
          type: 'text',
          inputProps: { placeholder: '2024' },
        },
        {
          id: `tmpBrandName`,
          form: { ...defaultRegister, defaultValue: showDefaultValue ? 'トヨタ' : null },
          label: `ブランド名`,
          type: 'text',
          inputProps: { placeholder: 'トヨタ' },
        },
        {
          id: `tmpModelName`,
          form: { ...defaultRegister, defaultValue: showDefaultValue ? 'ｸﾗｳﾝ ｸﾛｽｵｰﾊﾞｰ' : null },
          label: `車種名`,
          type: 'text',
          inputProps: { placeholder: 'ｸﾗｳﾝ ｸﾛｽｵｰﾊﾞｰ' },
        },
        {
          id: `tmpGrade`,
          form: { ...defaultRegister, defaultValue: showDefaultValue ? '2.5 CROSSOVER G"Advanced･Leather Package"' : null },
          label: `グレード`,
          type: 'text',
          inputProps: { placeholder: '2.5 CROSSOVER G"Advanced･Leather Package"' },
        },
        {
          id: `tmpType`,
          form: { ...defaultRegister, defaultValue: showDefaultValue ? '6AA-AZSH35' : null },
          label: `型式`,
          type: 'text',
          inputProps: { placeholder: '6AA-AZSH35' },
        },
        {
          id: `tmpCommonType`,
          form: { ...defaultRegister, defaultValue: showDefaultValue ? 'AZSH35-AEXMB' : null },
          label: `通称型式`,
          type: 'text',
          inputProps: { placeholder: 'AZSH35-AEXMB' },
        },
        {
          id: `tmpFrameNumber`,
          form: { ...defaultRegister, defaultValue: showDefaultValue ? '4002743' : null },
          label: `フレーム番号`,
          type: 'text',
          inputProps: { placeholder: '4002743' },
        },
        {
          id: `tmpTransmissionType`,
          form: { ...defaultRegister, defaultValue: showDefaultValue ? 'AT' : null },
          label: `ミッション名称`,
          type: 'text',
          inputProps: { placeholder: 'AT' },
        },
        {
          id: `tmpLandAffairsName`,
          form: { ...defaultRegister, defaultValue: showDefaultValue ? '倉敷' : null },
          label: `陸自名`,
          type: 'text',
          inputProps: { placeholder: '倉敷' },
        },
        {
          id: `tmpRegistrationClassNumber`,
          form: { ...defaultRegister, defaultValue: showDefaultValue ? '330' : null },
          label: `分類番号`,
          type: 'text',
          inputProps: { placeholder: '330' },
        },
        {
          id: `tmpRegistrationKana`,
          form: { ...defaultRegister, defaultValue: showDefaultValue ? 'ひ' : null },
          label: `かな`,
          type: 'text',
          inputProps: { placeholder: 'ひ' },
        },
        {
          id: `tmpPlate`,
          form: { ...defaultRegister, defaultValue: showDefaultValue ? '1625' : null },
          label: `プレート番号`,
          type: 'text',
          inputProps: { placeholder: '1625' },
        },

      ]).buildFormGroup({ groupName: '車両情報（当日査定の場合必須）' }).plain,
  },
}
