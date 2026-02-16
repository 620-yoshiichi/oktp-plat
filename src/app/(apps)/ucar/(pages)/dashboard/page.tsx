import Link from 'next/link'
import DashboardPage from './DashboardPage'
import { isDev } from '@cm/lib/methods/common'

export const metadata = {
  title: 'ダッシュボード',
  description: '工程別リードタイム概況',
}

export default function Page() {
  return <div>


    <DashboardPage />
  </div>
}
