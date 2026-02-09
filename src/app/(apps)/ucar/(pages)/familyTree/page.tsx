'use client'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import React, { useState, useMemo } from 'react'
import useSWR from 'swr'
import { fetchRawSql } from '@cm/class/Fields/lib/methods'

type TreeNode = {
  sateiID: string
  rootSateiID: string
  sateiDate: Date | null
  assessmentdatetime: Date | null
  valuationResponsedatetime: Date | null
  assessmentPrice: string | null
  assessmentStaffName: string | null
  salesname: string | null
  pickupScheduledDate: Date | null
}

// 金額フォーマット
const formatPrice = (price: string | null) => {
  if (!price) return '-'
  const num = parseInt(price, 10)
  if (isNaN(num)) return price
  return num.toLocaleString() + '円'
}

// 日数差計算
const calcDaysDiff = (date1: Date | null, date2: Date | null): number | null => {
  if (!date1 || !date2) return null
  const d1 = new Date(date1).getTime()
  const d2 = new Date(date2).getTime()
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
}

// 金額差計算
const calcPriceDiff = (price1: string | null, price2: string | null): number | null => {
  if (!price1 || !price2) return null
  const p1 = parseInt(price1, 10)
  const p2 = parseInt(price2, 10)
  if (isNaN(p1) || isNaN(p2)) return null
  return p2 - p1
}

// 差分表示コンポーネント
const DiffDisplay = ({ prevNode, nextNode }: { prevNode: TreeNode; nextNode: TreeNode }) => {
  const daysDiff = calcDaysDiff(prevNode.assessmentdatetime, nextNode.assessmentdatetime)
  const priceDiff = calcPriceDiff(prevNode.assessmentPrice, nextNode.assessmentPrice)
  const pickupDiff = calcDaysDiff(prevNode.pickupScheduledDate, nextNode.pickupScheduledDate)

  const hasDaysDiff = daysDiff !== null && daysDiff !== 0
  const hasPriceDiff = priceDiff !== null && priceDiff !== 0
  const hasPickupDiff = pickupDiff !== null && pickupDiff !== 0

  return (
    <C_Stack className="items-center gap-0 mx-1">
      <span className="text-gray-400 text-sm">→</span>
      <C_Stack className="text-[9px] gap-0 items-center">
        {/* 査定時刻差 */}
        <span className={hasDaysDiff ? 'text-blue-600' : 'text-gray-300'}>
          {daysDiff !== null ? (daysDiff >= 0 ? `+${daysDiff}日` : `${daysDiff}日`) : '-'}
        </span>
        {/* 金額差 */}
        <span className={hasPriceDiff ? (priceDiff! > 0 ? 'text-red-500' : 'text-green-600') : 'text-gray-300'}>
          {priceDiff !== null ? (priceDiff >= 0 ? `+${priceDiff.toLocaleString()}` : priceDiff.toLocaleString()) : '-'}
        </span>
        {/* 引取日差 */}
        <span className={hasPickupDiff ? 'text-purple-600' : 'text-gray-300'}>
          {pickupDiff !== null ? (pickupDiff >= 0 ? `引+${pickupDiff}日` : `引${pickupDiff}日`) : '引-'}
        </span>
      </C_Stack>
    </C_Stack>
  )
}

// ツールチップ付きノードコンポーネント
const NodeWithTooltip = ({
  node,
  isRoot,
  isLatest,
  onCopy,
}: {
  node: TreeNode
  isRoot: boolean
  isLatest: boolean
  onCopy: (text: string) => void
}) => {
  return (
    <div className="relative inline-block">
      <div
        className={`
            inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono cursor-pointer
            ${isRoot ? 'bg-amber-100 text-amber-700 border border-amber-300' : isLatest ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-600 border border-gray-300'}
            hover:opacity-80
          `}
      >
        <div>
          <div onClick={() => onCopy(node.sateiID)}>
            {node.sateiID}
            {isRoot && <span className="text-[10px]">★</span>}
            {isLatest && !isRoot && <span className="text-[10px]">●</span>}
          </div>
          <C_Stack className={`text-[10px] text-gray-500 gap-0`}>
            <R_Stack className="gap-1">
              <span>{node.assessmentPrice ? formatPrice(node.assessmentPrice) : '-'}</span>
              <span>({node.assessmentdatetime ? formatDate(node.assessmentdatetime, 'MM/DD HH:mm') : '-'})</span>
            </R_Stack>
            <R_Stack className="gap-1">
              <span>{node.assessmentStaffName || '-'}</span>
              <span>/ {node.salesname || '-'}</span>
            </R_Stack>
            <span className="text-purple-500">
              引取: {node.pickupScheduledDate ? formatDate(node.pickupScheduledDate, 'MM/DD') : '-'}
            </span>
          </C_Stack>
        </div>
      </div>
    </div>
  )
}

