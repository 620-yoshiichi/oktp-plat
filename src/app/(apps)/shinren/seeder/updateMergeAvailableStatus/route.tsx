import {Shinren} from '@app/(apps)/shinren/class/Shinren'

import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import prisma from 'src/lib/prisma'
import {NextResponse} from 'next/server'
import {transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

export const POST = async () => {
  const mergeMethods = Shinren.rentaCustomer.merge()

  const currentKanriCustomer = await prisma.rentaCustomer.findMany({
    where: {...mergeMethods.kanriCustomerWhere},
    include: {
      User: {},
    },
  })

  const mergeRequiredAppCustomer = await prisma.rentaCustomer.findMany({
    where: {
      NOT: {...mergeMethods.kanriCustomerWhere},
      // OR: [{name: null}, {code: null}],
      // ...(await (await shinrenEasySearchBuilder()).rentaCustomer()).isMergeCandidates?.CONDITION,
    },
    include: {
      User: {},
    },
  })

  //mergeCandidatesIdsを更新するクエリを作成
  const mergeAvailableUpdateQuery: transactionQuery[] = []
  const customersWithMergeIds = mergeMethods.checkIsMergeAvailavle({currentKanriCustomer, mergeRequiredAppCustomer})

  customersWithMergeIds.forEach(c => {
    const {code, mergeCandidates, id} = c
    const mergeCandidatesIds = mergeCandidates.map(c => c.id)
    if (mergeCandidatesIds.length > 0) {
      mergeAvailableUpdateQuery.push({
        model: 'rentaCustomer',
        method: `update`,
        queryObject: {
          where: {
            id: c.id,
          },
          data: {
            mergeCandidatesIds,
          },
        },
      })
    }
  })

  const res = await doTransaction({transactionQueryList: mergeAvailableUpdateQuery})

  return NextResponse.json({
    currentKanriCustomer: currentKanriCustomer.length,
    mergeRequiredAppCustomer: mergeRequiredAppCustomer.length,
    result: res.result.length,
  })
}
