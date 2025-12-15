import {judgeIsAdmin, roleIs} from 'src/non-common/scope-lib/judgeIsAdmin'

import {MyTableType} from '@cm/types/types'
import {MyFormType} from '@cm/types/form-types'
import {anyObject} from '@cm/types/utility-types'

import {arr__findCommonValues} from '@cm/class/ArrHandler/array-utils/data-operations'
import {globalIds} from 'src/non-common/searchParamStr'

type roleArray = string[] | string
type session = any

type QRBPScopeType = {
  crLeader: boolean
  cr: boolean
  store: boolean
  isStoreManager: boolean
  isQrbpMember: boolean
}

type ShinrenScopeType = {
  userId?: unknown
  userType?: unknown
  isHQ?: unknown
  isManager?: unknown
  isSales?: unknown
}

type carWhereType = {
  storeId?: number
  userId?: number
  OR?: any[]
}

type oktpUserTypes = {
  userId?: unknown
  storeId?: unknown
  userType?: unknown
  isHQ?: unknown
  isCR?: unknown
  isStoreManager?: unknown
  isSales?: unknown
  isTorokuTanto?: unknown

  isNewCarMember: boolean
  newCarWhere: carWhereType
}

type getScopeOptionsProps = {query?: anyObject; roles?: any[]}
export const getScopes = (session: session, options?: getScopeOptionsProps) => {
  const {query, roles} = options ?? {}

  const login = session?.id ? true : false
  const id = session?.id

  const {admin, getGlobalUserId} = judgeIsAdmin(session, query)

  const getQrbpProps = () => {
    const cr = !!arr__findCommonValues(
      [`CRアドバイザ`],
      (roles ?? []).map(d => d.name)
    )

    const store = !!arr__findCommonValues(
      [`拠点アドバイザ`],
      (roles ?? []).map(d => d.name)
    )
    const crLeader = !!arr__findCommonValues(
      [`BP課長`],
      (roles ?? []).map(d => d.name)
    )
    const isStoreManager = !!getNewCarProps().isStoreManager
    const qrbpMember = {
      crLeader,
      cr,
      store,
      isStoreManager,
    }
    const result: QRBPScopeType = {
      ...qrbpMember,

      isQrbpMember: Object.keys(qrbpMember).some(key => qrbpMember[key as keyof typeof qrbpMember]),
    }

    result['isQrbpMember'] = Object.keys(result).some(key => result[key as keyof QRBPScopeType])
    addAdminToRoles(result, session)

    return result as QRBPScopeType
  }

  type UcarScopeType = {
    isUcarMember?: boolean
    isHQ?: unknown
    isStoreManager?: unknown
    isSales?: unknown
    carWhere: carWhereType
    userId?: number
    storeId?: number
  }
  const getUcarProps = () => {
    const {isHQ, isStoreManager, isSales, newCarWhere, userId, storeId} = getNewCarProps()

    const ucarMember = {
      isHQ,
      isStoreManager,
      isSales,
    }

    const result: UcarScopeType = {
      carWhere: newCarWhere ?? {},
      ...ucarMember,
      userId,
      storeId,
      isUcarMember: Object.keys(ucarMember).some(key => {
        return !!ucarMember[key]
      }),
    }

    addAdminToRoles(result, session)
    return result
  }

  /**新レン関係 */
  const getNewCarProps = () => {
    const userId = !admin ? session?.id : Number(query?.[globalIds.globalUserId] ?? session?.id ?? 0)
    const storeId = !admin ? session?.storeId : Number(query?.[globalIds.globalStoreId] ?? session?.storeId ?? 0)
    const userType = !admin ? session?.type : (query?.type ?? session?.type)

    const isHQ = !!arr__findCommonValues(
      [`需給担当者`, `本部管理者`, `新車登録担当`],
      (roles ?? []).map(d => d.name)
    )

    const isCR = !!arr__findCommonValues(
      [`CR(新点)`, `本部管理者`],
      (roles ?? []).map(d => d.name)
    )

    const isTorokuTanto = !!arr__findCommonValues(
      [`新車登録担当`],
      (roles ?? []).map(d => d.name)
    )
    const isStoreManager = !!arr__findCommonValues(
      [`店長`, `副店長`, 'サービス副店長'],
      (roles ?? []).map(d => d.name)
    )

    const isSales = !!arr__findCommonValues(
      [`営業`],
      (roles ?? []).map(d => d.name)
    )

    const newCarWhere = (() => {
      let newCarWhere: carWhereType = {
        storeId: undefined,
        userId: undefined,
      }

      if (isHQ) {
        newCarWhere = {}
        if (query?.[globalIds.globalStoreId]) {
          newCarWhere[`storeId`] = Number(query?.[globalIds.globalStoreId])
        }

        if (query?.[globalIds.globalSelectedUserId]) {
          newCarWhere[`userId`] = Number(query?.[globalIds.globalSelectedUserId])
        }
      } else if (isStoreManager) {
        newCarWhere = {}
        if (query?.[globalIds.globalSelectedUserId]) {
          newCarWhere[`userId`] = Number(query?.[globalIds.globalSelectedUserId])
        } else {
          newCarWhere = {
            OR: [
              //
              {userId: session?.id},
              {storeId: session?.storeId},
            ],
          }
        }
      } else {
        newCarWhere = {
          userId: session?.id ?? 0,
          // storeId: session?.storeId ?? 0,
        }
      }

      return newCarWhere
    })()

    const newCarMember = {
      isHQ,
      isCR,
      isTorokuTanto,
      isStoreManager,
      isSales,
    }

    const result: oktpUserTypes = {
      userId,
      storeId,
      userType,
      newCarWhere,
      ...newCarMember,

      isNewCarMember: Object.keys(newCarMember).some(key => newCarMember[key as keyof typeof newCarMember]),
    }

    addAdminToRoles(result, session)

    return {...result}
  }
  const getShinernScopes = () => {
    const userId = !admin ? session?.id : Number(query?.[globalIds.globalUserId] ?? session?.id ?? 0)
    const userType = !admin ? session?.type : (query?.type ?? session?.type)
    const isHQ = userType === '本社'
    const isManager = userType === 'マネージャー'
    const isSales = userType === '営業'

    const result: ShinrenScopeType = {
      userId,
      userType,
      isHQ,
      isManager,
      isSales,
    }

    return result
    return addAdminToRoles(result, session)
    // return result as ShinrenScopeType
  }

  const result = {
    id,
    session,
    login,
    admin,
    roles,
    getGlobalUserId,
    getQrbpProps,
    getShinernScopes,
    getUcarProps,
    getNewCarProps,
  }
  addAdminToRoles
  return result
}

const addAdminToRoles: (targetObject: any, session: anyObject) => anyObject = (targetObject, session) => {
  // const result: anyObject = {...targetObject}
  Object.keys(targetObject).forEach(key => {
    const value = targetObject[key]
    targetObject[key] = value

    if (typeof targetObject[key] !== 'object' && roleIs(['管理者'], session) && targetObject[key] === false) {
      targetObject[key] = true
    }
  })

  return targetObject
}

export const limitEditting = (props: {exclusiveTo?: boolean; myTable?: MyTableType; myForm?: MyFormType}) => {
  const {
    exclusiveTo,
    myTable = {update: false, delete: false},
    myForm = {
      update: false,
      delete: false,
    },
  } = props
  if (!exclusiveTo) {
    return {
      myTable,
      myForm,
    }
  }
}
