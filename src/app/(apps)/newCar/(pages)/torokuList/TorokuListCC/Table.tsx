'use client'

import {NEW_CAR_CONST} from '@app/(apps)/newCar/(constants)/newCar-constants'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {T_LINK} from '@cm/components/styles/common-components/links'

export default function Table({cars, setshowEditor}) {
  const TABLE = CsvTable({
    // headerRecords: [
    //   {
    //     csvTableRow: [
    //       {cellValue: '保留中申請数\n(総数)'},
    //       {cellValue: '注文番号', style: {minWidth: 90}},
    //       {cellValue: 'スタッフ(拠点)'},
    //       {cellValue: '買主\n(名義人)', style: {minWidth: 100}},
    //       {cellValue: '車名\n(フレームNo)', style: {minWidth: 100}},
    //       {cellValue: '振当日'},
    //       {cellValue: '登録予定\n(実績)', style: {minWidth: 100}},
    //       {cellValue: '入金チェック区分\n(OK/NG)'},
    //       {cellValue: '過去備考一覧', style: {minWidth: 200}},
    //       {cellValue: '登録申請最終更新時刻'},
    //     ],
    //   },
    // ],
    records: cars.map(car => {
      const {
        NO_CYUMON,
        Store,
        User,
        KJ_KAINMEI1,
        KJ_KURUMAME,
        KJ_MEIGIME1,
        NO_FRAME,
        DD_FR,
        lastApprovedDesiredTorokuDate,
        DD_TOUROKU,
        CUSTOM_paymentCheckCustomerType,
        CUSTOM_paymentCheck,
        DesiredTorokuDate,
        DD_HONBSYOK,
      } = car

      const torokuYoteiDisplaay = lastApprovedDesiredTorokuDate ? formatDate(lastApprovedDesiredTorokuDate, 'M/D(ddd)') : ''

      const torokuJissekiDisplay = DD_TOUROKU ? formatDate(DD_TOUROKU, 'M/D(ddd)') : '-'
      return {
        csvTableRow: [
          {
            label: '保留中申請数\n(総数)',
            cellValue: (
              <div>
                <C_Stack className={`gap-1`}>
                  {DesiredTorokuDate.map((application, applicationIdx) => {
                    const {status, date, createdAt, remarks, torokuType} = application
                    const theStatus = NEW_CAR_CONST.TOROKU_STATUS_LIST.find(d => d.value === status)
                    return (
                      <div
                        {...{
                          onClick: () => setshowEditor({application}),
                        }}
                        key={applicationIdx}
                      >
                        <IconBtn
                          {...{
                            color: theStatus?.color ?? `#ffffffb5`,
                            className: `col-stack gap-0 !p-0.5 items-start relative !text-gray-700 rounded onHover
                        `,
                          }}
                        >
                          <R_Stack className={` justify-between w-[190px]`}>
                            <div className={`text-xs`}>送信日:{formatDate(createdAt, 'M/D(ddd) HH:mm')}</div>
                            <div className={` text-xs border rounded p-0.5`}> {torokuType}</div>
                          </R_Stack>

                          <div className={`text-xs`}>希望日:{formatDate(date, 'M/D(ddd) ')}</div>
                          <div className={`text-xs`}>結果:{theStatus?.value}</div>
                        </IconBtn>
                      </div>
                    )
                  })}
                </C_Stack>
              </div>
            ),
            style: {minWidth: 150},
          },
          {
            label: '注文番号',
            cellValue: (
              <C_Stack className={` flex-nowrap relative justify-between items-center`}>
                <T_LINK href={`/newCar/newCar?g_userIdArr=81&search=NEWCAR[contains:NO_CYUMON=${NO_CYUMON}]`}>{NO_CYUMON}</T_LINK>
                {DD_HONBSYOK ? <IconBtn color={`blue`}>書類完</IconBtn> : <IconBtn color={`red`}>書類未</IconBtn>}
              </C_Stack>
            ),
            style: {minWidth: 80},
          },
          {
            label: 'スタッフ(拠点)',
            cellValue: (
              <>
                <div>{User.name}</div>
                <small className={`text-[9px]`}>({Store.name})</small>
              </>
            ),
            style: {minWidth: 90},
          },

          {
            label: '買主\n(名義人)',
            cellValue: (
              <>
                <div>{KJ_KAINMEI1}</div>
                <small>({KJ_MEIGIME1})</small>
              </>
            ),
            style: {minWidth: 140},
          },

          {
            label: '車名\n(フレームNo)',
            cellValue: (
              <>
                <div>{KJ_KURUMAME}</div>
                <small>({NO_FRAME})</small>
              </>
            ),
            style: {minWidth: 140},
          },
          {label: '振当日', cellValue: formatDate(DD_FR, 'M/D(ddd)')},
          {
            label: '登録予定\n(実績)',
            cellValue: (
              <>
                <IconBtn color={torokuYoteiDisplaay ? 'blue' : ''}>{torokuYoteiDisplaay ?? '-'}</IconBtn>
                {DD_TOUROKU && <IconBtn color={'blue'}>({torokuJissekiDisplay})</IconBtn>}
              </>
            ),
            style: {minWidth: 80},
          },

          // {
          //   label: '入金チェック区分\n(OK/NG)',
          //   cellValue: (
          //     <>
          //       <div>{CUSTOM_paymentCheckCustomerType}</div>
          //       <small>({CUSTOM_paymentCheck ? 'OK' : 'NG'})</small>
          //     </>
          //   ),
          //   style: {minWidth: 80},
          // },

          {
            label: '過去備考一覧',
            cellValue: (
              <div className={` text-xs leading-3`}>
                {DesiredTorokuDate.filter(d => d.remarks).map(({createdAt, remarks}, applicationIdx) => {
                  return (
                    <div key={applicationIdx} className={`text-start`}>
                      <small>{formatDate(createdAt)}</small>
                      <div key={applicationIdx}>{remarks}</div>
                    </div>
                  )
                })}
              </div>
            ),
            style: {minWidth: 100},
          },
          {
            label: '登録申請最終更新時刻',
            cellValue:
              DesiredTorokuDate.length > 0
                ? formatDate(new Date(Math.max(...DesiredTorokuDate.map(d => d.updatedAt))), 'M/D(ddd) HH:mm')
                : '',
            style: {minWidth: 100},
          },
        ],
      }
    }),
  })

  return (
    <div>
      <div>{cars.length}件</div>
      {TABLE.WithWrapper({
        className: `[&_td]:!text-sm  [&_th]:!text-sm `,
      })}
    </div>
  )
}
