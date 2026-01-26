'use server'

import prisma from 'src/lib/prisma'
import {Prisma} from '@prisma/generated/prisma/client'
import type {UcarSearchParams, UcarSearchResponse, UcarDetailResponse, BrandListResponse, StoreListResponse} from './types'
import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'
import {QueryBuilder} from '@app/(apps)/ucar/class/QueryBuilder'
import {buildWhereConditions} from '@app/(apps)/ucar/components/search'

/**
 * 最新工程でフィルタするためのsateiIDリストを取得
 */
async function getSateiIDsByLatestProcessCode(processCode: string): Promise<string[]> {
  // 各Ucarの最新工程を取得し、指定されたprocessCodeと一致するものを抽出
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
 * 中古車を検索する
 */
export async function searchUcars(params: UcarSearchParams): Promise<UcarSearchResponse> {
  try {
    const {
      keyword,
      brandName,
      driveType,
      latestProcessCode,
      isKei,
      includeSold,
      destinationStoreId,
      page = 1,
      perPage = 20,
    } = params

    // 共通関数で検索条件を構築
    const whereConditions: Prisma.UcarWhereInput[] = [
      {daihatsuReserve: null},
      ...buildWhereConditions({
        keyword,
        brandName,
        driveType,
        isKei,
        includeSold,
        destinationStoreId,
      }),
    ]

    // 最新工程でフィルタ（非同期処理が必要なため別途処理）
    if (latestProcessCode && latestProcessCode !== '') {
      const sateiIDs = await getSateiIDsByLatestProcessCode(latestProcessCode)
      if (sateiIDs.length > 0) {
        whereConditions.push({sateiID: {in: sateiIDs}})
      } else {
        // 該当するsateiIDがない場合は空の結果を返す
        return {
          success: true,
          result: {
            data: [],
            pagination: {page, perPage, total: 0, totalPages: 0},
          },
        }
      }
    }

    // 総件数を取得
    const total = await prisma.ucar.count({
      where: {AND: whereConditions},
    })

    // ページネーション計算
    const totalPages = Math.ceil(total / perPage)
    const skip = (page - 1) * perPage

    // データ取得
    const data = await UcarCL.fetcher.getUcarDataList({
      where: {AND: whereConditions},
      orderBy: [{qrIssuedAt: 'asc'}],
      skip,
      take: perPage,
      include: QueryBuilder.getInclude({}).ucar.include ?? {},
    })

    return {
      success: true,
      result: {
        data: data as any,
        pagination: {
          page,
          perPage,
          total,
          totalPages,
        },
      },
    }
  } catch (error) {
    console.error('searchUcars error:', error)
    return {
      success: false,
      message: '検索中にエラーが発生しました',
      result: null,
    }
  }
}

/**
 * 中古車の詳細を取得する
 */
export async function getUcarDetail(sateiID: string): Promise<UcarDetailResponse> {
  try {
    const ucar = await prisma.ucar.findUnique({
      where: {sateiID},
      include: QueryBuilder.getInclude({}).ucar.include ?? {},
    })

    if (!ucar) {
      return {
        success: false,
        message: '車両が見つかりません',
        result: null,
      }
    }

    return {
      success: true,
      result: ucar as any,
    }
  } catch (error) {
    console.error('getUcarDetail error:', error)
    return {
      success: false,
      message: '詳細取得中にエラーが発生しました',
      result: null,
    }
  }
}

/**
 * ブランド名のリストを取得する
 */
export async function getBrandList(): Promise<BrandListResponse> {
  try {
    const brands = await prisma.uPASS.findMany({
      where: {
        brandName: {not: null},
      },
      select: {
        brandName: true,
      },
      distinct: ['brandName'],
      orderBy: {brandName: 'asc'},
    })

    return {
      success: true,
      result: brands.filter(b => b.brandName).map(b => ({brandName: b.brandName as string})),
    }
  } catch (error) {
    console.error('getBrandList error:', error)
    return {
      success: false,
      result: [],
    }
  }
}

/**
 * 配送先店舗のリストを取得する
 */
export async function getStoreList(): Promise<StoreListResponse> {
  try {
    const stores = await prisma.store.findMany({
      where: {active: true},
      select: {
        id: true,
        name: true,
      },
      orderBy: {sortOrder: 'asc'},
    })

    return {
      success: true,
      result: stores,
    }
  } catch (error) {
    console.error('getStoreList error:', error)
    return {
      success: false,
      result: [],
    }
  }
}
