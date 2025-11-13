//やること
// 拠点データ更新処理  ➡︎ 重複データに関して藤川さんに確認中
// switchingをスプシに吐き出し更新対象リストの作成  ➡︎ スタッフへ書くに
// スタッフ付け替え処理の作成  ➡︎ ローカルで実施。

import {updateCustomer} from '@app/(apps)/shinren/seeder/updateCustomer/functions'
import {fetchAlt} from '@cm/lib/http/fetch-client'
import {basePath} from '@cm/lib/methods/common'
import {NextRequest, NextResponse} from 'next/server'

export const POST = async (req: NextRequest) => {
  console.log(`starting seeding customers...`)
  //get data from SS
  const GAS_API_KEY = `https://script.google.com/macros/s/AKfycbwRZl1-w3FCHtwTdAMhUSJmwSxbwZlbXUD22A-x7PRzI7XYOCRIoHIjjBdkQcRFE6Pd/exec`
  const data = await fetchAlt(GAS_API_KEY, {
    action: 'getCustomerData',
  })
  const {
    result: {Customers, Store, User},
  } = data

  const {updatedCustomerQuery, switchingTargets, existingCustomers, brandNewCustomers, unregisteredUsers, error} =
    await updateCustomer({Customers})

  const result = error
    ? {error}
    : {
        createdCustomersCount: updatedCustomerQuery.length,
        unregisteredUsers: unregisteredUsers?.length,
        switchingTargetsCount: switchingTargets?.length,
        existingCustomersCount: existingCustomers?.length,
        brandNewCustomersCount: brandNewCustomers?.length,
        switchingTargets,
      }

  const updateMergeAvailableIds = await fetchAlt(`${basePath}/shinren/seeder/updateMergeAvailableStatus`, {})

  return NextResponse.json({...result, updateMergeAvailableIds})
}
