import {NextRequest, NextResponse} from 'next/server'

import {calcNextNumber98} from '@app/(apps)/ucar/(lib)/num98/calcNextNumber98'
import {superTrim} from '@cm/lib/methods/common'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

export const POST = async (req: NextRequest) => {
  let result

  const num98Array: transactionQuery[] = []
  new Array(9999).fill(0).reduce((acc, curr, i) => {
    // if(98 9000)

    // if (i > 1) return
    const nextNum = calcNextNumber98(acc.toString())

    const num = Number(superTrim(nextNum))
    const occupied = num >= 9890000 && num <= 9899999 ? true : false

    num98Array.push({
      model: `number98`,
      method: `upsert`,
      queryObject: {
        where: {number: nextNum},
        create: {
          number: nextNum,
          occupied,
          sortNumber: Number(superTrim(nextNum)),
        },
        update: {
          number: nextNum,
          occupied,
          sortNumber: Number(superTrim(nextNum)),
        },
      },
    })
    return nextNum
  }, 1)
  const number98many = await doTransaction({transactionQueryList: num98Array})

  return NextResponse.json({number98many})
}
