import {includeProps, roopMakeRelationalInclude} from '@cm/class/builders/QueryBuilderVariables'
import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'

export class QueryBuilder {
  static getInclude = (includeProps: includeProps) => {
    const {session, query} = includeProps

    const store = {
      include: {
        Area: {},
      },
    }
    const user: any = {
      include: {
        UserRole: {
          include: {
            RoleMaster: {},
          },
        },
        Store: {},
        DamageNameMaster: {},
      },
    }
    const car: any = {
      include: {
        User: {},
        CrUser: {
          include: {User: {}},
        },
        Store: {},
        DamageNameMaster: {},
        Process: {
          orderBy: BP_Car.const.ProcessOrderBy,
          include: {ProcessNameMaster: {}, User: {}},
        },
        Notes: {
          include: {NoteNameMaster: {}, User: {}},
        },
      },
    }
    const include = {user, car, store}
    Object.keys(include).forEach(key => {
      roopMakeRelationalInclude({
        parentName: key,
        parentObj: include[key],
      })
    })

    return include
  }
}
