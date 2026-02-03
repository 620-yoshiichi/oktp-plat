import {Prisma} from '@prisma/generated/prisma/client'

// ============================================
// 定数・Prisma条件
// ============================================

/**
 * 利用可能な98番号の条件
 * - occupied: false
 * - Ucarに紐づいていないか、紐づいているUcarの98番号に価格未設定のOldCars_Baseがない
 * - 自身に紐づくOldCars_Baseがすべて値付け済み(KI_HANKAKA != '0')
 * - ZAIKO_Baseに紐づいていない
 */

export const availableNumberWhereAtomObj = {
  occupied: {
    label: '占有フラグ',
    model: 'Number98',
    CONDITION: {occupied: false},
  },
  unsoldUcarAttached: {
    label: '未売車Ucarが残が残っている。',
    model: 'Number98',
    CONDITION: {
      Ucar: {
        none: {
          active: true,
          NOT: {OldCars_Base: {KI_HANKAKA: {not: '0'}}},
        },
      },
    },
  },
  kobutsuUnsold: {
    label: '古物データで未販売が残っている。',
    model: 'Number98',
    CONDITION: {
      Ucar: {
        some: {
          active: true,
          OldCars_Base: {KI_HANKAKA: {not: '0'}},
        },
      },
    },
  },
  zaikoAttached: {
    model: 'Number98',
    label: '在庫データ(ZAIKO_Base)データが残っている。',
    CONDITION: {ZAIKO_Base: {none: {}}},
  },
}

export const availableNumberWhere: Prisma.Number98WhereInput = {
  AND: [...Object.values(availableNumberWhereAtomObj).map(a => a.CONDITION)],
}

export const number98Select: Prisma.Number98Select = {
  number: true,
  sortNumber: true,
  Ucar: {
    select: {sateiID: true},
  },
  OldCars_Base: {
    select: {
      NO_SIRETYUM: true,
      NO_SYARYOU: true,
      DD_SIIRE: true,
      KI_HANKAKA: true,
    },
    orderBy: [{DD_SIIRE: `asc`}],
  },
}
