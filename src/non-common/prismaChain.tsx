import {getChainSql} from '@app/(apps)/newCar/class/NewCarClass/newCarChain/newCarChainMethod'

import {torokuDatefinalizeUpdate} from '@app/(apps)/newCar/server-actions/torokuDatefinalizeUpdate'
import {fetchRawSql} from '@cm/class/Fields/lib/methods'
import {prismaMethodType, PrismaModelNames} from '@cm/types/prisma-types'
import {requestResultType} from '@cm/types/types'

type chainType = {
  [key in PrismaModelNames]?: {
    when: prismaMethodType[]
    do: (props: {res: requestResultType; queryObject: any}) => Promise<any>
  }[]
}
export const prismaChain: chainType = {
  newCar: [
    {
      when: ['create', `update`, `upsert`],
      do: async ({res, queryObject}) => {
        const res2 = await fetchRawSql({sql: getChainSql({carId: res.result.id})})
        const {id, earliestHaisouDate} = res2.rows[0]

        return res2
      },
    },
  ],
  desiredTorokuDate: [
    {
      when: ['create', `update`, `upsert`, `delete`],
      do: async ({res, queryObject}) => {
        const chainRes: requestResultType = await torokuDatefinalizeUpdate({res, queryObject})

        return chainRes
      },
    },
  ],
}
