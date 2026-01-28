import {Prisma} from '@prisma/generated/prisma/client'

export const availableNumberWhere: Prisma.Number98WhereInput = {
  AND: [
    //
    {occupied: false},
    {
      Ucar: {
        none: {
          id: {gt: 0},
          Number98: {
            OldCars_Base: {some: {KI_HANKAKA: '0'}},
          },
        },
      },
    },
    {
      OldCars_Base: {
        every: {KI_HANKAKA: {not: '0'}},
      },
    },
    // ZAIKO_Baseに紐づいていないこと
    {
      ZAIKO_Base: {
        none: {},
      },
    },
  ],
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
