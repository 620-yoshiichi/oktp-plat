'use server'

import prisma from 'src/lib/prisma'
import {requestResultType} from '@cm/types/types'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import {Prisma, PrismaClient} from '@prisma/generated/prisma/client'

export const createProcessByName = async ({
  tx = prisma,
  session,
  processCode,
  sateiID,
  dataSource = 'web',
}: {
  tx?: Prisma.TransactionClient | PrismaClient
  session: any
  processCode: string
  sateiID: string
  dataSource?: string
}) => {
  const payload = {
    dataSource,
    userId: session?.id,
    sateiID,
    processCode,
  }

  return await tx.ucarProcess.create({
    data: payload,
  })
}

export const getTheSameProcess = async ({processCode, ucar}) => {
  const theSameProcess = await prisma.ucarProcess.findMany({
    where: {
      sateiID: ucar.sateiID,
      processCode: processCode ?? '',
    },
  })
  return theSameProcess
}

export const createProcessWithPostHandler = async ({session, processCode, sateiID, dataSource = 'web'}) => {
  const tx = prisma

  let res: requestResultType = {
    success: false,
    message: '',
    result: null,
  }
  const ProcessCodeItem = UcarProcessCl.CODE.byCode(processCode)

  // 登録
  const createResult = await createProcessByName({
    processCode: ProcessCodeItem?.code ?? '',
    session,
    sateiID,
    dataSource,
  })

  if (ProcessCodeItem?.postHandler) {
    const postHandlerResult = await ProcessCodeItem?.postHandler?.main({
      tx,
      sateiID,
      session,
      processCode: ProcessCodeItem?.code ?? '',
    })

    res = {
      success: true,
      message: ProcessCodeItem?.postHandler?.buildCompleteMessage?.() || '工程を登録しました。',
      result: postHandlerResult,
    }
  } else {
    res = {
      success: true,
      message: '工程を登録しました。',
      result: createResult,
    }
  }

  return res

  // リダイレクト
}
