import { UcarProcessCl } from '@app/(apps)/ucar/class/UcarProcessCl'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { getColorStyles } from '@cm/lib/methods/colors'
import { cn } from '@cm/shadcn/lib/utils'

import { initServerComopnent } from 'src/non-common/serverSideFunction'
import { UcarCL, ucarData } from '@app/(apps)/ucar/class/UcarCL'

import { Days } from '@cm/class/Days/Days'
import { SearchForm } from './SearchForm'
import { Prisma } from '@prisma/generated/prisma/client'

export default async function DynamicMasterPage(props) {
  const query = await props.searchParams
  const { session, scopes } = await initServerComopnent({ query })

  // 検索条件を構築
  const searchSateiID = query.searchSateiID as string | undefined
  const searchModelName = query.searchModelName as string | undefined
  const searchColor = query.searchColor as string | undefined
  const searchFrame = query.searchFrame as string | undefined

  const whereConditions: Prisma.UcarWhereInput[] = [
    {
      daihatsuReserve: null,
      OldCars_Base: {
        // ZAIKO_Base: {
        //   isNot: null,
        // },
      },
    },
  ]

  // 査定IDで検索
  if (searchSateiID) {
    whereConditions.push({
      sateiID: { contains: searchSateiID },
    })
  }

  // 車名、カラー、フレームで検索（UPASS関連）
  const upassConditions: Prisma.UPASSWhereInput[] = []
  if (searchModelName) {
    upassConditions.push({ modelName: { contains: searchModelName } })
  }
  if (searchColor) {
    upassConditions.push({ exteriorColor: { contains: searchColor } })
  }
  if (searchFrame) {
    upassConditions.push({ chassisNumber: { contains: searchFrame } })
  }

  if (upassConditions.length > 0) {
    whereConditions.push({
      UPASS: {
        AND: upassConditions,
      },
    })
  }

  const ucar = await UcarCL.fetcher.getUcarDataList({
    where: {
      AND: whereConditions,
    },
    orderBy: [
      //
      { qrIssuedAt: 'desc' },
      { processLastUpdatedAt: { sort: 'desc', nulls: 'last' } },
    ],
    take: 100,
  })



  const allProcess = UcarProcessCl.CODE.array?.filter(process => process.list?.includes('main')) ?? []

  return (
    <div className={` p-2 mx-auto w-fit`}>
      <SearchForm
        initialValues={{
          searchSateiID: searchSateiID ?? '',
          searchModelName: searchModelName ?? '',
          searchColor: searchColor ?? '',
          searchFrame: searchFrame ?? '',
        }}
      />
      {CsvTable({
        records: ucar.map(car => {
          const ucarInst = new UcarCL(car as unknown as ucarData)

          const lastProcess = car.UcarProcess.find(process => {
            return !!allProcess.find(item => item.code === process.processCode)
          })

          const lastProcessCodeItem = UcarProcessCl.CODE.byCode(lastProcess?.processCode ?? '')
          return {
            csvTableRow: [
              {
                label: '査定ID',
                cellValue: <div>
                  <div>{ucarInst.notation.sateiID}</div>
                  <small>{ucarInst.data.number98}</small>

                </div>,
                style: { minWidth: 80 },
              },

              {
                label: 'メーカー/車名/グレード ',
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
                    <div>{ucarInst.notation.commonType}</div>
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
                label: '配布店舗',
                cellValue: ucarInst.data?.DestinationStore?.name,
                style: { minWidth: 100 },
              },
              // {
              //   label: '在庫店舗',
              //   cellValue: ucarInst.ai21Data.MJ_ZAIKOST,
              //   style: { minWidth: 100 },
              // },
              // {
              //   label: '展示店舗',
              //   cellValue: ucarInst.ai21Data.CD_TENJTENP,
              //   style: { minWidth: 120 },
              // },
              {
                label: '仕入日',
                cellValue: formatDate(ucarInst.ai21Data.DD_SIIRE, 'YY/MM/DD(ddd)'),
                style: { minWidth: 80, textAlign: 'right' },
              },
              {
                label: '売上日',
                cellValue: formatDate(ucarInst.ai21Data.DD_URIAGE, 'YY/MM/DD(ddd)'),
                style: { minWidth: 80, textAlign: 'right' },
              },
              {
                label: '仕入価格',
                cellValue: ucarInst.ai21Data.KI_SIIREKA,
                style: { minWidth: 80, textAlign: 'right' },
              },
              {
                label: '売上金額',
                cellValue: ucarInst.ai21Data.KI_HANKAKA,
                style: { minWidth: 80, textAlign: 'right' },
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

              //プロセス
              ...allProcess.map((codeItem, i) => {
                const nextCodeItem = UcarProcessCl.CODE.array[i + 1]
                const process = car.UcarProcess.find(process => process.processCode === codeItem?.code)

                // const nextProcess = car.UcarProcess.find(process => nextCodeItem && process.processCode === nextCodeItem?.code)

                const daysUntilNextProcess = 0
                // process?.date && nextProcess?.date && Days.day.difference(nextProcess.date, process.date)

                const color = codeItem?.color ?? 'bg-sub-light'

                const isCurrentProcess = lastProcessCodeItem?.code === codeItem?.code

                const isToday = process?.date && Days.validate.isSameDate(process?.date, new Date())

                return {
                  label: <div>{codeItem?.label}</div>,
                  cellValue: process ? (
                    <div className={`relative`}>
                      <div>{formatDate(process.date, 'YY/MM/DD(ddd) HH:mm')}</div>

                      {/* <small>{formatDate(process.date, 'HH:mm')}</small> */}

                      {!!daysUntilNextProcess && daysUntilNextProcess > 0 && (
                        <div className={`absolute center-y -right-3 text-blue-500  `}>+{daysUntilNextProcess}</div>
                      )}
                    </div>
                  ) : (
                    ''
                  ),
                  style: {
                    ...(!process
                      ? {
                        backgroundColor: '#00000070',
                      }
                      : {}),

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
                  className: cn(
                    //
                    'text-center align-middle'
                  ),
                }
              }),
            ],
          }
        }),
      }).WithWrapper({
        className: cn(
          //
          '[&_th]:!p-0 ',
          '[&_td]:!py-0.5',
          '[&_td]:text-xs',
          '[&_td]:align-middle'
        ),
      })}
    </div>
  )
}
