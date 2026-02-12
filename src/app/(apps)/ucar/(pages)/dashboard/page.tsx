import Link from 'next/link'
import DashboardPage from './DashboardPage'
import { isDev } from '@cm/lib/methods/common'

export const metadata = {
  title: 'ダッシュボード',
  description: '工程別リードタイム概況',
}

export default function Page() {
  return <div>
    {isDev && <Link href="https://docs.google.com/spreadsheets/d/1uNqyRalhVhA01DLnZ80b0z_BBFh306O07ZZV5b5vqU4/edit#gid=0">旧ダッシュボード</Link>}
    <DashboardPage /></div>
}
