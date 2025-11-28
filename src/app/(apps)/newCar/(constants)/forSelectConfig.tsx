import {NEW_CAR_CONST} from '@app/(apps)/newCar/(constants)/newCar-constants'

import {oktpRoles} from '@app/oktpCommon/constants'
import {forSelectConfig} from '@cm/types/select-types'

import {Prisma} from '@prisma/client'

export const targetStoreWhere = {
  name: {notIn: [`ダイハツパーク倉敷東`, `CR岡山`, 'CHU BASE津山', 'CHU BASE岡山', '中古車グループ', 'CHU BASE倉敷', '本部']},
  orderBy: [{code: `asc`}],
}

export const StoreManagerForselectConfig: forSelectConfig = {
  modelName: `user`,
  where: {
    UserRole: {some: {RoleMaster: {name: '店長'}}},
    apps: {has: 'newCar'},
  },
}

export const newCarAppUserWhere = {
  UserRole: {
    some: {
      OR: oktpRoles.newCar.map(roleName => {
        return {RoleMaster: {name: roleName}}
      }),
    },
  },
  apps: {has: 'newCar'},
}

export const userForselectConfig: forSelectConfig = {
  modelName: `user`,
  orderBy: [{Store: {code: `asc`}}, {code: `asc`}],
  where: newCarAppUserWhere,
}

export const getForSelectWhere = ({storeId}) => {
  const userFindWhere: Prisma.UserWhereInput = {
    OR: [
      {storeId},
      storeId
        ? {
            //納車前の店舗注残を1つでも持っているスタッフ
            NewCar: {
              some: {
                storeId,
                ...NEW_CAR_CONST.NEW_CAR.WHERE.COMMON_WHERE,
                DD_NOSYA: {not: null},
              },
            },
          }
        : {},
    ],
    UserRole: {
      some: {
        OR: [
          //
          {RoleMaster: {name: '営業'}},
          {RoleMaster: {name: '店長'}},
          {RoleMaster: {name: '副店長'}},
        ],
      },
    },
  }
  const result = {
    modelName: `user`,
    where: userFindWhere,
  }

  return result as forSelectConfig
}
