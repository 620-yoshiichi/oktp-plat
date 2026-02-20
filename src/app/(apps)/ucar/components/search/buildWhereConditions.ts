import type {Prisma} from '@prisma/generated/prisma/client'
import type {UcarSearchValues} from './types'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

// 軽自動車の排気量上限（660cc）
const KEI_DISPLACEMENT_MAX = '660'

/**
 * 半角スペースで区切られた複数ワードをパースする
 */
function parseSearchWords(input: string): string[] {
  return input
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
}

/**
 * 1つのキーワードに対する検索条件を生成（複数フィールドOR検索）
 */
function buildKeywordCondition(kw: string): Prisma.UcarWhereInput {
  return {
    OR: [
      {sateiID: {contains: kw}},
      {plate: {contains: kw}},
      {number98: {contains: kw}},
      {
        UPASS: {
          OR: [
            {brandName: {contains: kw}},
            {modelName: {contains: kw}},
            {type: {contains: kw}},
            {commonType: {contains: kw}},
            {chassisNumber: {contains: kw}},
            {registrationSerialNumber: {contains: kw}},
          ],
        },
      },
    ],
  }
}

/**
 * 1つのメーカー名に対する検索条件を生成
 */
function buildBrandCondition(brand: string): Prisma.UcarWhereInput {
  return {
    OR: [{UPASS: {brandName: {contains: brand}}}, {tmpBrandName: {contains: brand}}],
  }
}

/**
 * 検索値からPrismaのWHERE条件を構築する
 *
 * 注意: latestProcessCodeの条件は非同期処理が必要なため、
 * この関数では処理せず、別途処理が必要
 *
 * @param values 検索値（部分的な値も可）
 * @returns Prisma.UcarWhereInput の配列（ANDで結合して使用）
 */
export async function buildWhereConditions(values: Partial<UcarSearchValues>): Promise<Prisma.UcarWhereInput[]> {
  const whereConditions: Prisma.UcarWhereInput[] = []

  // キーワード検索（半角スペースで区切った複数ワードをAND検索）
  if (values.keyword && values.keyword.trim() !== '') {
    const keywords = parseSearchWords(values.keyword)
    keywords.forEach(kw => {
      whereConditions.push(buildKeywordCondition(kw))
    })
  }

  // メーカー検索（半角スペースで区切った複数ワードをAND検索）
  if (values.brandName && values.brandName.trim() !== '') {
    const brands = parseSearchWords(values.brandName)
    brands.forEach(brand => {
      whereConditions.push(buildBrandCondition(brand))
    })
  }

  // 駆動式名称検索（半角スペースで区切った複数ワードをAND検索）
  if (values.driveType && values.driveType.trim() !== '') {
    const driveTypes = parseSearchWords(values.driveType)
    driveTypes.forEach(dt => {
      whereConditions.push({
        UPASS: {driveType: {contains: dt}},
      })
    })
  }

  // 普通車 / 軽四 フィルタ
  const showRegular = values.showRegular ?? true
  const showKei = values.showKei ?? true

  if (showRegular && !showKei) {
    // 普通車のみ: 排気量が660cc以外 or UPASSなし
    whereConditions.push({
      OR: [{UPASS: {displacement: {not: KEI_DISPLACEMENT_MAX}}}, {UPASS: null}],
    })
  } else if (!showRegular && showKei) {
    // 軽四のみ: 排気量660cc
    whereConditions.push({
      UPASS: {displacement: {equals: KEI_DISPLACEMENT_MAX}},
    })
  } else if (!showRegular && !showKei) {
    // どちらも未選択 → 結果なし
    whereConditions.push({sateiID: {equals: '__NONE__'}})
  }
  // 両方 true の場合は条件を追加しない（全件表示）

  // 売上済 / 未販売 フィルタ
  const showSold = values.showSold ?? false
  const showUnsold = values.showUnsold ?? true

  if (showSold && showUnsold) {
    console.info('売り上げに関わらず表示')
  } else if (showSold && !showUnsold) {
    console.info('売上済のみ表示')
    whereConditions.push({
      OldCars_Base: {KI_HANKAKA: {gt: '0'}},
    })
  } else if (!showSold && showUnsold) {
    // 未販売のみ: KI_HANKAKA !== '0'
    whereConditions.push({
      OR: [
        //
        {OldCars_Base: {KI_HANKAKA: '0'}},
        {OldCars_Base: null},
      ],
    })
  } else if (!showSold && !showUnsold) {
    // どちらも未選択 → 結果なし
    whereConditions.push({sateiID: {equals: '__NONE__'}})
    console.info('どちらも未選択 → 結果なし')
  }
  // 両方 true の場合は条件を追加しない（全件表示）

  // 配送先店舗フィルター
  // 表示ロジック: storeList.find(store => store.id === Number(zaikoBase?.CD_ZAIKOTEN ?? 0)) || DestinationStore
  // なので、CD_ZAIKOTEN または destinationStoreId のどちらかにマッチするようにする
  if (values.destinationStoreId && values.destinationStoreId !== '') {
    const storeId = parseInt(values.destinationStoreId, 10)
    const {result: store} = await doStandardPrisma('store', 'findUnique', {
      where: {id: storeId},
    })

    whereConditions.push({
      OR: [
        {
          OldCars_Base: {
            ZAIKO_Base: {
              CD_ZAIKOTEN: String(store?.code ?? ''),
            },
          },
        },
        {destinationStoreId: storeId},
      ],
    })
  }

  // 査定ID検索（単独検索用）
  if (values.sateiID && values.sateiID.trim() !== '') {
    whereConditions.push({
      sateiID: {contains: values.sateiID.trim()},
    })
  }

  // UPASS関連条件（kouteiKanri用）
  const upassConditions: Prisma.UPASSWhereInput[] = []

  if (values.modelName && values.modelName.trim() !== '') {
    upassConditions.push({modelName: {contains: values.modelName.trim()}})
  }

  if (values.color && values.color.trim() !== '') {
    upassConditions.push({exteriorColor: {contains: values.color.trim()}})
  }

  if (values.frame && values.frame.trim() !== '') {
    upassConditions.push({chassisNumber: {contains: values.frame.trim()}})
  }

  if (upassConditions.length > 0) {
    whereConditions.push({
      UPASS: {
        AND: upassConditions,
      },
    })
  }

  return whereConditions
}

/**
 * 最新工程でフィルタするためのsateiIDリストを取得するためのSQL
 * サーバーサイドでのみ使用可能
 */
export const LATEST_PROCESS_SQL = `
  SELECT up."sateiID"
  FROM "UcarProcess" up
  INNER JOIN (
    SELECT "sateiID", MAX(date) as maxDate
    FROM "UcarProcess"
    GROUP BY "sateiID"
  ) latest ON up."sateiID" = latest."sateiID" AND up.date = latest.maxDate
  WHERE up."processCode" = $1
`
