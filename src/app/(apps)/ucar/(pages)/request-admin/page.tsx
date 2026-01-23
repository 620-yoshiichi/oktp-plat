import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {redirect} from 'next/navigation'
import {UcarRequestCl} from '@app/(apps)/ucar/class/UcarRequestCl'
import RequestAdminClient from './RequestAdminClient'

export default async function RequestAdminPage(props) {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})

  // 権限チェック: 本部管理者またはシステム管理者のみアクセス可能
  const {isHQ} = scopes.getUcarProps()
  const isSystemAdmin = session?.role === '管理者'

  if (!isHQ && !isSystemAdmin) {
    redirect('/ucar')
  }

  // ステータスフィルタ
  const statusFilter = (query.status as string) || undefined

  // 申請一覧を取得
  const requests = await UcarRequestCl.getList({
    status: statusFilter,
    take: 100,
  })

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">申請管理</h1>

      <RequestAdminClient
        initialRequests={requests}
        initialStatusFilter={statusFilter || 'all'}
        sessionId={session?.id}
      />
    </div>
  )
}
