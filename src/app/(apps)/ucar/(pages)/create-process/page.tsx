import UcarProcessInputter from '@app/(apps)/ucar/(pages)/create-process/UcarProcessInputter'
import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'


const CreateProcessPage = async props => {
  const query = await props.searchParams
  const sateiID = query.sateiID ?? ''

  const UcarData = await UcarCL.fetcher.getUcarDataBySateiId(sateiID)

  if (UcarData) {
    return (
      <>
        <UcarProcessInputter {...{UcarData}} />
      </>
    )
  }
}

export default CreateProcessPage
