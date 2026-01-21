import { NextRequest, NextResponse } from 'next/server'
import prisma from 'src/lib/prisma'
import { processBatchWithRetry } from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'
import { handlePrismaError } from '@cm/lib/prisma-helper'
import { isDev } from '@cm/lib/methods/common'

/**
 * Ucar と OldCars_Base の紐付けバッチ処理
 *
 * 98番号が入力されているUcarのうち、OldCars_Baseが紐づいていない車両に対して、
 * 該当の98番号のうち仕入日が小さいものから順に割り当てる
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

  if (!isDev) {
    return NextResponse.json({ message: 'This is not allowed in production', ...result })
  }

  await prisma.ucar.updateMany({
    where: { number98: { not: '' } },
    data: { DD_SIIRE: null },
  })

  // 既に割り当てられているOldCars_Baseの組み合わせを取得
  const assignedOldCars = await prisma.ucar.findMany({
    where: {
      NO_SIRETYUM: { not: null, notIn: [''] },
      number98: { not: null, notIn: [''] },
      DD_SIIRE: { not: null },
    },
    select: {
      NO_SIRETYUM: true,
      number98: true,
      DD_SIIRE: true,
    },
  })

  // 既に割り当てられている組み合わせをSetで管理（重複チェック用）
  const assignedSet = new Set(
    assignedOldCars.map(
      car => `${car.NO_SIRETYUM}|${car.number98}|${car.DD_SIIRE?.toISOString() ?? ''}`
    )
  )

  // 98番号が入力されていて、OldCars_Baseとの紐付けがされていないUcarを取得（作成日の昇順）
  const ucarsWithNumber98 = await prisma.ucar.findMany({
    where: {
      number98: {
        not: null,
        notIn: [''],
      },
    },
    orderBy: {
      createdAt: 'asc', // 作成日の昇順で取得
    },
    select: {
      id: true,
      sateiID: true,
      number98: true,
      NO_SIRETYUM: true,
      DD_SIIRE: true,
      createdAt: true,
      UPASS: {
        select: {
          assessmentdatetime: true,
        },
      },
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
          try {
            // 該当の98番号を持つOldCars_Baseの中で、仕入日が小さいものから順に取得
            // 既に割り当てられているものは除外
            const availableOldCars = await prisma.oldCars_Base.findMany({
              where: {
                NO_SYARYOU: ucar?.number98 ?? '',
                DD_SIIRE: { not: null },
              },
              orderBy: {
                DD_SIIRE: 'asc', // 仕入日の昇順で取得
              },
              select: {
                NO_SIRETYUM: true,
                NO_SYARYOU: true,
                DD_SIIRE: true,
              },
            })

            // 既に割り当てられていない最初のOldCars_Baseを取得
            // 査定日よりも仕入日が古い場合は除外
            const availableOldCar = availableOldCars.find(car => {
              // 既に割り当てられている場合は除外
              if (
                assignedSet.has(
                  `${car.NO_SIRETYUM ?? ''}|${car.NO_SYARYOU ?? ''}|${car.DD_SIIRE?.toISOString() ?? ''}`
                )
              ) {
                return false
              }

              // 査定日が存在し、仕入日が査定日よりも古い場合は除外
              if (ucar.UPASS?.assessmentdatetime && car.DD_SIIRE) {
                if (car.DD_SIIRE < ucar.UPASS.assessmentdatetime) {
                  return false
                }
              }

              return true
            })

            if (!availableOldCar) {
              result.skipped++
              return
            }

            // Ucarを更新してOldCars_Baseとのリレーションを設定
            try {
              await prisma.ucar.update({
                where: {
                  sateiID: ucar.sateiID,
                },
                data: {
                  number98: availableOldCar.NO_SYARYOU ?? '',
                  NO_SIRETYUM: availableOldCar.NO_SIRETYUM ?? '',
                  DD_SIIRE: availableOldCar.DD_SIIRE ?? null,
                },
              })

              // 割り当てた組み合わせをSetに追加（重複防止）
              assignedSet.add(
                `${availableOldCar.NO_SIRETYUM ?? ''}|${availableOldCar.NO_SYARYOU ?? ''}|${availableOldCar.DD_SIIRE?.toISOString() ?? ''}`
              )

              result.linked++
            } catch (error) {
              const errorMessage = handlePrismaError(error)
              console.error(`Failed to update ucar: sateiID=${ucar.sateiID}`, errorMessage)
              result.errors.push(`sateiID: ${ucar.sateiID} - ${errorMessage}`)
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            result.errors.push(`sateiID: ${ucar.sateiID} - ${errorMessage}`)
          }
        })
      )
    },
  })

  console.log({ message: 'Ucar-OldCars_Base linkage completed', ...result })

  return NextResponse.json(result)
}
