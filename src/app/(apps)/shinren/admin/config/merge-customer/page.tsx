import MergeCC from '@app/(apps)/shinren/admin/config/merge-customer/MergeCC'

import {QueryBuilder} from '@app/(apps)/shinren/class/QueryBuilder'
import {Padding} from '@cm/components/styles/common-components/common-components'
import {arrToLines, MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import prisma from 'src/lib/prisma'
import {Shinren} from '@app/(apps)/shinren/class/Shinren'
import {shinrenEasySearchBuilder} from 'src/non-common/EsCollection/shinrenEasySearchBuilder'

const MergeCustomers = async props => {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})
  if (!scopes.login) return <div>ログインしてください</div>
  const customerInclude = {
    ...QueryBuilder.getInclude({session, query}).rentaCustomer.include,
    RentaDailyReport: {}, //takeが3にならないように
  }

  const CONDITION = (await (await shinrenEasySearchBuilder()).rentaCustomer()).isMergeCandidates?.CONDITION

  const wheres = Shinren.rentaCustomer.merge()
  const currentKanriCustomer = await prisma.rentaCustomer.findMany({
    where: {
      userId: session?.id,
      ...wheres.kanriCustomerWhere,
    },
    include: customerInclude,
    orderBy: [{mergeCandidatesIds: 'asc'}, {code: 'asc'}],
  })

  const mergeRequiredCustomerWhere = {
    userId: session?.id,
    ...CONDITION,
  }

  let mergeRequiredAppCustomer = await prisma.rentaCustomer.findMany({
    where: mergeRequiredCustomerWhere,
    include: customerInclude,
    orderBy: [{mergeCandidatesIds: 'asc'}, {code: 'asc'}],
  })

  mergeRequiredAppCustomer = mergeRequiredAppCustomer.map(c => {
    return {...c, order: c.type === `管理` ? 0 : 1}
  })

  const description = arrToLines([
    `このアプリで作成したお客様とNEO上の管理顧客データを統合するためのページです。`,
    `1. アプリ上で作成したデータのうち、NEOの顧客コード未登録のものが対象です。`,
    // `2. 統合する際には、NEOの顧客コードを持つ管理顧客データを選択してください。`,
  ])

  // const kanriCustomerWithoutCode = mergeRequiredAppCustomer.filter(c => {
  //   return true
  //   // return c.type === `管理`
  // })
  // const otherCustomerWithoutCode = mergeRequiredAppCustomer.filter(c => c.type !== `管理`)

  return (
    <Padding>
      <MarkDownDisplay>{description}</MarkDownDisplay>
      <MergeCC {...{mergeRequiredAppCustomer, currentKanriCustomer}} />
    </Padding>
  )
}

export default MergeCustomers
