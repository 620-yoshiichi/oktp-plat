import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'
import {processBatchWithRetry} from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import {handlePrismaError} from '@cm/lib/prisma-helper'

/**
 * Ucar と OldCars_Base の紐付けバッチ処理
 *
 * 98番号が入力されているUcarのうち、OldCars_Baseが紐づいていない車両に対して、
 * 該当の98番号のうちもっとも新しい仕入日のOldCars_Baseに対してリレーションを貼る
 *
 * 複合キー構成:
 * - Ucar: NO_SIRETYUM, number98, DD_SIIRE
 * - OldCars_Base: NO_SIRETYUM, NO_SYARYOU, DD_SIIRE
 */
export const POST = async (req: NextRequest) => {
  const result: {
    processed: number
    linked: number
    skipped: number
    errors: string[]
  } = {
    processed: 0,
    linked: 0,
    skipped: 0,
    errors: [],
  }

  // 98番号が入力されていて、OldCars_Baseとの紐付けがされていないUcarを取得
  const ucarsWithNumber98 = await prisma.ucar.findMany({
    where: {
      number98: {
        not: null,
        notIn: [''],
      },
    },
    select: {
      id: true,
      sateiID: true,
      number98: true,
      NO_SIRETYUM: true,
      DD_SIIRE: true,
    },
  })

  result.processed = ucarsWithNumber98.length

  await processBatchWithRetry({
    options: {
      batchSize: 2000,
      retries: 1,
    },
    soruceList: ucarsWithNumber98,
    mainProcess: async batch => {
      await Promise.all(
        batch.map(async ucar => {
          // 該当の98番号を持つOldCars_Baseの中で、もっとも新しい仕入日のものを取得
          try {
            // 該当の98番号を持つOldCars_Baseの中で、もっとも新しい仕入日のものを取得
            const latestOldCar = await prisma.oldCars_Base.findFirst({
              where: {
                NO_SYARYOU: ucar.number98,
                DD_SIIRE: {
                  not: null,
                },
                NO_SIRETYUM: {
                  not: null,
                  notIn: [''],
                },
              },
              orderBy: {
                DD_SIIRE: 'desc', // 仕入日の降順で最新を取得
              },
              select: {
                NO_SIRETYUM: true,
                NO_SYARYOU: true,
                DD_SIIRE: true,
              },
            })

            // Ucarを更新してOldCars_Baseとのリレーションを設定
            try {
              await prisma.ucar.update({
                where: {
                  sateiID: ucar.sateiID,
                },
                data: {
                  number98: latestOldCar?.NO_SYARYOU ?? '',
                  NO_SIRETYUM: latestOldCar?.NO_SIRETYUM ?? '',
                  DD_SIIRE: latestOldCar?.DD_SIIRE ?? null,
                },
              })
            } catch (error) {
              const errorMessage = handlePrismaError(error)
              console.error(`Failed to update ucar: sateiID=${ucar.sateiID}`, errorMessage)
            }

            result.linked++
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            result.errors.push(`sateiID: ${ucar.sateiID} - ${errorMessage}`)
          }
        })
      )
    },
  })

  console.log({message: 'Ucar-OldCars_Base linkage completed', ...result})

  return NextResponse.json(result)
}
