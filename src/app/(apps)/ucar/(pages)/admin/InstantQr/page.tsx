import InstantQrSheet from '@app/(apps)/ucar/(pages)/admin/InstantQr/InstantQrSheet'

import {Padding} from '@cm/components/styles/common-components/common-components'

const QrPage = async props => {
  const query = await props.searchParams
  const {
    sateiId: sateiID,
    carName,
    plate,
    created_at,
    color,
    modelYear,
    pickUpLocation,
    remarks,
    shaken,
    selfDriving,
    email,
  } = query
  const ucar = {sateiID, carName, plate, created_at, color, modelYear, pickUpLocation, remarks, shaken, selfDriving, email}

  return (
    <Padding>
      <div style={{maxWidth: 1200, height: '90vh', margin: `auto`}}>
        <InstantQrSheet {...{ucar: ucar}}></InstantQrSheet>
      </div>
    </Padding>
  )
}
export default QrPage
