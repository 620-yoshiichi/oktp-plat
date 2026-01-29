import UcarQrSheet from '@app/(apps)/ucar/(pages)/qr/UcarQrSheet'
import { createProcessByName } from '@app/(apps)/ucar/(lib)/server-actions/Ucar-server-actions'
import { Padding } from '@cm/components/styles/common-components/common-components'
import { initServerComopnent } from 'src/non-common/serverSideFunction'
import prisma from 'src/lib/prisma'
import { UcarProcessCl } from '@app/(apps)/ucar/class/UcarProcessCl'
import { UcarCL } from '@app/(apps)/ucar/class/UcarCL'

// 旧QRシステムの移行日（2025年1月21日）
const OLD_QR_SYSTEM_CUTOFF_DATE = new Date('2026-01-21T00:00:00+09:00')

const QrPage = async props => {
  const query = await props.searchParams
  const { session } = await initServerComopnent({ query })
  const ucar = await UcarCL.fetcher.getUcarDataBySateiId(query.sateiID)

  const { STORE_QR_ISSUE } = UcarProcessCl.CODE.raw
  const StarterProcess = ucar.UcarProcess.find(process => process?.processCode === STORE_QR_ISSUE.code)

  if (!StarterProcess) {
    const res = (await createProcessByName({
      tx: prisma,
      session,
      sateiID: query.sateiID,
      processCode: STORE_QR_ISSUE.code,
    })) as any

    if (!res?.id) {
      return <div>QRシートが作成できませんでした。</div>
    }
  }

  // 旧QRシステムで作成されたデータかどうかをチェック
  const isCreatedBeforeCutoff = ucar.createdAt && new Date(ucar.createdAt).getTime() < OLD_QR_SYSTEM_CUTOFF_DATE.getTime()

  return (
    <Padding className={`w-fit mx-auto`}>

      {isCreatedBeforeCutoff && (
        <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-500 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 text-xl">⚠️</span>
            <span className="font-bold text-amber-800">警告</span>
          </div>
          <p className="mt-2 text-amber-800">
            この査定車両は、旧QRシステムでQRシートが発行されている可能性があります。。再発行する前に、必ずシステム管理者へお問い合わせください。
          </p>
        </div>
      )}
      <UcarQrSheet ucar={ucar}></UcarQrSheet>
    </Padding>
  )
}
export default QrPage


