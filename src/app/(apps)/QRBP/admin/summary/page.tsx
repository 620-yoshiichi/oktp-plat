import ClientTable from '@app/(apps)/QRBP/admin/summary/ClientTable'
import {RELEVANT_KEYS} from '@app/(apps)/QRBP/admin/summary/constants'

import {EasySearchObject} from '@cm/class/builders/QueryBuilderVariables'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import prisma from 'src/lib/prisma'
import {addDays, eachDayOfInterval} from 'date-fns'
import {QrbpEasySearchBuilder} from 'src/non-common/EsCollection/QRBP_EasySearchBuilder'

const SymmaryPage = async props => {
  const query = await props.searchParams
  const additionalWhere = {OR: [{customerName: {not: {contains: '（下）'}}}, {customerName: null}]}
  // const {getEasySearch} = QueryBuilder.EasySearch({
  //   session: {role: '管理者'},
  //   query: {},
  //   additionalWhere: additionalWhere,
  // })

  const conditions = await (await QrbpEasySearchBuilder()).car({session: {role: '管理者'}, query: {}})

  // let CONDITIONS = (await getEasySearch()) as EasySearchObject[]

  const {result: summariesInPeriod} = await doStandardPrisma('bpSummary', 'groupBy', {
    by: ['date', 'key', 'label'],
    _sum: {
      count: true,
    },

    orderBy: [{date: 'asc'}],
    where: {
      key: {
        in: RELEVANT_KEYS,
      },
    },
  })

  const CONDITIONS = Object.values(conditions).filter((cond: EasySearchObject) => {
    return RELEVANT_KEYS.includes(cond.id)
  })

  const today = new Date()
  const from = addDays(today, -50)
  const to = addDays(today, 0)
  const days = eachDayOfInterval({start: from, end: to})

  const stores = await prisma.store.findMany({
    orderBy: [{sortOrder: 'asc'}],
    where: {
      name: {
        notIn: ['HAC BASE', 'CHU BASE津山', 'CHU BASE岡山', '中古車グループ', 'CHU BASE倉敷', '法人営業部', '本部'],
      },
    },
  })

  const detailMode = true
  const ClientProps = {
    CONDITIONS,
    RELEVANT_KEYS,
    days,
    summariesInPeriod,
    stores,
    detailMode,
  }

  return <ClientTable {...ClientProps} />
}

export default SymmaryPage
