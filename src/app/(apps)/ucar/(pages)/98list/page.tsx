import Number98SearchPage from '@app/(apps)/ucar/(pages)/98list/Number98SearchPage'
import { IssueHistoryTable } from '@app/(apps)/ucar/(pages)/98list/components'
import {
  search98Number,
  search98NumberList,
  getNextNumber98,
  getNumber98IssueHistory,
  getUcar98AssignmentHistory,
  unifiedSearch,
  type Search98NumberResult,
  type SortOrder,
  type UnifiedSearchResult,
} from '@app/(apps)/ucar/(lib)/num98/search98Number'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'
import { C_Stack } from '@cm/components/styles/common-components/common-components'

type Props = {
  searchParams: Promise<{ q?: string; sort?: SortOrder }>
}

export default async function Page({ searchParams }: Props) {
  const { q: searchQuery, sort } = await searchParams
  const sortOrder: SortOrder = sort === 'siireDate' ? 'siireDate' : 'default'

  // 次の98番号情報を取得
  const nextNumber98Info = await getNextNumber98()

  // 最新30件の98付与履歴を取得
  const [issueHistory, assignmentHistory] = await Promise.all([
    getNumber98IssueHistory(30),
    getUcar98AssignmentHistory(30),
  ])

  // 検索クエリがある場合のみデータを取得
  let searchResult: Search98NumberResult | null = null
  let searchList: Awaited<ReturnType<typeof search98NumberList>> = []
  let unifiedSearchResult: UnifiedSearchResult | null = null

  if (searchQuery && searchQuery.trim()) {
    // 統合検索を実行
    unifiedSearchResult = await unifiedSearch(searchQuery, { sortOrder })
    // 98番号検索も実行（98番号形式の場合）
    if (unifiedSearchResult.searchType === 'number98') {
      searchResult = await search98Number(searchQuery, { sortOrder })
      searchList = await search98NumberList(searchQuery, { take: 100 })
    }
  }

  return <div className={`p-4 mx-auto max-w-[1000px]`}>
    <BasicTabs   {...{

      id: '98list',
      TabComponentArray: [

        {
          label: '98付与履歴', component:
            <div className={`mr-auto`}>
              <h2 className="text-lg font-bold mb-4">最新30件の98付与履歴</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Number98IssueHistory: 発行履歴 */}
                <C_Stack className="items-start w-fit">
                  <IssueHistoryTable issueHistory={issueHistory} />
                </C_Stack>


              </div>
            </div>
        },
        {
          label: '98検索',
          component:
            <Number98SearchPage
              {...{
                initialQuery: searchQuery ?? '',
                initialSortOrder: sortOrder,
                searchResult,
                unifiedSearchResult,
                searchList,
                nextNumber98Info,
                issueHistory,
                assignmentHistory,
              }}
            />
        }
      ],
    }} />
  </div>
}
