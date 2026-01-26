'use client'

import React, { useMemo, useState, useEffect } from 'react'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import { Fields } from '@cm/class/Fields/Fields'
import { Button } from '@cm/components/styles/common-components/Button'
import { UcarProcessCl } from '@app/(apps)/ucar/class/UcarProcessCl'
import type { UcarSearchValues, StoreOption, ProcessCodeOption } from './types'
import { DEFAULT_SEARCH_VALUES } from './types'

/**
 * 検索フォームに表示するフィールドを指定する型
 */
export type UcarSearchFormFields = {
  keyword?: boolean
  brandName?: boolean
  driveType?: boolean
  latestProcessCode?: boolean
  destinationStoreId?: boolean
  isKei?: boolean
  includeSold?: boolean
  modelName?: boolean
  color?: boolean
  frame?: boolean
  sateiID?: boolean
}

/**
 * UcarSearchFormのProps
 */
type UcarSearchFormProps = {
  // 現在の検索値
  values: Partial<UcarSearchValues>

  // 検索実行
  onSearch: (values: Partial<UcarSearchValues>) => void

  // リセット
  onReset: () => void

  // 表示するフィールド（指定しない場合は全て表示しない）
  fields: UcarSearchFormFields

  // マスターデータ（セレクト用）
  storeList?: StoreOption[]
  processCodeList?: ProcessCodeOption[]

  // ローディング状態
  isLoading?: boolean

  // フォームのスタイル
  className?: string
}

/**
 * Ucar検索共通フォームコンポーネント
 *
 * 使用例:
 * ```tsx
 * <UcarSearchForm
 *   values={searchValues}
 *   onSearch={handleSearch}
 *   onReset={handleReset}
 *   fields={{
 *     keyword: true,
 *     brandName: true,
 *     latestProcessCode: true,
 *   }}
 *   storeList={storeList}
 *   isLoading={isSearching}
 * />
 * ```
 */
export function UcarSearchForm({
  values,
  onSearch,
  onReset,
  fields,
  storeList = [],
  isLoading = false,
  className = '',
}: UcarSearchFormProps) {
  // 内部状態でフォームの値を管理
  const [formValues, setFormValues] = useState<Partial<UcarSearchValues>>({
    ...DEFAULT_SEARCH_VALUES,
    ...values,
  })

  // valuesが変更されたら内部状態を更新
  useEffect(() => {
    setFormValues({
      ...DEFAULT_SEARCH_VALUES,
      ...values,
    })
  }, [values])

  // 店舗選択肢
  const storeOptions = useMemo(() => {
    return [
      { value: '', label: '全て' },
      ...storeList.map(s => ({ value: String(s.id), label: s.name })),
    ]
  }, [storeList])

  // 表示するフィールドを構築
  const fieldColumns = useMemo(() => {
    const columns: any[] = []

    if (fields.keyword) {
      columns.push({
        id: 'keyword',
        label: 'キーワード',
        inputProps: { placeholder: '査定NO / 車名 / 型式 / 車体番号 / プレート' },
        form: {
          defaultValue: formValues.keyword ?? '',
          style: { width: 280 },
        },
      })
    }

    if (fields.sateiID) {
      columns.push({
        id: 'sateiID',
        label: '査定ID',
        inputProps: { placeholder: '査定IDで検索' },
        form: {
          defaultValue: formValues.sateiID ?? '',
          style: { width: 140 },
        },
      })
    }

    if (fields.brandName) {
      columns.push({
        id: 'brandName',
        label: 'メーカー',
        inputProps: { placeholder: 'トヨタ ダイハツ など' },
        form: {
          defaultValue: formValues.brandName ?? '',
          style: { width: 160 },
        },
      })
    }

    if (fields.modelName) {
      columns.push({
        id: 'modelName',
        label: '車名',
        inputProps: { placeholder: '車名で検索' },
        form: {
          defaultValue: formValues.modelName ?? '',
          style: { width: 140 },
        },
      })
    }

    if (fields.color) {
      columns.push({
        id: 'color',
        label: 'カラー',
        inputProps: { placeholder: 'カラーで検索' },
        form: {
          defaultValue: formValues.color ?? '',
          style: { width: 120 },
        },
      })
    }

    if (fields.frame) {
      columns.push({
        id: 'frame',
        label: 'フレーム',
        inputProps: { placeholder: 'フレームで検索' },
        form: {
          defaultValue: formValues.frame ?? '',
          style: { width: 140 },
        },
      })
    }

    if (fields.latestProcessCode) {
      columns.push({
        id: 'latestProcessCode',
        label: '最新工程',
        type: 'select',
        forSelect: {
          codeMaster: UcarProcessCl.CODE,
        },
        form: {
          defaultValue: formValues.latestProcessCode ?? '',
          style: { width: 140 },
        },
      })
    }

    if (fields.destinationStoreId) {
      columns.push({
        id: 'destinationStoreId',
        label: '配送先',
        type: 'select',
        forSelect: {
          optionsOrOptionFetcher: storeOptions,
        },
        form: {
          defaultValue: formValues.destinationStoreId ?? '',
          style: { width: 140 },
        },
      })
    }

    if (fields.driveType) {
      columns.push({
        id: 'driveType',
        label: '駆動式',
        inputProps: { placeholder: '4WD FF など' },
        form: {
          defaultValue: formValues.driveType ?? '',
          style: { width: 120 },
        },
      })
    }

    if (fields.isKei) {
      columns.push({
        id: 'isKei',
        label: '軽四',
        type: 'boolean',
        form: {
          defaultValue: formValues.isKei ?? false,
        },
      })
    }

    if (fields.includeSold) {
      columns.push({
        id: 'includeSold',
        label: '売上済も表示',
        type: 'boolean',
        form: {
          defaultValue: formValues.includeSold ?? false,
        },
      })
    }

    return columns
  }, [fields, formValues, storeOptions])

  const { BasicForm, latestFormData } = useBasicFormProps({
    columns: new Fields(fieldColumns).transposeColumns(),
  })

  const handleReset = () => {
    setFormValues(DEFAULT_SEARCH_VALUES)
    onReset()
  }

  return (
    <div className={`p-4 bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <BasicForm
        alignMode="row"
        latestFormData={latestFormData}
        ControlOptions={{
          ControlStyle: {
            fontSize: 13,
            height: 32,
          },
        }}
        onSubmit={async data => {
          const searchValues: Partial<UcarSearchValues> = {}

          if (fields.keyword) searchValues.keyword = data.keyword || ''
          if (fields.sateiID) searchValues.sateiID = data.sateiID || ''
          if (fields.brandName) searchValues.brandName = data.brandName || ''
          if (fields.modelName) searchValues.modelName = data.modelName || ''
          if (fields.color) searchValues.color = data.color || ''
          if (fields.frame) searchValues.frame = data.frame || ''
          if (fields.driveType) searchValues.driveType = data.driveType || ''
          if (fields.latestProcessCode) searchValues.latestProcessCode = data.latestProcessCode || ''
          if (fields.destinationStoreId) searchValues.destinationStoreId = data.destinationStoreId || ''
          if (fields.isKei) searchValues.isKei = Boolean(data.isKei)
          if (fields.includeSold) searchValues.includeSold = Boolean(data.includeSold)

          onSearch(searchValues)
        }}
      >
        <div className="flex gap-2 items-center">
          <Button
            size="sm"
            type="submit"
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            {isLoading ? '検索中...' : '検索'}
          </Button>
          <Button
            size="sm"
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition-colors"
          >
            リセット
          </Button>
        </div>
      </BasicForm>
    </div>
  )
}
