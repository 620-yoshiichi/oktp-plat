import React from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DndContext, closestCenter } from '@dnd-kit/core'

import { TableWrapper } from '@cm/components/styles/common-components/Table'
import { TableSkelton } from '@cm/components/utils/loader/TableSkelton'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import { MyTableProps, UseMyTableLogicReturn } from '@cm/components/DataLogic/TFs/MyTable/MyTable'
import { cn } from '@cm/shadcn/lib/utils'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { arr__uniqArray } from '@cm/class/ArrHandler/array-utils/basic-operations'

// MainTable用のprops型（useMyTableLogicReturnを含む）
export interface MainTableProps extends MyTableProps {
  useMyTableLogicReturn: UseMyTableLogicReturn
}

export const MainTable = React.memo<MainTableProps>(props => {
  // 🔧 useMyTableLogicはMyTableから渡される（二重呼び出しを防ぐ）
  const { useMyTableLogicReturn } = props
  const {
    tableData,
    mainTableProps: {
      myTable,
      columns,
      elementRef,
      tableStyleRef,
      tableStyle,
      sensors,
      handleDragEndMemo,
      items,
      showHeader,

      rows,
    },

    Components,
  } = useMyTableLogicReturn

  const { records = [], emptyDataStyle } = tableData



  const combinedTableStyle = {
    ...tableStyle,
    ...{ borderCollapse: 'separate' as const, borderSpacing: showHeader ? '0px' : '0px 6px' },
  }

  // TableWrapperCardのclassNameを直接計算（コンポーネント内定義を避ける）
  const wrapperCardClassName =
    myTable?.useWrapperCard === false ? '' : cn('relative h-fit', myTable?.showHeader ? 'p-0!' : 'p-2!')

  return (
    <>
      {typeof myTable?.header === 'function' && myTable?.header()}
      <section className=" bg-inherit">
        {/* TableWrapperCardをインラインdivに変更して再マウントを防ぐ */}
        <div className={wrapperCardClassName}>
          {/* TableWrapperは常にレンダリングされ、スクロール位置を維持 */}
          <TableWrapper ref={elementRef} style={tableStyle}>
            {RenderTableContent({
              records,
              emptyDataStyle,
              sensors,
              handleDragEndMemo,
              items,
              combinedTableStyle,
              tableStyleRef,
              myTable,
              columns,
              Components,
              rows,
            })}
          </TableWrapper>
        </div>
      </section>
    </>
  )
})

MainTable.displayName = 'MainTable'

const RenderTableContent = ({
  records,
  emptyDataStyle,
  sensors,
  handleDragEndMemo,
  items,
  combinedTableStyle,
  tableStyleRef,
  myTable,
  columns,
  Components,
  rows,
}) => {
  // ローディング中
  if (records === null) {
    return (
      <div className="max-w-[90%] w-[300px] h-fit overflow-hidden">
        <TableSkelton />
      </div>
    )
  }

  // データなし
  if (records.length === 0) {
    return (
      <div style={emptyDataStyle} >
        <PlaceHolder className={`px-10 py-6 mx-auto w-fit  `}>データが見つかりません</PlaceHolder>
      </div>
    )
  }

  // テーブル表示
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndMemo}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div>
          <table style={combinedTableStyle} ref={tableStyleRef} className={myTable?.className}>
            {/* ヘッダーは元のコンポーネントを使用 */}
            {myTable?.showHeader && (
              <thead>
                <tr>
                  <th className="text-center bg-gray-100 font-bold border border-gray-300 "></th>

                  {columns[0]
                    ?.filter(col => col?.td?.hidden !== true)
                    .map((col, idx) => (
                      <th
                        key={col.id || idx}
                        className="text-center bg-gray-100 font-bold border border-gray-300 "
                        style={col.th?.style}
                      >
                        {col.label}
                      </th>
                    ))}

                  {myTable?.delete !== false && <th className="text-center bg-gray-100 font-bold border border-gray-300 "></th>}
                </tr>
              </thead>
            )}

            <tbody>
              {records?.map((record, recIdx: number) => (
                <Components.DraggableTableRowCallBack key={record.id} {...{ record, recIdx, rows, Components }} />
              ))}
            </tbody>
          </table>
        </div>
      </SortableContext>
    </DndContext>
  )
}
