'use client'

import { UcarProcessCl } from '@app/(apps)/ucar/class/UcarProcessCl'
import { UcarCL, ucarData } from '@app/(apps)/ucar/class/UcarCL'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { Days } from '@cm/class/Days/Days'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { getColorStyles } from '@cm/lib/methods/colors'
import { cn } from '@cm/shadcn/lib/utils'
import { NumHandler } from '@cm/class/NumHandler'

type KouteiKanriTableProps = {
  results: any[]
  isLoading: boolean
}

export function KouteiKanriTable({ results, isLoading }: KouteiKanriTableProps) {
  const allProcess = UcarProcessCl.CODE.array?.filter(process => process.list?.includes('main')) ?? []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">データがありません</div>
      </div>
    )
  }

  return CsvTable({
    records: results.map(car => {
      const ucarInst = new UcarCL(car as unknown as ucarData)

      const lastProcess = car.UcarProcess?.find(process => {
        return !!allProcess.find(item => item.code === process.processCode)
      })

      const lastProcessCodeItem = UcarProcessCl.CODE.byCode(lastProcess?.processCode ?? '')

      return {
        csvTableRow: [
          {
            label: '査定ID',
            cellValue: (
              <div>
                <div>{ucarInst.notation.sateiID}</div>
                <small>{ucarInst.data.number98}</small>
              </div>
            ),
            style: { minWidth: 80 },
          },
          {
            label: 'メーカー/車名/グレード',
            cellValue: (
              <div>
                <div>{ucarInst.notation.brandName}</div>
                <div>{ucarInst.notation.modelName}</div>
                <div>{ucarInst.notation.grade}</div>
              </div>
            ),
            style: { minWidth: 180 },
          },
          {
            label: 'フレーム/型式/プレート',
            cellValue: (
              <div>
                <div>{ucarInst.notation.frameNumber}</div>
                <div>{ucarInst.notation.type}</div>
                <div>{ucarInst.notation.plate}</div>
              </div>
            ),
            style: { minWidth: 180 },
          },
          {
            label: 'カラー/年式',
            cellValue: (
              <div>
                <div>{ucarInst.notation.exteriorColor}</div>
                <div>{ucarInst.notation.modelYear}</div>
              </div>
            ),
            style: { minWidth: 120 },
          },
          {
            label: 'ai21在庫/売上',
            cellValue: <div>
              <span>{ucarInst.ai21Data.CD_ZAIKOTEN}</span>
              <br />
              <span>{formatDate(ucarInst.ai21Data.DD_URIAGE, 'YY/MM/DD(ddd)')}</span>
              <br />
              <span>{NumHandler.WithUnit(Number(ucarInst.ai21Data.KI_HANKAKA ?? 0), '円')}</span>

            </div>
            ,
            style: { minWidth: 100 },
          },


          {
            label: '現在の工程',
            cellValue: lastProcessCodeItem?.label,
            thStyle: { backgroundColor: '', color: '' },
            style: {
              ...getColorStyles(lastProcessCodeItem?.color ?? ''),
              minWidth: 80,
            },
          },
          // プロセス
          ...allProcess.map((codeItem, i) => {
            const process = car.UcarProcess?.find(p => p.processCode === codeItem?.code)
            const color = codeItem?.color ?? 'bg-sub-light'
            const isCurrentProcess = lastProcessCodeItem?.code === codeItem?.code
            const isToday = process?.date && Days.validate.isSameDate(process?.date, new Date())

            return {
              label: <div>{codeItem?.label}</div>,
              cellValue: process ? (
                <div className="relative">
                  <div>{formatDate(process.date, 'YY/MM/DD(ddd) HH:mm')}</div>
                </div>
              ) : (
                ''
              ),
              style: {
                ...(!process ? { backgroundColor: '#00000070' } : {}),
                ...(isCurrentProcess
                  ? {
                    backgroundColor: isToday ? '#d2f7d6' : '#ffff00',
                    animation: 'pulse 3s infinite',
                  }
                  : {}),
              },
              thStyle: {
                ...getColorStyles(color),
                minWidth: 90,
                animation: undefined,
              },
              className: cn('text-center align-middle'),
            }
          }),
        ],
      }
    }),
  }).WithWrapper({
    className: cn(
      '[&_th]:!p-0',
      '[&_td]:!py-0.5',
      '[&_td]:text-xs',
      '[&_td]:align-middle'
    ),
  })
}
