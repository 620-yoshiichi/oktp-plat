import {judgeIsAdmin, roleIs} from 'src/non-common/scope-lib/judgeIsAdmin'

import {MyTableType} from '@cm/types/types'
import {MyFormType} from '@cm/types/form-types'
import {anyObject} from '@cm/types/utility-types'

import {arr__findCommonValues} from '@cm/class/ArrHandler/array-utils/data-operations'

type roleArray = string[] | string
type session = any

type QRBPScopeType = {
  crLeader: boolean
  cr: boolean
  store: boolean
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
  isTestUser?: unknown
  newCarWhere: carWhereType
}

type getScopeOptionsProps = {query?: anyObject; roles?: any[]}
export const getScopes = (session: session, options?: getScopeOptionsProps) => {
  const {query, roles} = options ?? {}

  const login = session?.id ? true : false
  const id = session?.id

  const {admin, globalUserId, getGlobalUserId} = judgeIsAdmin(session, query)

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
    const result: QRBPScopeType = {
      crLeader,
      cr,
      store,
    }

    addAdminToRoles(result, session)

    return result
  }

  type UcarScopeType = {
    isHQ?: unknown
    isStoreManager?: unknown
    isSales?: unknown
    carWhere: carWhereType
  }
  const getUcarProps = () => {
    const {isHQ, isStoreManager, isSales, newCarWhere} = getNewCarProps()

    const result: UcarScopeType = {
      carWhere: newCarWhere ?? {},
      isHQ,
      isStoreManager,
      isSales,
    }
    addAdminToRoles(result, session)
    return result
  }

  /**新レン関係 */
  const getNewCarProps = () => {
    const userId = !admin ? session?.id : Number(query?.g_userId ?? session?.id ?? 0)
    const storeId = !admin ? session?.storeId : Number(query?.g_storeId ?? session?.storeId ?? 0)
    const userType = !admin ? session?.type : (query?.type ?? session?.type)

    const isHQ =
      arr__findCommonValues(
        [`需給担当者`, `本部管理者`, `新車登録担当`],
        (roles ?? []).map(d => d.name)
      ) || admin
    const isCR = arr__findCommonValues(
      [`CR(新点)`, `本部管理者`],
      (roles ?? []).map(d => d.name)
    )

    const isTorokuTanto = arr__findCommonValues(
      [`新車登録担当`],
      (roles ?? []).map(d => d.name)
    )
    const isStoreManager = arr__findCommonValues(
      [`店長`, `副店長`, 'サービス副店長'],
      (roles ?? []).map(d => d.name)
    )

    const isSales = arr__findCommonValues(
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
        if (query?.g_storeId) {
          newCarWhere[`storeId`] = Number(query?.g_storeId)
        }

        if (query?.g_selectedUserId) {
          newCarWhere[`userId`] = Number(query?.g_selectedUserId)
        }
      } else if (isStoreManager) {
        newCarWhere = {}
        if (query?.g_selectedUserId) {
          newCarWhere[`userId`] = Number(query?.g_selectedUserId)
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

    const isTestUser = [
      813200, //吉谷さん
      816373, //小滝さん
    ].includes(session.code)

    const result: oktpUserTypes = {
      userId,
      storeId,
      userType,
      isHQ,
      isCR,
      isTorokuTanto,
      isStoreManager,
      isSales,
      newCarWhere,
      isTestUser,
    }

    return {...result}
  }
  const getShinernScopes = () => {
    const userId = !admin ? session?.id : Number(query?.g_userId ?? session?.id ?? 0)
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
