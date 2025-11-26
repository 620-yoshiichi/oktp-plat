import {KaonaviUserType} from '@app/oktpCommon/api/seeder/kaonavi/kaonabi-types'
import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'

import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'
import {allOktpRoles, forcedUsers, oktpRoleString, workTypeConfigs} from '@app/oktpCommon/constants'

import {Prisma} from '@prisma/client'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

export const POST = async (req: NextRequest) => {
  /**店舗データを作成する */
  const stores = await prisma.store.findMany()
  const kaores = await getKaonaviMemberArray()

  const member_data: KaonaviUserType[] = kaores.member_data
  const workTypeMaster = {}
  const emailMaster = {}

  const transactionQuerys: transactionQuery<'user' | 'roleMaster' | 'userRole' | 'roleMaster', 'upsert'>[] = []

  async function resetAllOktpRoles() {
    //権限を一旦除去
    // const deleted = await doStandardPrisma(`userRole`, `deleteMany`, {
    //   where: {RoleMaster: {name: {in: allOktpRoles}}},
    // })

    const res = await doTransaction({
      transactionQueryList: allOktpRoles.map((roleString: string): transactionQuery<'roleMaster', 'upsert'> => {
        return {
          model: `roleMaster`,
          method: `upsert`,
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

  const {roleMaster} = await resetAllOktpRoles()

  const erros = {
    workTypeCountError: [],
  }

  const activeMembers = member_data.filter(item => {
    const isInForcedUsers = forcedUsers.find(d => String(d.code) === String(item.code))

    return (item.mail && item.retired_date === '') || isInForcedUsers
  })
  const userWithRoleStringsList: {
    code: string
    userRoles: oktpRoleString[]
  }[] = activeMembers.map(item => {
    const activeState = item.retired_date === '' ? true : false
    const storeCode = parseInt(item.department.code.substr(0, 2) || 0)
    const store = stores.find(store => String(store.code) === String(storeCode))
    const storeId = store?.id

    const workTypes = item.custom_fields.find(d => d.name === `職務`)?.values
    workTypes?.forEach(wt => {
      obj__initializeProperty(workTypeMaster, wt, true)
    })
    obj__initializeProperty(emailMaster, item.mail, 0)
    emailMaster[item.mail]++

    if ((workTypes ?? []).length > 1) {
      const errorKey = `workTypeCountError`
      errorKey[`workTypeCountError`].push({
        name: item.name,
        code: item.code,
        workTypes,
      })
    }

    const firstWorkType = workTypes?.[0]

    const apps = Object.keys(workTypeConfigs[firstWorkType]?.apps ?? {})
    const userData = {
      code: Number(item.code),
      name: item.name,
      email: item?.mail ?? '',
      password: item.code,
      sortOrder: storeCode,
      active: activeState,
      storeId,
      apps: apps.length > 0 ? apps : undefined,
    }

    const findFromForcedUsers = forcedUsers.find(d => String(d.code) === String(item.code))
    if (findFromForcedUsers) {
      const {userRoles, apps, storeCode} = findFromForcedUsers ?? {}
      userData.apps = apps
      userData.storeId = stores.find(store => store.code === storeCode)?.id

      const userUpsertQuery: Prisma.UserUpsertArgs = {
        where: {code: userData.code},
        create: {...userData},
        update: {...userData},
      }

      transactionQuerys.push({model: `user`, method: `upsert`, queryObject: userUpsertQuery})

      return {code: item.code, userRoles}
    } else if (apps.length > 0) {
      const userRoles = Object.keys(workTypeConfigs[firstWorkType].apps).reduce((acc, APP_NAME) => {
        const roles: oktpRoleString[] = workTypeConfigs[firstWorkType].apps[APP_NAME]?.roles
        return [...acc, ...(roles ?? [])]
      }, [])

      //顔ナビデータからの自動作成
      const userUpsertQuery: Prisma.UserUpsertArgs = {
        where: {code: userData.code},
        create: {...userData},
        update: {...userData},
      }

      transactionQuerys.push({model: `user`, method: `upsert`, queryObject: userUpsertQuery})

      return {code: item.code, userRoles}
    } else {
      return {code: item.code, userRoles: []}
    }
  })

  const res = await doTransaction({transactionQueryList: transactionQuerys})
  const upsertedUserList = res.result

  // return NextResponse.json({upsertedUserList})

  const result = (
    await Promise.all(
      upsertedUserList.map(async upsertedUser => {
        const userId = upsertedUser.id
        const {userRoles = []} = userWithRoleStringsList.find(d => d.code.toString() === upsertedUser.code.toString()) ?? {}

        try {
          const upsertedUserRole = await Promise.all(
            userRoles?.map(async roleName => {
              {
                const roleId = (roleMaster ?? []).find(d => d.name === roleName)?.id
                if (roleId) {
                  const userRoleUpsertPayload: Prisma.UserRoleUpsertArgs = {
                    where: {userId_roleMasterId_unique: {userId, roleMasterId: roleId}},
                    create: {userId, roleMasterId: roleId},
                    update: {userId, roleMasterId: roleId},
                  }

                  return await doStandardPrisma(`userRole`, `upsert`, userRoleUpsertPayload)
                }
              }
            })
          )

          return {upsertedUser, upsertedUserRole}
        } catch (error) {
          console.error({error, data: upsertedUser})
        }
      })
    )
  ).filter(d => d)
  // const result = (
  //   await Promise.all(
  //     transactionQuerys.map(async d => {
  //       const {model, method, queryObject} = d
  //       try {
  //         const upsertedUser = await prisma[model][method](queryObject)

  //         const roles =
  //           userWithRoleStringsList.find(d => {
  //             return d?.code.toString() === upsertedUser.code.toString()
  //           })?.userRoles ?? []

  //         const upsertedUserRole = await Promise.all(
  //           roles?.map(async roleName => {
  //             {
  //               const roleId = (roleMaster ?? []).find(d => d.name === roleName)?.id

  //               if (roleId) {
  //                 const userRoleUpsertPayload: Prisma.UserRoleUpsertArgs = {
  //                   where: {userId_roleMasterId_unique: {userId: upsertedUser.id, roleMasterId: roleId}},
  //                   create: {userId: upsertedUser.id, roleMasterId: roleId},
  //                   update: {userId: upsertedUser.id, roleMasterId: roleId},
  //                 }

  //                 return await doStandardPrisma(`userRole`, `upsert`, userRoleUpsertPayload)
  //               }
  //             }
  //           })
  //         )
  //         return {upsertedUser, upsertedUserRole}
  //       } catch (error) {
  //         console.error({error, data: queryObject.create})
  //       }
  //     })
  //   )
  // ).filter(d => d)

  return NextResponse.json({
    success: true,
    emailMaster,
    result: result,
    message: 'ユーザーデータ更新完了',
    workTypeMaster,
  })
}

function base64Encode(str) {
  return Buffer.from(str, 'ascii').toString('base64')
}

async function getKaonaviMemberArray() {
  const consumerKey = 'f40b50b07ef780720b51d511bcedf6'
  const consumerSecret = '2885a8ec422087f0b2674a888e0089a3c991ab8ff6e97dd5375b3daa60fe4b79'
  const credentials = base64Encode(`${consumerKey}:${consumerSecret}`)

  // カオナビ認証情報の設定（トークン取得のため）
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
  }

  // カオナビにてトークン発行
  const jsonData = await fetch('https://api.kaonavi.jp/api/v2.0/token', options).then(response => response.json())

  // トークンを使用してリクエストの詳細を指定

  const {access_token} = jsonData
  const requestOptions = {
    method: 'GET',
    headers: {
      'Kaonavi-Token': access_token,
    },
  }

  const responsJson = await fetch('https://api.kaonavi.jp/api/v2.0/members', requestOptions).then(res => res.json())

  // 結果がupdate_atとmember_dataに分かれて渡されるのでmember_dataのみ取得
  const {update_at, member_data} = responsJson
  // return {message:"ユーザーデータ更新しました"}
  return {
    update_at,
    member_data,
  }
}
