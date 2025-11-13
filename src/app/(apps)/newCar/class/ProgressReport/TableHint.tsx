'use client'

import React from 'react'

import {TableBordered, TableWrapper} from '@cm/components/styles/common-components/Table'
import MyPopover from '@cm/components/utils/popover/MyPopover'

export const TableHint = () => {
  return (
    <div>
      <MyPopover
        {...{
          mode: `click`,
          button: <div className={`t-link`}> 条件一覧</div>,
        }}
      >
        <section className={`t-paper bg-gray-100`}>
          <TableWrapper>
            <TableBordered>
              <thead>
                <tr>
                  <th>項目</th>
                  <th>対象条件</th>
                  <th>カウント条件</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2ヶ月前</td>
                  <td>生産予定日の2ヶ月前がその月である場合</td>
                  <td>2ヶ月前活動実施</td>
                </tr>
                <tr>
                  <td>1ヶ月前</td>
                  <td>生産予定日の1ヶ月前がその月である場合。</td>
                  <td>1ヶ月前活動実施かつ超過なし。</td>
                </tr>
                <tr>
                  <td>登録</td>
                  <td>振当（未振当場合は、生産予定日）がその月である場合</td>
                  <td>登録希望日を入力し、承認済</td>
                </tr>
                <tr>
                  <td>配送希望日</td>
                  <td>振当（未振当場合は、生産予定日）がその月である場合</td>
                  <td>配送予定入力</td>
                </tr>
                <tr>
                  <td>納車</td>
                  <td>振当（未振当場合は、生産予定日）がその月である場合</td>
                  <td>納車実績入力</td>
                </tr>
              </tbody>
            </TableBordered>
          </TableWrapper>
        </section>
      </MyPopover>
    </div>
  )
}
