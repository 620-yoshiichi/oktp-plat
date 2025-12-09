'use client'

import CheckPointList from '@app/(apps)/newCar/CheckPointList'

import {Fields} from '@cm/class/Fields/Fields'

import {UseRecordsReturn} from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'

import {columnGetterType} from '@cm/types/types'
import {btnClass, DesiredTorokuDateRegister} from '@app/(apps)/newCar/(parts)/DesiredTorokuDate/DesiredTorokuDateRegister'

import {isDev, shorten} from '@cm/lib/methods/common'
import {getForSelectWhere} from '@app/(apps)/newCar/(constants)/forSelectConfig'

import {NewCar, User, Store} from '@prisma/client'
import {Button} from '@cm/components/styles/common-components/Button'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import {TruckIcon} from '@heroicons/react/20/solid'
import useStuffSwitcher from '@app/(apps)/newCar/templateHooks/useStuffSwitcher'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {getOssShinseiData} from '@app/(apps)/newCar/(lib)/oss/ossBigQuery'
import {createOssShinseiSpread} from '@app/(apps)/newCar/(lib)/updateOssSpread'
import {T_LINK} from '@cm/components/styles/common-components/links'
import {toastByResult} from '@cm/lib/ui/notifications'
import {TenpoTsuikoShinseiStatusButton} from '@app/(apps)/newCar/(pages)/tenpo-tsuiko-renraku/TenpoTsuikoShinseiStatusButton'
import useTempoTsuikoGMF from '@app/(apps)/newCar/templateHooks/useTempoTsuikoGMF'
import {cn} from '@cm/shadcn/lib/utils'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import {NumHandler} from '@cm/class/NumHandler'

