import {Fields} from '@cm/class/Fields/Fields'

import {Prisma} from '@prisma/generated/prisma/client'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {isDev} from '@cm/lib/methods/common'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

export const sold: Prisma.UcarWhereInput = {
  // KI_HANKAKA: {gt: 0}
}
export const unsold: Prisma.UcarWhereInput = {
  // KI_HANKAKA: {not: {gt: 0}}
}

const THRESHOLD_DATE = toUtc(new Date(`2025-04-01`))

export const UCAR_CONSTANTS = {
  shiireGroupUserId: 99999931,
  commonQuery: {
    THRESHOLD_DATE,
    THRESHOLD_ARRIVED_AT: {
      AND: [
        //
        {arrivedAt: {not: null}},
        {arrivedAt: {gte: THRESHOLD_DATE}},
      ],
    },
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
        {id: `runnable`, form: {}, label: `自力走行`, type: 'boolean'},
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
          form: {...defaultRegister, defaultValue: isDev ? 'tmpPlate' : null},
          label: `プレート番号`,
          type: 'text',
        },
        {
          id: `tmpVehicleNo`,
          form: {...defaultRegister, defaultValue: isDev ? 'tmpVehicleNo' : null},
          label: `車両No`,
          type: 'text',
        },
        {
          id: `tmpColor`,
          form: {...defaultRegister, defaultValue: isDev ? 'tmpColor' : null},
          label: `色`,
          type: 'text',
        },
        {
          id: `tmpModelYear`,
          form: {...defaultRegister, defaultValue: isDev ? 'tmpModelYear' : null},
          label: `年式`,
          type: 'text',
        },
        {
          id: `tmpBrandName`,
          form: {...defaultRegister, defaultValue: isDev ? 'tmpBrandName' : null},
          label: `ブランド名`,
          type: 'text',
        },
        {
          id: `tmpModelName`,
          form: {...defaultRegister, defaultValue: isDev ? 'tmpModelName' : null},
          label: `車種名`,
          type: 'text',
        },
        {
          id: `tmpGrade`,
          form: {...defaultRegister, defaultValue: isDev ? 'tmpGrade' : null},
          label: `グレード`,
          type: 'text',
        },
        {
          id: `tmpType`,
          form: {...defaultRegister, defaultValue: isDev ? 'tmpType' : null},
          label: `型式`,
          type: 'text',
        },
        {
          id: `tmpCommonType`,
          form: {...defaultRegister, defaultValue: isDev ? 'tmpCommonType' : null},
          label: `通称型式`,
          type: 'text',
        },
        {
          id: `tmpFrameNumber`,
          form: {...defaultRegister, defaultValue: isDev ? 'tmpFrameNumber' : null},
          label: `フレーム番号`,
          type: 'text',
        },
        {
          id: `tmpTransmissionType`,
          form: {...defaultRegister, defaultValue: isDev ? 'tmpTransmissionType' : null},
          label: `ミッション名称`,
          type: 'text',
        },
        {
          id: `tmpRegistrationClassNumber`,
          form: {...defaultRegister, defaultValue: isDev ? 'tmpRegistrationClassNumber' : null},
          label: `分類番号`,
          type: 'text',
        },
        {
          id: `tmpRegistrationKana`,
          form: {...defaultRegister, defaultValue: isDev ? 'tmpRegistrationKana' : null},
          label: `かな`,
          type: 'text',
        },
        {
          id: `tmpLandAffairsName`,
          form: {...defaultRegister, defaultValue: isDev ? 'tmpLandAffairsName' : null},
          label: `陸事名`,
          type: 'text',
        },
      ]).buildFormGroup({groupName: '車両情報（UPASSDBにデータがない場合）'}).plain,
  },
}
