import {colType} from '@cm/types/col-types'
import {anyObject} from '@cm/types/utility-types'

export type transposeColumnsOptionProps = {
  autoSplit?: {
    table?: number
    form?: number
  }
} & anyObject

export type optionsOrOptionFetcherProps = {
  latestFormData?: anyObject
  col: colType
  // additionalQuery?: anyObject
}

export type optionsOrOptionFetcherType = (
  props: optionsOrOptionFetcherProps
) => Promise<{optionObjArr: optionType[]; modelName?: string}>

/**
 * セレクトオプションの型定義
 * - id: DBに格納される識別子（必須）
 * - label: UIに表示される値（任意、なければidを文字列化）
 * - color: オプションの色（任意）
 */
export type optionType = {
  id: any
  label?: string
  color?: string
} & anyObject
