import type { UcarSearchValues } from './types'
import { URL_PARAM_KEYS } from './types'

/**
 * サーバーコンポーネント用: searchParamsから検索値を取得
 * クライアント・サーバーどちらからでも呼び出し可能
 */
export function getSearchValuesFromParams(
  searchParams: Record<string, string | string[] | undefined>
): Partial<UcarSearchValues> {
  const getValue = (field: keyof UcarSearchValues): string => {
    const value = searchParams[URL_PARAM_KEYS[field]]
    return typeof value === 'string' ? value : ''
  }

  const getBoolValue = (field: keyof UcarSearchValues): boolean => {
    return searchParams[URL_PARAM_KEYS[field]] === 'true'
  }

  return {
    keyword: getValue('keyword'),
    brandName: getValue('brandName'),
    driveType: getValue('driveType'),
    latestProcessCode: getValue('latestProcessCode'),
    destinationStoreId: getValue('destinationStoreId'),
    isKei: getBoolValue('isKei'),
    includeSold: getBoolValue('includeSold'),
    modelName: getValue('modelName'),
    color: getValue('color'),
    frame: getValue('frame'),
    sateiID: getValue('sateiID'),
  }
}
