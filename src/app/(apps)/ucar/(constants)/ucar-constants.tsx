import {Fields} from '@cm/class/Fields/Fields'

import {Prisma} from '@prisma/generated/prisma/client'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {isDev} from '@cm/lib/methods/common'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
const showDefaultValue = isDev

export const sold: Prisma.UcarWhereInput = {
  // KI_HANKAKA: {gt: 0}
}
export const unsold: Prisma.UcarWhereInput = {
  // KI_HANKAKA: {not: {gt: 0}}
}

const THRESHOLD_DATE = toUtc(new Date(`2025-01-01`))

export const UCAR_CONSTANTS = {
  shiireGroupUserId: 99999931,
  commonQuery: {
    AND: [{createdAt: {gte: THRESHOLD_DATE}}, {active: true}],
  },

  columns: {
    getQrSheetIssueInfoCol: ({stores}) =>
      new Fields([
        {
          id: `storeToPickUp`,
          form: {register: {required: `必須です`}},
          label: `引取先拠点`,
          forSelect: {
            optionsOrOptionFetcher: (stores ?? [])
              .sort((a, b) => {
                return a.code - b.code
              })
              ?.map(s => s.name),
          },
        },
        {id: `runnable`, form: {}, label: `自力走行可`, type: 'boolean'},
        {
          id: `remarks`,
          form: {},
          label: `店舗特記事項`,
          type: 'textarea',
        },
      ]).buildFormGroup({groupName: '入庫時情報'}).plain,

    getTmpCarInfoCol: () =>
      new Fields([
        {
          id: `tmpPlate`,
          form: {...defaultRegister, defaultValue: showDefaultValue ? '1625' : null},
          label: `プレート番号`,
          type: 'text',
          inputProps: {placeholder: '1625'},
        },
        {
          id: `tmpVehicleNo`,
          form: {...defaultRegister, defaultValue: showDefaultValue ? 'AZSH35-4002743' : null},
          label: `車両No`,
          type: 'text',
          inputProps: {placeholder: 'AZSH35-4002743'},
        },
        {
          id: `tmpColor`,
          form: {...defaultRegister, defaultValue: showDefaultValue ? 'パール' : null},
          label: `色`,
          type: 'text',
          inputProps: {placeholder: 'パール'},
        },
        {
          id: `tmpModelYear`,
          form: {...defaultRegister, defaultValue: showDefaultValue ? '3' : null},
          label: `年式`,
          type: 'text',
          inputProps: {placeholder: '3'},
        },
        {
          id: `tmpBrandName`,
          form: {...defaultRegister, defaultValue: showDefaultValue ? 'トヨタ' : null},
          label: `ブランド名`,
          type: 'text',
          inputProps: {placeholder: 'トヨタ'},
        },
        {
          id: `tmpModelName`,
          form: {...defaultRegister, defaultValue: showDefaultValue ? 'ｸﾗｳﾝ ｸﾛｽｵｰﾊﾞｰ' : null},
          label: `車種名`,
          type: 'text',
          inputProps: {placeholder: 'ｸﾗｳﾝ ｸﾛｽｵｰﾊﾞｰ'},
        },
        {
          id: `tmpGrade`,
          form: {...defaultRegister, defaultValue: showDefaultValue ? '2.5 CROSSOVER G"Advanced･Leather Package"' : null},
          label: `グレード`,
          type: 'text',
          inputProps: {placeholder: '2.5 CROSSOVER G"Advanced･Leather Package"'},
        },
        {
          id: `tmpType`,
          form: {...defaultRegister, defaultValue: showDefaultValue ? '6AA-AZSH35' : null},
          label: `型式`,
          type: 'text',
          inputProps: {placeholder: '6AA-AZSH35'},
        },
        {
          id: `tmpCommonType`,
          form: {...defaultRegister, defaultValue: showDefaultValue ? 'AZSH35-AEXMB' : null},
          label: `通称型式`,
          type: 'text',
          inputProps: {placeholder: 'AZSH35-AEXMB'},
        },
        {
          id: `tmpFrameNumber`,
          form: {...defaultRegister, defaultValue: showDefaultValue ? '4002743' : null},
          label: `フレーム番号`,
          type: 'text',
          inputProps: {placeholder: '4002743'},
        },
        {
          id: `tmpTransmissionType`,
          form: {...defaultRegister, defaultValue: showDefaultValue ? 'AT' : null},
          label: `ミッション名称`,
          type: 'text',
          inputProps: {placeholder: 'AT'},
        },
        {
          id: `tmpRegistrationClassNumber`,
          form: {...defaultRegister, defaultValue: showDefaultValue ? '330' : null},
          label: `分類番号`,
          type: 'text',
          inputProps: {placeholder: '330'},
        },
        {
          id: `tmpRegistrationKana`,
          form: {...defaultRegister, defaultValue: showDefaultValue ? 'ひ' : null},
          label: `かな`,
          type: 'text',
          inputProps: {placeholder: 'ひ'},
        },
        {
          id: `tmpLandAffairsName`,
          form: {...defaultRegister, defaultValue: showDefaultValue ? '倉敷' : null},
          label: `陸事名`,
          type: 'text',
          inputProps: {placeholder: '倉敷'},
        },
      ]).buildFormGroup({groupName: '車両情報（当日査定の場合必須）'}).plain,
  },
}
