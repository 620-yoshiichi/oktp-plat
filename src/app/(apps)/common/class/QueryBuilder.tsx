import {Prisma} from '@prisma/generated/prisma/client'
import {includeProps} from '@cm/class/builders/QueryBuilderVariables'

export class QueryBuilder {
  static getInclude = (includeProps: includeProps) => {
    const store: Prisma.StoreFindManyArgs = {
      include: {
        Area: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }

    const user: Prisma.UserFindManyArgs = {
      include: {
        Store: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        UserRole: {
          include: {
            RoleMaster: {
              select: {
                id: true,
                name: true,
                color: true,
                apps: true,
              },
            },
          },
        },
        DamageNameMaster: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    }

    const roleMaster: Prisma.RoleMasterFindManyArgs = {
      include: {
        UserRole: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    }

    return {
      store,
      user,
      roleMaster,
    }
  }
}
