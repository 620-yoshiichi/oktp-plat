import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Prisma} from '@prisma/generated/prisma/client'
import {allOktpRoles, oktpRoleString} from '@app/oktpCommon/constants'
import {UserWithRoles} from './types'

/**
 * すべてのOKTPロールをリセット（upsert）する
 */
export async function resetAllOktpRoles(): Promise<{
  roleMaster: Array<{id: number; name: string}>
}> {
  const res = await doTransaction({
    transactionQueryList: allOktpRoles.map((roleString: string): transactionQuery<'roleMaster', 'upsert'> => {
      return {
        model: 'roleMaster',
        method: 'upsert',
        queryObject: {
          where: {name: roleString},
          create: {name: roleString},
          update: {name: roleString},
        },
      }
    }),
  })

  const roleMaster = res.result
  return {roleMaster}
}

/**
 * ユーザーロールをupsertする
 */
export async function upsertUserRoles(
  userWithRoles: UserWithRoles,
  roleMaster: Array<{id: number; name: string}>
): Promise<{
  upsertedUser: UserWithRoles
  upsertedUserRole: Array<any>
}> {
  const {userId, code, userRoles = []} = userWithRoles

  // 重複したロールを削除
  const uniqueUserRoles = Array.from(new Set(userRoles))

  const upsertedUserRole = await Promise.all(
    uniqueUserRoles.map(async roleName => {
      const roleId = roleMaster.find(d => d.name === roleName)?.id

      if (roleId) {
        const userRoleUpsertPayload: Prisma.UserRoleUpsertArgs = {
          where: {
            userId_roleMasterId_unique: {
              userId: userId,
              roleMasterId: roleId,
            },
          },
          create: {
            userId: userId,
            roleMasterId: roleId,
          },
          update: {
            userId: userId,
            roleMasterId: roleId,
          },
        }

        const res = await doStandardPrisma('userRole', 'upsert', userRoleUpsertPayload)
        return res
      }
      return undefined
    })
  )

  return {
    upsertedUser: userWithRoles,
    upsertedUserRole: upsertedUserRole.filter(Boolean),
  }
}

/**
 * 複数のユーザーロールを一括でupsertする
 */
export async function upsertMultipleUserRoles(
  usersWithRoles: UserWithRoles[],
  roleMaster: Array<{id: number; name: string}>
): Promise<
  Array<{
    upsertedUser: UserWithRoles
    upsertedUserRole: Array<any>
  }>
> {
  const results = await Promise.all(
    usersWithRoles.map(async userWithRoles => {
      try {
        return await upsertUserRoles(userWithRoles, roleMaster)
      } catch (error) {
        console.error('Error upserting user roles:', {error, data: userWithRoles})
        return undefined
      }
    })
  )

  return results.filter((d): d is NonNullable<typeof d> => d !== undefined)
}
