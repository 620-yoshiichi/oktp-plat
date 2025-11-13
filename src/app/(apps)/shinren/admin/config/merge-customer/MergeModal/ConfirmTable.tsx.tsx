'use client'

import {ColoredText} from '@cm/components/styles/common-components/colors'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'

import {ChevronDoubleRightIcon} from '@heroicons/react/20/solid'

export const ConfirmTable = ({allCustomerCols, mergedData, notices, CstmrFrom, setmergedData, CstmTo}) => {
  return (
    <div className={`table-wrapper [&_td]:!px-4 [&_tr]:!border-b-[1px] `}>
      <table>
        <thead>
          <tr>
            <th>データ元</th>
            <th>項目名</th>
            <th>アプリ</th>
            <th></th>
            <th>NEO</th>
            <th></th>
            <th>統合後</th>
          </tr>
        </thead>
        <tbody>
          {allCustomerCols.map((col, i) => {
            const {id, source} = col
            const value = mergedData[id]
            const notice = notices.find(n => n.source === source)

            const dataSource = (
              <ColoredText bgColor={notice?.color ?? ''} style={{width: 40, padding: 4, fontSize: 10}}>
                {notice?.source}
              </ColoredText>
            )

            const Td = ({data, type}) => {
              const value = data[col.id]

              const applied = value === mergedData[col.id]
              const className =
                type === `merged`
                  ? `font-bold text-xl`
                  : !applied
                    ? `opacity-50 text-error-main line-through`
                    : `text-xl font-bold`
              return (
                <td>
                  {value && (
                    <IconBtn
                      className={className}
                      // onClick={() => {
                      //   if (source === 'NEO') {
                      //     alert(`NEOデータは変更できません。`)
                      //     return
                      //   }
                      //   if (applied) {
                      //     alert(`すでにこちらが適応されています。`)
                      //     return
                      //   }

                      //   const message = `${col.label}を${value}に変更しますか？`
                      //   if (confirm(message)) {
                      //     setmergedData({...mergedData, [col.id]: value})
                      //   }
                      // }}
                    >
                      {value}
                    </IconBtn>
                  )}
                </td>
              )
            }

            return (
              <tr key={i} className={`text-center`}>
                <td>{dataSource}</td>
                <td>{col.label}</td>
                <Td {...{data: CstmrFrom, type: `from`}} />
                <td>or</td>
                <Td {...{data: CstmTo, type: `to`}} />
                <td>
                  <ChevronDoubleRightIcon />
                </td>
                <td className={`text-xl font-bold text-blue-700`}>{value}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