export const getNewCarCols = (props: columnGetterType) => {
  const {pathname, query, accessScopes} = props.useGlobalProps

  const {newCarWhere, isStoreManager, isHQ} = accessScopes().getNewCarProps()
  const {storeId} = newCarWhere

  const stuffSwitcherGMF = useStuffSwitcher()
  const tempoTsuikoGMF = useTempoTsuikoGMF()

  const HK_USE_RECORDS = props.ColBuilderExtraProps?.HK_USE_RECORDS as UseRecordsReturn
  return new Fields([
    ...new Fields([
      {id: `NO_CYUMON`, label: `注文No`, search: {}},
      {id: `KJ_KURUMAME`, label: `車名`, search: {}},
      {id: `MJ_HANTENKT`, label: `販売店型式`, search: {}},
      {id: `NO_FRAME`, label: `フレームNo`, type: `text`, search: {}},
      {
        id: `isDaikoNosya`,
        label: `代行納車`,
        type: `boolean`,
        format: (value, row) => {
          const isDaiko = row.isDaikoNosya
          return (
            <Button
              {...{
                className: `text-xs p-0.5 rounded `,
                color: isDaiko ? 'orange' : 'gray',
                active: isDaiko,
                onClick: () => {
                  const message = isDaiko ? '代行納車登録を解除しますか？' : '代行納車として登録しますか？'
                  if (confirm(`本部専用メニューです。\n` + message)) {
                    props.useGlobalProps.toggleLoad(async () => {
                      await doStandardPrisma(`newCar`, `update`, {
                        where: {id: row.id},
                        data: {isDaikoNosya: !isDaiko},
                      })
                    })
                  }
                },
              }}
            >
              代行納車
            </Button>
          )
        },
      },
    ])
      .customAttributes(() => ({form: {disabled: true}}))
      .setNormalTd()
      .buildFormGroup({groupName: `車両情報`})
      .showSummaryInTd({
        hideUndefinedValue: false,
        labelWidthPx: 75,
        wrapperWidthPx: 200,
      }).plain,
    ...new Fields([
      {
        id: `userId`,
        label: `担当`,
        forSelect: {config: getForSelectWhere({storeId})},
        format: (value, row) => {
          const switched = row.orderSwitchingHisotoryId ? true : false
          if (isStoreManager || isHQ) {
            return (
              <div
                onClick={() => stuffSwitcherGMF.setGMF_OPEN({newCar: row})}
                className={`t-link ${switched ? `text-error-main` : ''}`}
              >
                <span>{row.User.name}</span>
                {switched && <span className={`ml-1 text-[8px]`}>(変更済み)</span>}
              </div>
            )
          } else {
            return <>{row.User.name}</>
          }
        },
        search: {},
      },
      {id: `storeId`, label: `店舗`, forSelect: {}, search: {}},
      {id: `KJ_KAINMEI1`, label: `買主`, search: {}},
      {id: `KJ_MEIGIME1`, label: `名義人`, search: {}},
      {
        id: `sateiConnection`,
        label: '査定連携',
        form: {hidden: true},
        format: (value, row) => {
          const UpassHistory = row.JuchuShitadoriDb.map(d => {
            return UcarCL.getLatestUPASS(d.UPASS)
          })

          if (isDev) {
            return (
              <ShadModal Trigger={<TruckIcon {...{className: `h-5`}} />}>
                {CsvTable({
                  records: UpassHistory.filter(item => {
                    return item?.sateiID
                  }).map(item => {
                    return {
                      csvTableRow: [
                        //
                        {label: '査定番号', cellValue: item?.sateiID},
                        {label: '査定日', cellValue: formatDate(item.assessmentdatetime)},
                        {
                          label: '査定額',
                          cellValue: NumHandler.toPrice(item.assessmentPrice),
                        },

                        {
                          label: '入庫予定日',
                          cellValue: formatDate(item.pickupScheduledDate),
                        },
                        {
                          label: '車名',
                          cellValue: item.modelName,
                        },
                        {
                          label: 'お客様名',
                          cellValue: item.customerName,
                        },
                      ],
                    }
                  }),
                }).WithWrapper({})}
              </ShadModal>
            )
          }

          return <div>Coming Soon...</div>
        },
      },
    ])
      .setNormalTd()
      .customAttributes(() => ({form: {disabled: true}}))
      .buildFormGroup({groupName: `その他情報`})
      .showSummaryInTd({
        hideUndefinedValue: false,
        labelWidthPx: 45,
        wrapperWidthPx: 160,

        convertColId: {storeId: 'Store.name', userId: 'User.name'},
      }).plain,
    ...new Fields([
      {
        id: 'CUSTOM_DD_SEISANYOTEI',
        label: '生産予定日',
        type: `date`,
        form: {hidden: true},
        format: (value, row, col) => {
          if (value !== `-`) {
            if (isDev) {
              return (
                <div>
                  {row.CUSTOM_DD_SEISANYOTEI ? (
                    <IconBtn vivid={false} className={btnClass} color={`gray`}>
                      <div>{formatDate(row.CUSTOM_DD_SEISANYOTEI)}</div>
                    </IconBtn>
                  ) : (
                    '未定'
                  )}
                </div>
              )
            }
            return (
              <div>
                {row.CUSTOM_SEISANYOTEI ? (
                  <IconBtn vivid={false} className={btnClass} color={`gray`}>
                    <div>{row.CUSTOM_SEISANYOTEI}</div>
                  </IconBtn>
                ) : (
                  '未定'
                )}
              </div>
            )
          }
        },
      },

      {
        id: `DD_FR`,
        label: `振当`,
        type: `date`,
        format: (value, row) => {
          const {DD_FR, CUSTOM_FR_DATE, CUSTOM_FR_PREFIX, CUSTOM_FR_SUFFIX} = row as NewCar
          const NOTATION = [CUSTOM_FR_PREFIX, CUSTOM_FR_DATE, CUSTOM_FR_SUFFIX].join(``)

          return NOTATION ? (
            <IconBtn vivid={false} className={btnClass} color={DD_FR ? `blue` : '#6b7280'}>
              {NOTATION}
            </IconBtn>
          ) : (
            <div>-</div>
          )
        },
      },
      // {
      //   id: `CUSTOM_FR_NOTAION`,
      //   label: '振当表記',
      //   format: (value, row) => {
      //     const {CUSTOM_FR_DATE, CUSTOM_FR_PREFIX, CUSTOM_FR_SUFFIX} = row as NewCar
      //     return <>{[CUSTOM_FR_PREFIX, CUSTOM_FR_DATE, CUSTOM_FR_SUFFIX].join(``)}</>
      //   },
      // },
      {
        id: `KB_OSSSIN`,
        label: 'OSS',
        search: {},
        format: (value, row, col) => {
          if (isDev) {
            if (!row.KB_OSSSIN) {
              return '紙登録'
            }
            const {ossSpreadsheetUrl} = row

            return (
              <div>
                <small>OSS依頼書</small>
                <R_Stack className={`gap-3`}>
                  <div>
                    <span
                      className={`t-link text-xs ${ossSpreadsheetUrl && `opacity-50`}`}
                      onClick={async () => {
                        const toggleLoad = props.useGlobalProps.toggleLoad

                        if (confirm(`すでに作成されたものを破棄し、新規に作成します。よろしいですか`)) {
                          toggleLoad(async () => {
                            const ossData = await getOssShinseiData({APPINDEX: row.APPINDEX})

                            const {Store} = row

                            if (ossData) {
                              const res = await createOssShinseiSpread({
                                NewCar: row as NewCar & {User: User; Store: Store},

                                BQ_OSS_SHINSEI_DATA: ossData.BQ_OSS_SHINSEI_DATA,
                                BQ_KOKYAKU_DATA: ossData.BQ_KOKYAKU_DATA,
                                l: ossData.l,
                                w: ossData.w,
                                h: ossData.h,
                                companyStoreName: `岡山トヨペット株式会社  ${Store.name}`,
                                address: Store.address,
                                tel: Store.tel,
                                fax: Store.fax,
                                userName: row.User.name,
                              })
                              toastByResult(res)
                            }
                          })
                        }
                      }}
                    >
                      新規
                    </span>
                  </div>
                  <div>
                    {ossSpreadsheetUrl && (
                      <T_LINK href={ossSpreadsheetUrl} target="_blank" className={`t-link text-xs`}>
                        OPEN
                      </T_LINK>
                    )}
                  </div>
                </R_Stack>
              </div>
            )
          } else {
            return (
              <IconBtn color={`gray`}>
                <div>{row.KB_OSSSIN ? `OSS` : `紙登録`}</div>
              </IconBtn>
            )
          }
        },
      },
      {
        id: `tsuikoShonin`,
        label: `店舗追工申請`,
        form: {hidden: true},
        format: (value, row) => {
          if (row.TenpoTsuikoShinseiHeader.filter(d => d.active !== false).length > 0) {
            return (
              <TenpoTsuikoShinseiStatusButton
                {...{
                  handleOpenModal: (params: {newCar: any}) => {
                    tempoTsuikoGMF.setGMF_OPEN({
                      newCar: params.newCar,
                      usedIn: 'newCarList',
                      onRefresh: () => {
                        HK_USE_RECORDS.updateData()
                      },
                    })
                  },
                  rowData: row,
                }}
              />
            )
          }
        },
      },
    ])
      .setNormalTd()
      .showSummaryInTd({
        hideUndefinedValue: false,
        wrapperWidthPx: 190,
      }).plain,

    {
      id: `CUSTOM_paymentCheckCustomerType`,
      label: '入金チェック区分',
      search: {},
      td: {hidden: true},
    },

    ...new Fields([
      {
        id: `readOnlyCheckPoints`,
        label: ``,
        format: (value, newCar) => {
          return (
            <div>
              <CheckPointList
                {...{
                  newCar,
                  HK_USE_RECORDS,
                  width: 180,
                }}
              />

              {!newCar.JuchuShitadoriDb.length && (
                <R_Stack className={` items-start py-1`}>
                  <small>下取</small>
                  <div>
                    {newCar.JuchuShitadoriDb.map(d => {
                      const shitadoriAlert =
                        newCar.m0_deadline_nousya === null ||
                        new Date(newCar.m0_deadline_nousya).getTime() > new Date(d.UPASS?.pickupScheduledDate).getTime()

                      return (
                        <div
                          key={d.id}
                          onClick={() => {
                            if (shitadoriAlert) {
                              alert('実際の手順に応じたメッセージを表示（検討中）')
                            }
                          }}
                          className={cn(
                            //
                            shitadoriAlert ? ` cursor-pointer bg-red-500 text-white font-bold` : '',
                            `text-[10px] leading-3 p-1 `
                          )}
                        >
                          <div>
                            <span>{shorten(d?.UPASS?.modelName, 8)}</span>(<span>{d.NO_SATEISYO}</span>)
                          </div>
                          <div>
                            <span className="mr-0.5">入庫予定:</span>
                            <span>{formatDate(d?.UPASS?.pickupScheduledDate)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </R_Stack>
              )}
            </div>
          )
        },
        td: {style: {minWidth: 180}},
      },
    ]).plain,

    {
      id: ``,
      label: ``,
      format: (value, row) => {
        const newCar = row
        return (
          <div className={`w-[160px]`}>
            <DesiredTorokuDateRegister {...{newCar, isHQ}} />
          </div>
        )
      },
      td: {style: {minWidth: 160}},
    },

    ...new Fields([
      {id: `DD_JUCYU`, label: `受注日`, type: `date`},
      // {id: `DD_SYOUNIN3`, label: `本部承認日`, type: `date`},
      {id: `DD_HONBSYOK`, label: `書類全完日`, type: `date`},
      {id: `DD_TOUROKU`, label: `登録日`, type: `date`},
      {id: `DD_HAISKIBO`, label: `配送希望日`, type: `date`},
      {id: `DD_HAISOYOT`, label: `配送予定日`, type: `date`},
      // {id: `DD_SAGTYYO`, label: `新点予定`, type: `date`},
      {id: `DD_NOSYA`, label: `納車日`, type: `date`},
    ])
      .setNormalTd()
      .customAttributes(() => ({sort: {}, search: {}}))
      .showSummaryInTd({hideUndefinedValue: false, labelWidthPx: 70, wrapperWidthPx: 170}).plain,
  ]).transposeColumns()
}
