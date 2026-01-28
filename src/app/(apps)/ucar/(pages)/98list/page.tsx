import Number98SearchPage from '@app/(apps)/ucar/(pages)/98list/Number98SearchPage'
import {
  search98Number,
  search98NumberList,
  getNextNumber98,
  type Search98NumberResult,
} from '@app/(apps)/ucar/(lib)/num98/search98Number'

type Props = {
  searchParams: Promise<{ q?: string }>
}

export default async function Page({ searchParams }: Props) {
  const { q: searchQuery } = await searchParams

  // 次の98番号情報を取得
  const nextNumber98Info = await getNextNumber98()

  // 検索クエリがある場合のみデータを取得
  let searchResult: Search98NumberResult | null = null
  let searchList: Awaited<ReturnType<typeof search98NumberList>> = []

  if (searchQuery && searchQuery.trim()) {
    // 完全一致で詳細検索
    searchResult = await search98Number(searchQuery)
    // 部分一致でリスト検索
    searchList = await search98NumberList(searchQuery, { take: 100 })
  }

  return (
    <Number98SearchPage
      {...{
        initialQuery: searchQuery ?? '',
        searchResult,
        searchList,
        nextNumber98Info,
      }}
    />
  )
}
