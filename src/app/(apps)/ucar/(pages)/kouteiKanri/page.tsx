import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import {getColorStyles} from '@cm/lib/methods/colors'
import {cn} from '@cm/shadcn/lib/utils'

import prisma from 'src/lib/prisma'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {UcarCL, ucarData} from '@app/(apps)/ucar/class/UcarCL'
import {QueryBuilder} from '@app/(apps)/ucar/class/QueryBuilder'
import {Days} from '@cm/class/Days/Days'

export default async function DynamicMasterPage(props) {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})

  const include = QueryBuilder.getInclude({})

  const ucar = await prisma.ucar.findMany({
    where: {daihatsuReserve: null},
    include: {
      UcarProcess: {
        include: {},
        orderBy: {
          date: {sort: 'desc', nulls: 'last'},
        },
      },
      UPASS: {
        include: {
          RootUpass: {
            include: {UPASS: {}},
          },
        },
      },
    },
    orderBy: [
      //
      {processLastUpdatedAt: {sort: 'desc', nulls: 'last'}},
      {qrIssuedAt: 'desc'},
    ],
    take: 100,
  })

  const allProcess = UcarProcessCl.CODE.array?.filter(process => process.list?.includes('main')) ?? []

  return (
    <div className={` p-2 mx-auto w-fit`}>
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
                cellValue: ucarInst.notation.sateiID,
                style: {minWidth: 80},
              },

              {
                label: '車名 ',
                cellValue: (
                  <div>
                    <div>{ucarInst.notation.modelName}</div>
                  </div>
                ),
                style: {minWidth: 160},
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
                style: {minWidth: 120},
              },

              {
                label: 'カラー/年式',
                cellValue: (
                  <div>
                    <div>{ucarInst.notation.exteriorColor}</div>
                    <div>{ucarInst.notation.modelYear}</div>
                  </div>
                ),
                style: {minWidth: 120},
              },

              {
                label: '現在の工程',
                cellValue: lastProcessCodeItem?.label,
                thStyle: {backgroundColor: '', color: ''},
                style: {
                  ...getColorStyles(lastProcessCodeItem?.color ?? ''),
                  minWidth: 120,
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
