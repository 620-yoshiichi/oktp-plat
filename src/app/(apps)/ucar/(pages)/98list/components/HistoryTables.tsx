'use client'

import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { NumHandler } from '@cm/class/NumHandler'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import type { Search98NumberResult, getNumber98IssueHistory } from '@app/(apps)/ucar/(lib)/num98/search98Number'

type SearchListItem = {
  number: string
  sortNumber: number | null
  occupied: boolean | null
  ucarCount: number
  oldCarsCount: number
}

type IssueHistoryItem = Awaited<ReturnType<typeof getNumber98IssueHistory>>[number]

/** 部分一致リスト */
export function PartialMatchList({
  searchList,
  onNumberClick,
}: {
  searchList: SearchListItem[]
  onNumberClick: (number: string) => void
}) {
  return CsvTable({
    records: searchList.map((item) => ({
      className: item.occupied ? '[&_td]:!bg-yellow-50' : '',
      csvTableRow: [
        {
          label: '98番号',
          cellValue: (
            <button className="t-link text-left" onClick={() => onNumberClick(item.number)}>
              {item.number}
            </button>
          ),
        },
        { label: 'ソート番号', cellValue: item.sortNumber ?? '-' },
        { label: '占有', cellValue: item.occupied ? 'ON' : 'OFF' },
        { label: 'Ucar数', cellValue: item.ucarCount },
        { label: '古物数', cellValue: item.oldCarsCount },
      ],
    })),
  }).WithWrapper({ className: 'max-h-[300px] ' })
}

/** Ucar履歴テーブル */
export function UcarHistoryTable({ ucarHistory }: { ucarHistory: Search98NumberResult['ucarHistory'] }) {
  if (ucarHistory.length === 0) {
    return <p className="text-gray-500 text-sm">データなし</p>
  }

  return CsvTable({
    records: ucarHistory.map((ucar) => ({
      csvTableRow: [
        { label: '査定ID', cellValue: ucar.sateiID },
        { label: 'プレート', cellValue: ucar.plate ?? '-' },
        { label: '行先', cellValue: ucar.destination ?? '-' },
        { label: '仕入伝票', cellValue: ucar.NO_SIRETYUM ?? '-' },
        { label: '仕入日', cellValue: ucar.DD_SIIRE ? formatDate(ucar.DD_SIIRE, 'YYYY/MM/DD') : '-' },
        { label: '登録日', cellValue: formatDate(ucar.createdAt, 'YYYY/MM/DD') },
      ],
    })),
  }).WithWrapper({ className: 'max-h-[400px] ' })
}

/** OldCars履歴テーブル */
export function OldCarsHistoryTable({ oldCarsHistory }: { oldCarsHistory: Search98NumberResult['oldCarsHistory'] }) {
  if (oldCarsHistory.length === 0) {
    return <p className="text-gray-500 text-sm">データなし</p>
  }

  return CsvTable({
    records: oldCarsHistory.map((oldCar) => {
      const price = oldCar.KI_HANKAKA ? Number(oldCar.KI_HANKAKA) : 0
      const isPriceZero = price === 0

      return {
        className: isPriceZero ? '[&_td]:!bg-red-100' : '',
        csvTableRow: [
          { label: '仕入伝票', cellValue: oldCar.NO_SIRETYUM ?? '-' },
          { label: '車名', cellValue: oldCar.MJ_SYAMEI ?? '-' },
          { label: '車台番号', cellValue: oldCar.NO_SYADAIBA ?? '-' },
          { label: '仕入日', cellValue: oldCar.DD_SIIRE ? formatDate(oldCar.DD_SIIRE, 'YYYY/MM/DD') : '-' },
          { label: '仕入金額', cellValue: oldCar.KI_SIIREKA ? NumHandler.WithUnit(Number(oldCar.KI_SIIREKA), '円') : '-' },
          {
            label: '売上金額',
            cellValue: (
              <span className={isPriceZero ? 'text-red-600 font-bold' : ''}>
                {isPriceZero ? '未設定(0)' : NumHandler.WithUnit(price, '円')}
              </span>
            ),
          },
          { label: '売上日', cellValue: oldCar.DD_URIAGE ? formatDate(oldCar.DD_URIAGE, 'YYYY/MM/DD') : '-' },
          { label: '売上区分', cellValue: oldCar.KB_URIAGE ?? '-' },
        ],
      }
    }),
  }).WithWrapper({ className: 'max-h-[400px] ' })
}

/** 在庫履歴テーブル */
export function ZaikoHistoryTable({ zaikoHistory }: { zaikoHistory: Search98NumberResult['zaikoHistory'] }) {
  if (zaikoHistory.length === 0) {
    return <p className="text-gray-500 text-sm">データなし</p>
  }

  return CsvTable({
    records: zaikoHistory.map((zaiko) => ({
      csvTableRow: [
        { label: '車名', cellValue: zaiko.MJ_FURUSYAM ?? '-' },
        { label: '車台番号', cellValue: zaiko.NO_SYADAIBA ?? '-' },
        { label: '仕入日', cellValue: zaiko.DD_SIIRE ? formatDate(zaiko.DD_SIIRE, 'YYYY/MM/DD') : '-' },
        { label: '在庫状態', cellValue: zaiko.MJ_ZAIKOST ?? '-' },
        { label: '在庫店舗', cellValue: zaiko.CD_ZAIKOTEN ?? '-' },
      ],
    })),
  }).WithWrapper({ className: 'max-h-[400px] ' })
}

/** 発行履歴テーブル (Number98IssueHistory) */
export function IssueHistoryTable({
  issueHistory,
}: {
  issueHistory: IssueHistoryItem[]
}) {
  if (issueHistory.length === 0) {
    return <p className="text-gray-500 text-sm">データなし</p>
  }

  return CsvTable({
    records: issueHistory.map((item) => {
      return {
        csvTableRow: [
          {
            label: '98番号',
            cellValue: (
              <button className="t-link text-left" >
                {item.number}
              </button>
            ),
          },
          { label: '発行日時', cellValue: formatDate(item.createdAt, 'YYYY/MM/DD HH:mm') },
          {
            label: '中古車', cellValue: <ShadModal Trigger={<div className={`t-link`}>{item.Number98?.Ucar.length ?? 0}</div>}>
              {CsvTable({
                records: (item.Number98?.Ucar ?? []).map((ucar) => {
                  return {
                    csvTableRow: [
                      { label: '98番号', cellValue: ucar.number98 ?? '-' },
                      { label: '仕入日', cellValue: ucar.DD_SIIRE ? formatDate(ucar.DD_SIIRE, 'YYYY/MM/DD') : '-' },
                      { label: '査定ID', cellValue: ucar.sateiID },
                    ],
                  }
                }),
              }).WithWrapper({})}
            </ShadModal>
          },
        ],
      }
    }),
  }).WithWrapper({ className: 'max-h-[400px]' })
}
