import PeriodForm from '@app/(apps)/shinren/admin/config/non-visit-customers/PeriodForm'
import {getUserIdWhere} from '@app/(apps)/shinren/class/QueryBuilder'
import {Shinren} from '@app/(apps)/shinren/class/Shinren'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Center, C_Stack, Padding, R_Stack} from '@cm/components/styles/common-components/common-components'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import prisma from 'src/lib/prisma'
import {addDays} from 'date-fns'

const NonVisitCustomerPage = async props => {
  const query = await props.searchParams
  const {scopes} = await initServerComopnent({query})
  if (!scopes.login) return <div>ログインしてください</div>
  const userIdWhere = getUserIdWhere({scopes, query})
  const period = Number(query.period ?? 0)

  const where = {
    userId: {...userIdWhere},
    type: {contains: '管理'},
    RentaDailyReport: {none: {date: {gt: addDays(new Date(), -period)}}},
  }
  const customers = await prisma.rentaCustomer.findMany({
    where,
    select: {
      id: true,
      code: true,
      name: true,
      nameTop: true,
      nameBottom: true,
      address1: true,
      kana: true,
      RentaStore: {select: {name: true, id: true}},
      User: {select: {name: true}},
      RentaDailyReport: {
        take: 1,
        orderBy: [{date: 'desc'}],
      },
    },
  })

  return (
    <Padding>
      <Center>
        <C_Stack>
          <PeriodForm />
          <section>
            <R_Stack>
              <p>{formatDate(addDays(new Date(), -period), `YYYY-MM-DD`)}以降に訪問がない顧客一覧</p>
              <p>
                <strong>{customers.length}</strong>件
              </p>
            </R_Stack>
          </section>
          <section className={` table-wrapper [&_td]:!p-2 [&_tr]:!border-2 `}>
            <table>
              <thead>
                <tr>
                  <th>顧客名</th>
                  <th>担当者/店舗</th>
                  <th>最終日報</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, i) => {
                  const {User, RentaStore, RentaDailyReport} = customer
                  const lastReport = RentaDailyReport[0]
                  const lastReportInfo = lastReport?.date && formatDate(lastReport?.date, `YYYY-MM-DD(ddd)`)
                  return (
                    <tr key={i}>
                      <td>
                        <div className={`[&_*]:leading-6`}></div>
                        {Shinren.rentaCustomer.getCustomerDetailLink({customer, query})}
                      </td>
                      <td>
                        {User.name} / {RentaStore && RentaStore?.name}
                      </td>
                      <td>{lastReportInfo}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>
        </C_Stack>
      </Center>
    </Padding>
  )
}

export default NonVisitCustomerPage
