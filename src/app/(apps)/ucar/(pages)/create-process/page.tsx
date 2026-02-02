import UcarProcessInputter from '@app/(apps)/ucar/(pages)/create-process/UcarProcessInputter'
import { UcarCL } from '@app/(apps)/ucar/class/UcarCL'
import { Alert } from '@cm/components/styles/common-components/Alert'
import { CenterScreen } from '@cm/components/styles/common-components/common-components'



const CreateProcessPage = async props => {
  const query = await props.searchParams
  const sateiID = query.sateiID ?? ''

  const UcarData = await UcarCL.fetcher.getUcarDataBySateiId(sateiID)

  if (UcarData) {
    return (
      <>
        <UcarProcessInputter {...{ UcarData }} />
      </>
    )
  } else {
    return <CenterScreen>
      <Alert >
        読み込まれたQRシートの査定番号が存在しません。<br />
        スタッフが査定番号を誤って入力した可能性があります。<br />
        該当の車両の<strong className='text-red-500'>車体番号</strong>をお調べの上、システム担当者までご連絡ください。
      </Alert>
    </CenterScreen>
  }
}

export default CreateProcessPage
