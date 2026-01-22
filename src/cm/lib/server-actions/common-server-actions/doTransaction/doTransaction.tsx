'use server'

import { requestResultType } from '@cm/types/types'
import prisma from 'src/lib/prisma'
import { prismaMethodType, PrismaModelNames } from '@cm/types/prisma-types'
import { PrismaClient } from '@prisma/generated/prisma/client'
import { isServerActionAccessAllowed } from '@app/api/prisma/isAllowed'

export type transactionQuery<T extends PrismaModelNames = PrismaModelNames, M extends prismaMethodType = prismaMethodType> = {
  model: T
  method: M
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  queryObject: Parameters<PrismaClient[T][M]>[0]
  transactiondb?: any
}

type mode = 'transaction' | 'parallel' | 'sequential'
export const doTransaction = async (props: { transactionQueryList: transactionQuery[]; mode?: mode; uniqueKey?: string }) => {
  // 認証チェック
  const isAllowed = await isServerActionAccessAllowed()
  if (!isAllowed) {
    return {
      success: false,
      message: 'アクセスが禁止されています',
      result: null,
    } as requestResultType
  }

  if (props.transactionQueryList.length === 0) {
    return { success: false, result: [], message: '更新するデータがありません。' }
  }

  const { transactionQueryList, mode = 'parallel' } = props
  const message = `${transactionQueryList.length}件を一括更新しました。`

  const errorItemList: (transactionQuery<any, any> & { error: string })[] = []

  try {
    let data: any[] = []
    if (mode === 'transaction') {
      data = await prisma.$transaction(async tx => {
        const promises = transactionQueryList.map(async q => {
          try {
            const { model, method, queryObject } = q
            return await tx[model][method](queryObject)
          } catch (error) {
            errorItemList.push({ ...q, error: error.message })
            throw new Error(error.message)
          }
        })
        return await Promise.all(promises)
      })
    } else if (mode === 'parallel') {
      const promises = transactionQueryList.map(async (q, index) => {
        try {
          const { model, method, queryObject } = q

          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/2f19b60b-6ff5-4ce2-bb73-d9ffe580d2a6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'doTransaction.tsx:57',message:'before prisma call detailed',data:{index,model,method,where:queryObject?.where,whereType:typeof queryObject?.where,whereAPPINDEX:queryObject?.where?.APPINDEX,whereAPPINDEXType:typeof queryObject?.where?.APPINDEX,createHasStoreId:'storeId' in (queryObject?.create||{}),createHasUserId:'userId' in (queryObject?.create||{}),createStoreIdValue:queryObject?.create?.storeId,createUserIdValue:queryObject?.create?.userId,createStoreIdType:typeof queryObject?.create?.storeId,createUserIdType:typeof queryObject?.create?.userId,createStore:queryObject?.create?.Store,createUser:queryObject?.create?.User,createStoreId:queryObject?.create?.Store?.connect?.id,createUserId:queryObject?.create?.User?.connect?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion

          const result = await prisma[model][method](queryObject)

          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/2f19b60b-6ff5-4ce2-bb73-d9ffe580d2a6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'doTransaction.tsx:60',message:'after prisma call success',data:{index,model,method,resultType:typeof result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion

          return result
        } catch (error) {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/2f19b60b-6ff5-4ce2-bb73-d9ffe580d2a6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'doTransaction.tsx:63',message:'prisma call error',data:{index,model:q.model,method:q.method,errorMessage:error?.message,errorType:typeof error,errorIsNumber:typeof error==='number',queryObjectType:typeof q.queryObject,queryObjectString:String(q.queryObject).slice(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion

          errorItemList.push({ ...q, error: error.message })
          return null
        }
      })
      data = await Promise.all(promises)
      data = data.filter(d => d !== null)
    } else if (mode === 'sequential') {
      for (const q of transactionQueryList) {
        const { model, method, queryObject } = q
        data.push(await prisma[model][method](queryObject))
      }
    }

    const result: requestResultType = { success: true, result: data, message }

    return result
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/2f19b60b-6ff5-4ce2-bb73-d9ffe580d2a6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'doTransaction.tsx:78',message:'catch block error',data:{errorMessage:error?.message,errorType:typeof error,errorIsNumber:typeof error==='number',errorString:String(error),errorKeys:error?Object.keys(error):null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    throw new Error(error.message)
    // console.error(error.stack)
    // const result: requestResultType = {
    //   success: false,
    //   message: error.message,
    //   result: errorItemList,
    // }
  } finally {
    //
  }
}