// 樹形図の行コンポーネント
const TreeRow = ({ rootSateiID, nodes }: { rootSateiID: string; nodes: TreeNode[] }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const sortedNodes = useMemo(() => {
    return [...nodes].sort((a, b) => {
      const dateA = a.assessmentdatetime ? new Date(a.assessmentdatetime).getTime() : 0
      const dateB = b.assessmentdatetime ? new Date(b.assessmentdatetime).getTime() : 0
      return dateA - dateB // 古い順（祖先→子孫）
    })
  }, [nodes])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="border-b border-gray-200 hover:bg-gray-50">
      <div className="flex items-stretch">
        {/* 左側: rootSateiID */}
        <div
          className="w-48 shrink-0 px-3 py-2 bg-gray-100 border-r border-gray-200 flex items-center gap-2 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <button className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700">
            {isExpanded ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
          <span
            className="font-mono text-sm text-gray-700 hover:text-blue-600 cursor-pointer"
            onClick={e => {
              e.stopPropagation()
              copyToClipboard(rootSateiID)
            }}
            title="クリックでコピー"
          >
            {rootSateiID}
          </span>
          <span className="text-xs text-gray-400">({nodes.length})</span>
        </div>

        {/* 右側: 樹形図（横並び） */}
        <div className="flex-1 px-3 py-2 overflow-x-auto">
          <div className="flex items-center min-w-max">
            {sortedNodes.map((node, index) => {
              const isRoot = node.sateiID === rootSateiID
              const isLatest = index === sortedNodes.length - 1
              const prevNode = index > 0 ? sortedNodes[index - 1] : null

              return (
                <React.Fragment key={node.sateiID}>
                  {/* 接続線と差分 */}
                  {index > 0 && prevNode && <DiffDisplay prevNode={prevNode} nextNode={node} />}

                  {/* ノード（ツールチップ付き） */}
                  <NodeWithTooltip node={node} isRoot={isRoot} isLatest={isLatest} onCopy={copyToClipboard} />
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

      {/* 展開時の詳細 */}
      {isExpanded && (
        <div className="bg-gray-50 border-t border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="px-3 py-1.5 text-left font-medium w-12">#</th>
                <th className="px-3 py-1.5 text-left font-medium">査定番号</th>
                <th className="px-3 py-1.5 text-left font-medium">査定時刻</th>
                <th className="px-3 py-1.5 text-left font-medium">値付け時刻</th>
                <th className="px-3 py-1.5 text-right font-medium">値付け金額</th>
                <th className="px-3 py-1.5 text-left font-medium">引取予定</th>
                <th className="px-3 py-1.5 text-left font-medium">査定スタッフ</th>
                <th className="px-3 py-1.5 text-left font-medium">担当営業店舗</th>
                <th className="px-3 py-1.5 text-left font-medium w-20">状態</th>
              </tr>
            </thead>
            <tbody>
              {sortedNodes.map((node, index) => {
                const isRoot = node.sateiID === rootSateiID
                const isLatest = index === sortedNodes.length - 1

                return (
                  <tr key={node.sateiID} className="border-t border-gray-200 hover:bg-white">
                    <td className="px-3 py-1.5 text-gray-400">{index + 1}</td>
                    <td className="px-3 py-1.5">
                      <span
                        className="font-mono text-blue-600 hover:underline cursor-pointer"
                        onClick={() => copyToClipboard(node.sateiID)}
                      >
                        {node.sateiID}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-gray-600">
                      {node.assessmentdatetime ? formatDate(node.assessmentdatetime, 'YYYY/MM/DD HH:mm:ss') : '-'}
                    </td>
                    <td className="px-3 py-1.5 text-gray-600">
                      {node.valuationResponsedatetime ? formatDate(node.valuationResponsedatetime, 'YYYY/MM/DD HH:mm:ss') : '-'}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-gray-800">{formatPrice(node.assessmentPrice)}</td>
                    <td className="px-3 py-1.5 text-gray-600">
                      {node.pickupScheduledDate ? formatDate(node.pickupScheduledDate, 'YYYY/MM/DD') : '-'}
                    </td>
                    <td className="px-3 py-1.5 text-gray-600">{node.assessmentStaffName || '-'}</td>
                    <td className="px-3 py-1.5 text-gray-600">{node.salesname || '-'}</td>
                    <td className="px-3 py-1.5">
                      {isRoot && <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">ROOT</span>}
                      {isLatest && !isRoot && (
                        <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">最新</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// メインページ
export default function FamilyTreePage() {
  const [searchQuery, setSearchQuery] = useState('')

  // 全ツリーデータを取得（UPASSテーブルとJOINして追加情報取得）
  const { data: allTreeData, isLoading } = useSWR('upassFamilyTree-all-v3', async () => {
    const sql = `
      SELECT
        uft."rootSateiID",
        uft."sateiID",
        uft."sateiDate",
        u."assessmentdatetime",
        u."valuationResponsedatetime",
        u."assessmentPrice",
        u."assessmentStaffName",
        u."salesname",
        u."pickupScheduledDate"
      FROM "UpassFamilyTree" uft
      LEFT JOIN "UPASS" u ON uft."sateiID" = u."sateiID"
      ORDER BY uft."rootSateiID", u."assessmentdatetime" ASC NULLS LAST
    `
    const result = await fetchRawSql({ sql })
    return result.rows ?? []
  })

  // ツリーデータをグループ化
  const groupedTrees = useMemo(() => {
    if (!allTreeData) return {}

    const groups: Record<string, TreeNode[]> = {}

    allTreeData.forEach((row: any) => {
      const key = row.rootSateiID
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push({
        sateiID: row.sateiID,
        rootSateiID: row.rootSateiID,
        sateiDate: row.sateiDate,
        assessmentdatetime: row.assessmentdatetime,
        valuationResponsedatetime: row.valuationResponsedatetime,
        assessmentPrice: row.assessmentPrice,
        assessmentStaffName: row.assessmentStaffName,
        salesname: row.salesname,
        pickupScheduledDate: row.pickupScheduledDate,
      })
    })

    return groups
  }, [allTreeData])

  // フィルタリング
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedTrees

    const query = searchQuery.toLowerCase()
    const filtered: typeof groupedTrees = {}

    Object.entries(groupedTrees).forEach(([rootId, nodes]) => {
      if (rootId.toLowerCase().includes(query) || nodes.some(node => node.sateiID.toLowerCase().includes(query))) {
        filtered[rootId] = nodes
      }
    })

    return filtered
  }, [groupedTrees, searchQuery])

  const totalGroups = Object.keys(filteredGroups).length
  const totalNodes = Object.values(filteredGroups).flat().length

  return (
    <C_Stack className="h-full">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <R_Stack className="justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-800">査定ID ファミリーツリー</h1>
            <p className="text-xs text-gray-500">
              {totalGroups}グループ / {totalNodes}件
            </p>
          </div>

          {/* 検索 */}
          <div className="relative">
            <input
              type="text"
              placeholder="査定IDで検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-64 pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </R_Stack>
      </div>

      {/* 凡例 */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <R_Stack className="gap-4 text-xs text-gray-600 flex-wrap">
          <R_Stack className="gap-1">
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 border border-amber-300 rounded">★</span>
            <span>ROOT（起点）</span>
          </R_Stack>
          <R_Stack className="gap-1">
            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 border border-green-300 rounded">●</span>
            <span>最新</span>
          </R_Stack>
          <span className="text-gray-400">|</span>
          <R_Stack className="gap-1">
            <span className="text-blue-600">+N日</span>
            <span>査定時刻差</span>
          </R_Stack>
          <R_Stack className="gap-1">
            <span className="text-red-500">+金額</span>
            <span className="text-green-600">-金額</span>
            <span>金額差</span>
          </R_Stack>
          <R_Stack className="gap-1">
            <span className="text-purple-600">引+N日</span>
            <span>引取日差</span>
          </R_Stack>
          <span className="text-gray-300">(薄色=差なし)</span>
        </R_Stack>
      </div>

      {/* テーブルヘッダー */}
      <div className="flex bg-gray-100 border-b border-gray-300 text-xs font-medium text-gray-600">
        <div className="w-48 shrink-0 px-3 py-2 border-r border-gray-300">ルート査定ID</div>
        <div className="flex-1 px-3 py-2">系譜（古い → 新しい）</div>
      </div>

      {/* リスト本体 */}
      <div className="flex-1 overflow-auto bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : totalGroups === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">
              {searchQuery ? `「${searchQuery}」に一致するデータがありません` : 'データがありません'}
            </div>
          </div>
        ) : (
          Object.entries(filteredGroups).map(([rootId, nodes]) => <TreeRow key={rootId} rootSateiID={rootId} nodes={nodes} />)
        )}
      </div>
    </C_Stack>
  )
}
