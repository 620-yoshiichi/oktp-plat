import prisma from 'src/lib/prisma'

import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {Prisma} from '@prisma/client'

export const updateCustomer = async ({Customers}) => {
  try {
    const rentaStores = await prisma.rentaStore.findMany({})
    const users = await prisma.user.findMany({select: {id: true, code: true}, where: {app: 'shinren'}})
    const existingCustomersInDb = await prisma.rentaCustomer.findMany({
      select: {id: true, code: true, userId: true},
    })

    const unregisteredUsers: any[] = []
    const existingCustomers: any[] = []
    const brandNewCustomers: any[] = []

    Customers.forEach(c => {
      const isExist = existingCustomersInDb.find(data => {
        return String(data?.code) === String(c.customerCode)
      })
      if (isExist) {
        existingCustomers.push({...c, userId: isExist.userId})
      } else {
        brandNewCustomers.push(c)
      }
    })

    console.info(`allCustomers Count:`, Customers.length)
    console.info(`existingCustomers Count:`, existingCustomers.length)
    console.info(`brandNewCustomers Count:`, brandNewCustomers.length)

    const switchingTargets: any[] = []
    const customerQuery: transactionQuery<'rentaCustomer', 'upsert'>[] = []
    console.warn('アプリ上に登録のある顧客データを更新します。')

    Customers.forEach(c => {
      const {
        customerCode,
        name,
        kana,
        nameTop,
        nameBottom,
        postalCode,
        address1,
        address2,
        phone,
        fax,
        repPos,
        repName,
        repKana,
        storeCode,
        userCode,
      } = c

      const userFromPrisma = users.find(u => String(u.code) === String(userCode))
      const userId = userFromPrisma?.id

      if (!userFromPrisma) {
        console.warn(`user not detected`, {customerCode, userCode})
        unregisteredUsers.push({userCode, customerCode})
        return
      }

      const isNewCustomer = brandNewCustomers.find(c => String(c.customerCode) === String(customerCode))

      if (String(c.userId) !== String(userId) && !isNewCustomer) {
        switchingTargets.push({customerCode, oldUserCode: c.userCode, newUserCode: userFromPrisma.code})
      }

      const rentaStoreId = rentaStores.find(s => String(s.code) === String(storeCode))?.id
      const customerPayload = {
        code: String(customerCode),
        name: String(name),
        kana: String(kana),
        nameTop: String(nameTop),
        nameBottom: String(nameBottom),
        postalCode: String(postalCode),
        address1: String(address1),
        address2: String(address2),
        phone: String(phone),
        fax: String(fax),
        repPos: String(repPos),
        repName: String(repName),
        repKana: String(repKana),
        type: '管理',
        userId: Number(userId),
        rentaStoreId: Number(rentaStoreId),
      }

      const queryObject: Prisma.RentaCustomerUpsertArgs = {
        where: {
          code: String(customerCode),
        },
        create: customerPayload,
        update: customerPayload,
      }

      customerQuery.push({model: 'rentaCustomer', method: 'upsert', queryObject: queryObject})
    })

    const {result: updatedCustomerQuery} = await doTransaction({transactionQueryList: customerQuery})

    return {
      updatedCustomerQuery,
      switchingTargets,
      existingCustomers,
      brandNewCustomers,
      unregisteredUsers,
    }
  } catch (error) {
    console.error(error.stack) //////////
    return {error: error.message}
  }
}

// export const seedPurposeMaster = async () => {
//   const outcomeMasters: Prisma.PurposeMasterUncheckedCreateInput[] = [
//     {name: '促進', color: '#afafaf', type: '促進'},
//     {name: '商談', color: '#afafaf', type: '促進'},
//     {name: '631', color: '#afafaf', type: '促進'},
//     {name: '保険促進', color: '#afafaf', type: '促進'},
//     {
//       name: 'レンタ・社内ＣＰ周知',
//       color: '#afafaf',
//       type: '促進',
//     },
//     {name: 'メンテナンス', color: '#afafaf', type: '促進'},
//     {name: '書類回収', color: '#afafaf', type: '促進'},
//     {name: '集金・集金促進', color: '#afafaf', type: '促進'},
//     {name: '同行訪問促進', color: '#afafaf', type: '促進'},
//     {name: 'その他', color: '#afafaf', type: '雑用'},
//   ]

//   const purposeMaster = await prisma.$transaction(
//     outcomeMasters.map(data => {
//       const name = data.name
//       return prisma.purposeMaster.upsert({
//         where: {
//           name,
//         },
//         create: data,
//         update: data,
//       })
//     })
//   )
//   return {purposeMaster}
// }

// export const seedOutcomeMaster = async () => {
//   const outcomeMasters: Prisma.OutcomeMasterUncheckedCreateInput[] = [
//     {name: '飛込見積もり', color: '#afafaf'},
//     {name: '管理客紹介', color: '#afafaf'},
//     {name: '代替情報', color: '#afafaf'},
//     {name: '初見積提出', color: '#afafaf'},
//     {name: '新増更ホット獲得', color: '#afafaf'},
//     {name: '新増更成約', color: '#afafaf'},
//     {name: '再リース成約', color: '#afafaf'},
//     {name: 'ディーラー紹介新規獲得', color: '#afafaf'},
//     {name: '業者紹介新規獲得', color: '#afafaf'},
//     {name: '新規継続追加', color: '#afafaf'},
//     {name: 'ソリューション成約', color: '#afafaf'},
//     {name: '保険獲得', color: '#afafaf'},
//     {name: '保険見積獲得', color: '#afafaf'},
//     {name: '保険証券獲得', color: '#afafaf'},
//     {name: 'レンタカー話出る', color: '#afafaf'},
//     {name: 'TEL新規アポ獲得', color: '#afafaf'},
//     {name: '新規基本情報獲得', color: '#afafaf'},
//     {name: '1時間以上の面談', color: '#afafaf'},
//   ]

//   const outcomeMaster = await prisma.$transaction(
//     outcomeMasters.map(data => {
//       const name = data.name
//       return prisma.outcomeMaster.upsert({
//         where: {
//           name,
//         },
//         create: data,
//         update: data,
//       })
//     })
//   )
//   return {outcomeMaster}
// }
