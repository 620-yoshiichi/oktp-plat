import UcarQrSheet from '@app/(apps)/ucar/(pages)/qr/UcarQrSheet'
import {createProcessByName} from '@app/(apps)/ucar/(lib)/server-actions/Ucar-server-actions'
import {Padding} from '@cm/components/styles/common-components/common-components'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import prisma from 'src/lib/prisma'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'
const QrPage = async props => {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})
  const ucar = await UcarCL.fetcher.getUcarDataBySateiId(query.sateiID)

  const {STORE_QR_ISSUE} = UcarProcessCl.CODE.raw
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

  return (
    <Padding>
      <div style={{maxWidth: 1200, height: '90vh', margin: `auto`}}>
        <UcarQrSheet ucar={ucar}></UcarQrSheet>
      </div>
    </Padding>
  )
}
export default QrPage
