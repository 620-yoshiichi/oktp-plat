import {includeProps, roopMakeRelationalInclude} from '@cm/class/builders/QueryBuilderVariables'

import {Prisma} from '@prisma/client'
import {PrismaModelNames} from '@cm/types/prisma-types'

export class QueryBuilder {
  static getInclude = (includeProps: includeProps) => {
    const user: Prisma.UserFindManyArgs = {
      include: {
        Store: {},
        UserRole: {},
      },
    }
    const roleMaster: Prisma.RoleMasterFindManyArgs = {
      include: {UserRole: {}},
    }

    const userRole: Prisma.UserRoleFindManyArgs = {
      include: {RoleMaster: {}, User: {}},
    }

    const newCar: Prisma.NewCarFindManyArgs = {
      include: {
        JuchuShitadoriDb: {
          include: {UPASS: {}},
        },
        User: {},
        Store: {},
        NewCarLeadTime: {},
        DesiredTorokuDate: {},
        Ucar: {},
        TenpoTsuikoShinseiHeader: {
          include: {
            TenpoTsuikoShinseiDetail: {
              include: {User: {}},
            },
          },
        },
      },
    }
    const desiredTorokuDate: Prisma.DesiredTorokuDateFindManyArgs = {
      include: {
        NewCar: {
          include: {User: {}, Store: {}},
        },
      },
    }
    const include: {[keーy in PrismaModelNames]?: any} = {
      user,
      newCar,
      roleMaster,
      userRole,
      desiredTorokuDate,
      store: {
        include: {User: {}},
      },
    }

    Object.keys(include).forEach(key => {
      roopMakeRelationalInclude({
        parentName: key,
        parentObj: include[key],
      })
    })

    return include
  }
}
