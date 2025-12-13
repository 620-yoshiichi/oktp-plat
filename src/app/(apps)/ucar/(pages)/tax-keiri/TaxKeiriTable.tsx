'use client'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import React, {useRef} from 'react'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'

import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'
import {ucarData} from '@app/(apps)/ucar/class/UcarCL'

import {useReactToPrint} from 'react-to-print'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

export default function TaxKeiriTable({ucarList}: {ucarList: ucarData[]}) {
  const {query} = useGlobal()

  const printRef = useRef<HTMLDivElement>(null)
  const printFnc = useReactToPrint({
    contentRef: printRef,
    documentTitle: `自動車税依頼_${query.from}`,
    pageStyle: `
     @page {
       size: A4 landscape;
     }
   `,
  })

  return (
    <div className={`p-4`}>
      <C_Stack>
        <R_Stack className={`w-fit mx-auto`}>
          <Button onClick={printFnc}>印刷する</Button>
          <NewDateSwitcher {...{}} />
        </R_Stack>

        <div className={` print-target`} ref={printRef}>
          {CsvTable({
            records: ucarList.map(item => {
              const ucarInst = new UcarCL(item as unknown as ucarData)
              return {
                csvTableRow: [
                  // {label: '経理処理', cellValue: formatDate(item.accountingRecievedAt)},
                  // {label: '返金希望日', cellValue: formatDate(item.paybackScheduledAt)},
                  {
                    label: '98番号',
                    cellValue: item.number98,
                    style: {minWidth: 120},
                  },
                  {
                    label: 'スタッフ名',
                    cellValue: ucarInst.notation.staffName,
                    style: {minWidth: 120},
                  },
                  {
                    label: 'お客様名',
                    cellValue: item.taxCustomerName,
                    style: {minWidth: 120},
                  },
                  {
                    label: '年',
                    cellValue: <div>{Number(item.earlyYear)}</div>,
                  },
                  {
                    label: '月',
                    cellValue: <div>{Number(item.earlyMonth)}</div>,
                  },

                  {
                    label: '銀行名',
                    cellValue: item.BankMaster?.name,
                    style: {minWidth: 120},
                  },
                  {
                    label: '支店名',
                    cellValue: item.BankBranchMaster?.name,
                    style: {minWidth: 120},
                  },
                  {
                    label: '支店カナ',
                    cellValue: item.BankBranchMaster?.branchKana,
                    style: {minWidth: 120},
                  },
                  {
                    label: '店番号',
                    cellValue: item.BankBranchMaster?.code,
                  },
                  {
                    label: '口座種類',
                    cellValue: item.accountType,
                  },
                  {
                    label: '口座番号',
                    cellValue: item.accountNumber,
                  },
                  {
                    label: '名義',
                    cellValue: item.accountNameKana,
                    style: {minWidth: 120},
                  },

                  {
                    label: 'PET月数',
                    cellValue: item.petCount,
                  },
                  {
                    label: 'PET金額',
                    cellValue: item.petPrice,
                  },
                  {
                    label: '県月数',
                    cellValue: item.prefCount,
                  },
                  {
                    label: '県金額',
                    cellValue: item.prefPrice,
                  },
                ].map(col => {
                  return {
                    ...col,
                    style: {minWidth: 50, ...col?.style},
                  }
                }),
              }
            }),
          }).WithWrapper({className: `max-h-full `})}
        </div>
      </C_Stack>
    </div>
  )
}
