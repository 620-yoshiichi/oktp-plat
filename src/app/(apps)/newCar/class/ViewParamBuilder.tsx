'use client'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {ViewParamBuilderProps} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

import {useState} from 'react'

export class ViewParamBuilder {
  static desiredTorokuDate: ViewParamBuilderProps = props => {
    const {session, roles, accessScopes} = props.ClientProps2.useGlobalProps
    const {admin} = accessScopes()

    return {
      additional: {
        orderBy: [{NewCar: {lastApprovedDesiredTorokuDate: 'asc'}}, {date: `asc`}, {id: `desc`}],
      },
      myTable: {
        update: accessScopes().getNewCarProps().isHQ ? true : false,
        delete: admin,
      },
    }
  }

  static newCar: ViewParamBuilderProps = props => {
    const [open, setopen] = useState(false)

    return {
      myTable: {
        csvOutput: {
          fileTitle: '納期CSアプリ　受注一覧',
          columns: [
            // 車両情報グループ
            {key: 'NO_CYUMON', label: '注文No'},
            {key: 'KJ_KURUMAME', label: '車名'},
            {key: 'MJ_HANTENKT', label: '販売店型式'},
            {key: 'NO_FRAME', label: 'フレームNo'},

            // その他情報グループ
            {
              key: 'userId',
              label: '担当',
              format: record => record.User?.name || '',
            },
            {
              key: 'storeId',
              label: '店舗',
              format: record => record.Store?.name || '',
            },
            {key: 'KJ_KAINMEI1', label: '買主'},
            {key: 'KJ_MEIGIME1', label: '名義人'},

            // 日付関連グループ
            {
              key: 'CUSTOM_DD_SEISANYOTEI',
              label: '生産予定日',
              format: record => {
                // if (record.CUSTOM_DD_SEISANYOTEI) {
                //   return formatDate(record.CUSTOM_DD_SEISANYOTEI)
                // }
                return record.CUSTOM_SEISANYOTEI || '未定'
              },
            },
            {
              key: 'DD_FR',
              label: '振当',
              format: record => {
                const {DD_FR, CUSTOM_FR_DATE, CUSTOM_FR_PREFIX, CUSTOM_FR_SUFFIX} = record
                const NOTATION = [CUSTOM_FR_PREFIX, CUSTOM_FR_DATE, CUSTOM_FR_SUFFIX].join('')
                return NOTATION || (DD_FR ? formatDate(DD_FR) : '-')
              },
            },
            {key: 'm2_date', label: '2ヶ月前連絡日', format: record => formatDate(record.m2_date)},
            {key: 'm2_remarks', label: '2ヶ月前備考'},
            {
              key: 'm1_deadline_paper',
              label: '1ヶ月前書類回収予定日',
              format: recordTraceEvents => formatDate(recordTraceEvents.m1_deadline_paper),
            },
            {
              key: 'm1_deadline_money',
              label: '1ヶ月前入金予定日',
              format: recordTraceEvents => formatDate(recordTraceEvents.m1_deadline_money),
            },
            {key: 'm1_remarks', label: '1ヶ月前備考'},
            {
              key: 'm0_deadline_nousya',
              label: '納車予定日',
              format: recordTraceEvents => formatDate(recordTraceEvents.m0_deadline_nousya),
            },
            {key: 'm0_remarks', label: '振当時備考'},
            {
              key: 'm1_toroku_prediction',
              label: '登録見込み月',
              format: record => formatDate(record.m1_toroku_prediction, 'YYYY年MM月'),
            },
            {
              key: 'lastApprovedDesiredTorokuDate',
              label: '登録予定日',
              format: record => formatDate(record.lastApprovedDesiredTorokuDate),
            },

            {
              key: 'KB_OSSSIN',
              label: 'OSS',
              format: record => (record.KB_OSSSIN ? 'OSS' : '紙登録'),
            },
            // 日付グループ
            {
              key: 'DD_JUCYU',
              label: '受注日',
              format: record => formatDate(record.DD_JUCYU),
            },
            {
              key: 'DD_HONBSYOK',
              label: '書類全完日',
              format: record => formatDate(record.DD_HONBSYOK),
            },
            {
              key: 'DD_TOUROKU',
              label: '登録日',
              format: record => formatDate(record.DD_TOUROKU),
            },
            {
              key: 'DD_HAISKIBO',
              label: '配送希望日',
              format: record => formatDate(record.DD_HAISKIBO),
            },
            {
              key: 'DD_HAISOYOT',
              label: '配送予定日',
              format: record => formatDate(record.DD_HAISOYOT),
            },
            {
              key: 'DD_NOSYA',
              label: '納車日',
              format: record => formatDate(record.DD_NOSYA),
            },
          ],
        },
        customActions: props => {
          return (
            <>
              <R_Stack>
                <small className={`text-xs`}>
                  【登録日が、2024年7月31日以前の受注】は表示されません。納車後もデータが表示されます
                </small>
              </R_Stack>
            </>
          )
        },
      },
    }
  }
}
