import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'
import {Padding} from '@cm/components/styles/common-components/common-components'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import EditInfoForm from './EditInfoForm'

const EditInfoPage = async props => {
  const query = await props.searchParams
  const sateiID = query.sateiID ?? ''

  if (!sateiID) {
    return (
      <Padding>
        <div>査定IDが指定されていません。</div>
      </Padding>
    )
  }

  const ucar = await UcarCL.fetcher.getUcarDataBySateiId(sateiID)

  if (!ucar) {
    return (
      <Padding>
        <div>車両データが見つかりませんでした。</div>
      </Padding>
    )
  }

  const {result: stores} = await doStandardPrisma('store', 'findMany', {
    orderBy: {code: 'asc'},
  })

  return (
    <Padding>
      <EditInfoForm ucar={ucar} stores={stores || []} />
    </Padding>
  )
}

export default EditInfoPage
