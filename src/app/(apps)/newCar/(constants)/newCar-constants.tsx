import {getMidnight, toUtc} from '@cm/class/Days/date-utils/calculations'

import {Prisma} from '@prisma/client'

const ALERT_COLORS = [
  {value: `過去着工分未登録`, color: `#e85555`},
  {value: `着工日未登録`, color: `#f4b942`},
  {value: `2日前未登録`, color: `#f0e068`},
  {value: `登録済`, color: `#4da6d9`},
]

const STATUS_COLORS = [
  {value: `着工`, color: `#258516`},
  {value: `保留`, color: `#515151`},
  {value: `保留(タクシー)`, color: `#515151`},
  {value: `保留（HAC）`, color: `#515151`},
  {value: `保留（架装)`, color: `#515151`},
]

const CAR_TRANSFER_HISTORY_LOCATIONS = [
  {value: `倉敷`, color: '#258516'},
  {value: `本店`, color: '#9e1515'},
]

const switchingDate = toUtc(new Date(`2025-09-01`))
const isNewCommonWhereApplied = getMidnight().getTime() >= switchingDate.getTime()
const COMMON_WHERE_CORE = isNewCommonWhereApplied
  ? {
      OR: [{DD_TOUROKU: {gte: new Date(`2025-03-01`)}}, {DD_TOUROKU: null}],
      NOT: {
        NO_CYUMON: {contains: '98'},
        DD_JUCYU: {lt: new Date(`2021-01-01`)},
      },

      DD_TORIKESI: null,
    }
  : {
      NOT: {
        NO_CYUMON: {contains: '98'},
        DD_JUCYU: {lt: new Date(`2021-01-01`)},
      },

      DD_TORIKESI: null,
    }

export const NEW_CAR_CONST = {
  CAR_TRANSFER: {
    CAR_TRANSFER_HISTORY_LOCATIONS,
  },
  CR_OPERATION: {
    STATUS_COLORS,
    ALERT_COLORS,
    INCLUDE: {
      DesiredTorokuDate: {
        orderBy: [{createdAt: `asc`}],
      },
      User: {},
      Store: {},
    } as Prisma.NewCarInclude,
  },

  // USER: {
  //   ROLES: ['店長', `営業`, `需給担当者`, `本部管理者`, `新車登録担当`, `CR(新点)`] as oktpRoleString[],
  // },

  NEW_CAR: {
    WHERE: {
      COMMON_WHERE: COMMON_WHERE_CORE,
    },
  },

  TOROKU_STATUS_LIST: [
    {value: `承認`, color: `green`, sendMail: true},
    {value: `却下`, color: `red`, sendMail: true},
    {value: `キャンセル`, color: `#303030`, sendMail: false},
  ],
}
