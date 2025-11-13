'use client'

import {ColBuilder} from '@app/(apps)/shinren/class/ColBuilder'
import {Fields} from '@cm/class/Fields/Fields'
import GlobalIdSelector from '@cm/components/GlobalIdSelector/GlobalIdSelector'
import DailyReportDetail from '@app/(apps)/shinren/class/DetailPage/RentaDailyReportDetailPage'
import RentaCustomerDetail from '@app/(apps)/shinren/class/DetailPage/RentaCustomerDetail/RentaCustomerDetail'
import {Shinren} from '@app/(apps)/shinren/class/Shinren'
import {DetailPagePropType} from '@cm/types/types'
import {CSVLink} from 'react-csv'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import Accordion from '@cm/components/utils/Accordions/Accordion'

import MyForm from '@cm/components/DataLogic/TFs/MyForm/MyForm'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'

import DailyReportAggregationTable from '@app/(apps)/shinren/class/pagebuilders/DailyReportAggregationTable/DailyReportAggregationTable'
import {Paper} from '@cm/components/styles/common-components/paper'
import GlobalAccordion from '@cm/components/utils/Accordions/GlobalAccordion'
import {useState} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import useWindowSize from '@cm/hooks/useWindowSize'

type insuranceAlternateCommonPropsType = {
  additional: {
    payload: {
      rentaCustomerId: number | undefined
      rentaDailyReportId: number | undefined
    }
  }
  ColBuilderExtraProps: {
    rentaCustomerId: number
  }
  others: {
    myForm: undefined
    myTable: undefined
    myModal: undefined
  }
}

export const makeChildCreatorProps = props => {
  const {dailyReort, rentaCustomer, useGlobalProps, childrenModelName} = props
  const INSU_ALT_PROPS = makeINSU_ALT_PROPS({dailyReort, rentaCustomer})
  return {
    ...INSU_ALT_PROPS.others,
    additional: INSU_ALT_PROPS.additional,
    columns: ColBuilder[childrenModelName]({
      useGlobalProps,
      ColBuilderExtraProps: INSU_ALT_PROPS.ColBuilderExtraProps,
    }),
    useGlobalProps,
  }
}
const makeINSU_ALT_PROPS = props => {
  const {dailyReort, rentaCustomer} = props
  const rentaCustomerId = dailyReort?.rentaCustomerId ?? rentaCustomer?.id
  const rentaDailyReportId = dailyReort?.id
  const INSU_ALT_PROPS: insuranceAlternateCommonPropsType = {
    additional: {payload: {rentaCustomerId, rentaDailyReportId}},
    ColBuilderExtraProps: {rentaCustomerId},
    others: {
      myForm: undefined,
      myTable: undefined,
      myModal: undefined,
    },
  }
  return INSU_ALT_PROPS
}

export class PageBuilder {
  static getGlobalIdSelector = ({useGlobalProps}) => {
    return () => {
      const admin = useGlobalProps.accessScopes().admin

      if (!admin) {
        return <></>
      }

      const columns = Fields.transposeColumns([])
      if (admin) {
        columns.push([Shinren.col.globalUserIdColumn])
      }

      if (admin) {
        return <GlobalIdSelector {...{useGlobalProps, columns}} />
      }
    }
  }

  static rentaDailyReport = {
    top: (props: DetailPagePropType) => {
      const {device} = useWindowSize()
      const {userWithCount} = props.PageBuilderExtraProps ?? {}

      return (
        <GlobalAccordion id={`dailyReportTopAggregation`} defaultOpen={device.PC} label={`集計`}>
          <Paper>
            <DailyReportAggregationTable {...{userWithCount}} />
          </Paper>
        </GlobalAccordion>
      )
    },
    form: DailyReportDetail,
  }
  static rentaStore = {
    form: (props: DetailPagePropType) => {
      const {useGlobalProps} = props
      const rentaStore = props.formData ?? {}
      return (
        <div>
          <Accordion label={`店舗情報`} defaultOpen={true}>
            <MyForm {...props} />
          </Accordion>
          <Accordion label={`所属スタッフ`} defaultOpen={true}>
            <ChildCreator
              {...{
                additional: {
                  payload: {
                    rentaStoreId: rentaStore.id,
                  },
                },
                useGlobalProps,
                ParentData: rentaStore,
                models: {parent: 'rentaStore', children: 'user'},
                columns: ColBuilder.user({
                  useGlobalProps,
                  ColBuilderExtraProps: {storeId: rentaStore.id},
                }),
              }}
            />
          </Accordion>
        </div>
      )
    },

    // right: CustomerWithoutNeoData,
  }
  static rentaCustomer = {
    top: (props: DetailPagePropType) => {
      const [data, setdata] = useState<any[]>([])

      return (
        <div>
          <R_Stack>
            <Button
              color={`red`}
              onClick={async () => {
                const {where, include, orderBy} = props.prismaDataExtractionQuery ?? {}

                const {result: records} = await doStandardPrisma(`rentaCustomer`, `findMany`, {
                  where,
                  include: {RentaDailyReport: {}},
                  orderBy,
                })

                const data = records.map((rec: any) => {
                  const {
                    name,
                    kana,
                    phone,
                    result,
                    RentaDailyReport,
                    carCount,
                    type,
                    leaseCompanyName,
                    remarks,
                    maintenanceDestination,
                    pic,
                  } = rec
                  const reports = (RentaDailyReport ?? [])
                    .sort((a, b) => {
                      return new Date(b.date).getTime() - new Date(a.date).getTime()
                    })
                    ?.map(r => {
                      return formatDate(r.date)
                    })

                    .join(', ')

                  return {
                    名称: name,
                    保有台数: carCount,
                    リース会社: leaseCompanyName,
                    '車両仕入れ先・整備入庫先': maintenanceDestination,
                    責任者: pic,
                    備考: remarks ? String(remarks).replace(/\n/g, '') : '',
                    日報記録: reports,
                    カナ: kana,
                    電話番号: phone,
                    新管区分: type,
                    結果: result,
                  }
                })
                setdata(data)
              }}
            >
              データ抽出
            </Button>
            {data.length > 0 && (
              <CSVLink className={` t-link`} data={data} filename="rentaCustomer.csv">
                ダウンロード({data.length}何件)
              </CSVLink>
            )}
          </R_Stack>
        </div>
      )
    },
    form: RentaCustomerDetail,

    // right: CustomerWithoutNeoData,
  }
}
