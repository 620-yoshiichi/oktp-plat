import { useGlobalPropType } from '@cm/hooks/globalHooks/useGlobal'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { toastByResult } from '@cm/lib/ui/notifications'
import { XCircle } from 'lucide-react';

const CancelButton = ({ record, useGlobalProps }: { record: any; useGlobalProps: useGlobalPropType }) => {
  const { toggleLoad, accessScopes } = useGlobalProps
  const { isHQ } = accessScopes().getNewCarProps()

  // 本部スタッフ、またはステータスがnull以外の場合は非表示
  if (isHQ || record.status !== null) return null

  const handleCancel = async () => {
    if (!confirm('この申請をキャンセルしますか？')) return

    toggleLoad(async () => {
      const result = await doStandardPrisma('desiredTorokuDate', 'update', {
        where: { id: record.id },
        data: { status: 'キャンセル' },
      })
      toastByResult(result)
    })
  }

  return (
    <button className={` ml-4 bg-gray-700 cursor-pointer rounded-full  text-white  text-xs w-20 p-1 onHover `} onClick={handleCancel}>
      申請取消
      {/* <XCircle className={`w-5 h-5`} /> */}
    </button>
  )
}

export default CancelButton
