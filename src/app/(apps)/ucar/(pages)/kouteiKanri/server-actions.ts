'use server'

import {Prisma} from '@prisma/generated/prisma/client'
import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'
import {QueryBuilder} from '@app/(apps)/ucar/class/QueryBuilder'
import {buildWhereConditions, type UcarSearchValues} from '@app/(apps)/ucar/components/search'
import prisma from 'src/lib/prisma'

export type KouteiKanriSearchParams = Partial<UcarSearchValues> & {
  latestProcessCode?: string
}

export type KouteiKanriSearchResponse = {
  success: boolean
  message?: string
  result: any[] | null
}

/**
 * 最新工程でフィルタするためのsateiIDリストを取得
 */
async function getSateiIDsByLatestProcessCode(processCode: string): Promise<string[]> {
  const latestProcesses = await prisma.$queryRaw<{sateiID: string}[]>`
    SELECT up."sateiID"
    FROM "UcarProcess" up
    INNER JOIN (
      SELECT "sateiID", MAX(date) as maxDate
      FROM "UcarProcess"
      GROUP BY "sateiID"
    ) latest ON up."sateiID" = latest."sateiID" AND up.date = latest.maxDate
    WHERE up."processCode" = ${processCode}
  `
  return latestProcesses.map(p => p.sateiID)
}

/**
 * 工程管理用の中古車一覧を検索する
 */
export async function searchKouteiKanri(params: KouteiKanriSearchParams): Promise<KouteiKanriSearchResponse> {
  try {
    const {latestProcessCode, ...searchValues} = params

    // 基本条件
    const whereConditions: Prisma.UcarWhereInput[] = [
      {
        daihatsuReserve: null,
        OldCars_Base: {
          ZAIKO_Base: {isNot: null},
        },
      },
      ...buildWhereConditions(searchValues),
    ]

    // 最新工程でフィルタ
    if (latestProcessCode && latestProcessCode !== '') {
      const sateiIDs = await getSateiIDsByLatestProcessCode(latestProcessCode)
      if (sateiIDs.length > 0) {
        whereConditions.push({sateiID: {in: sateiIDs}})
      } else {
        return {
          success: true,
          result: [],
        }
      }
    }

    const data = await UcarCL.fetcher.getUcarDataList({
      where: {AND: whereConditions},
      orderBy: [{qrIssuedAt: 'desc'}, {processLastUpdatedAt: {sort: 'desc', nulls: 'last'}}],
      take: 100,
      include: QueryBuilder.getInclude({}).ucar.include ?? {},
    })

    return {
      success: true,
      result: data as any,
    }
  } catch (error) {
    console.error('searchKouteiKanri error:', error)
    return {
      success: false,
      message: '検索中にエラーが発生しました',
      result: null,
    }
  }
}
