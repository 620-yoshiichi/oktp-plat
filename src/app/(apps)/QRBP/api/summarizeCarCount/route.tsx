import {RELEVANT_KEYS} from '@app/(apps)/QRBP/admin/summary/constants'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'

import {EasySearchObject} from '@cm/class/builders/QueryBuilderVariables'
import prisma from 'src/lib/prisma'
import {Prisma} from '@prisma/client'

import {addDays} from 'date-fns'
import {NextResponse} from 'next/server'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {QrbpEasySearchBuilder} from 'src/non-common/EsCollection/QRBP_EasySearchBuilder'

export const POST = async req => {
  const date = getMidnight(addDays(new Date(), 0))

  // 0~20の数字をランダムに

  const session = (await prisma.user.findFirst({where: {role: '管理者'}})) as any
  const additionalWhere = {OR: [{customerName: {not: {contains: '（下）'}}}, {customerName: null}]}
  const conditions = await (await QrbpEasySearchBuilder()).car({session: {role: '管理者'}, query: {}})
  const CONDITIONS = Object.values(conditions).filter((cond: EasySearchObject) => {
    return RELEVANT_KEYS.includes(cond.id)
  })

  const stores = await prisma.store.findMany({})

  type summary = {
    store: any
    count: any
    id: any
    label: any
    date: any
  }
  const transactionQueryList: transactionQuery[] = []
  const summaryArr: summary[] = []
  for (const key of Object.keys(CONDITIONS)) {
    const {label, id, CONDITION} = CONDITIONS[key] as EasySearchObject
    const result = await prisma.car.groupBy({
      by: ['storeId'],
      where: CONDITION,
      _count: true,
    })

    result.forEach(async (r, idx) => {
      const count = r._count
      // const count = fakeCount
      const storeId = r.storeId
      const key = id
      if (!storeId || !r || !RELEVANT_KEYS.includes(key)) return

      const unique_date_key_storeId = {key, storeId: storeId, date: date}

      const data = {key, label, storeId, count, date}

      const queryObject: Prisma.BpSummaryUpsertArgs = {
        where: {unique_date_key_storeId},
        create: data,
        update: data,
      }

      transactionQueryList.push({
        model: 'bpSummary',
        method: 'upsert',
        queryObject,
      })
    })
  }

  const result = await doTransaction({transactionQueryList: transactionQueryList})

  return NextResponse.json({success: true, result})
}
