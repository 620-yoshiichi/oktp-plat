import QRSheetForCar from '@app/(apps)/QRBP/components/QRBP/Car/QRSheetForCar'
import React from 'react'
import {DoubledBP} from '@app/(apps)/QRBP/class/doubledBpNumber'

import QRCode from 'qrcode'
import {basePath} from '@cm/lib/methods/common'
import prisma from 'src/lib/prisma'
export default async function QRSheetPage(props) {
  const query = await props.searchParams

  const {bpNumber, orderedAt: orderedAtString} = query

  const car = await DoubledBP.params.getCarByParams({bpNumber, orderedAtString})

  const subCars = await prisma.car.findMany({where: {representativeCarBpNumber: car?.bpNumber}})

  const QR_Code_TargetCars = [car, ...(subCars ?? [])]
  const qrCodeArr = await Promise.all(
    QR_Code_TargetCars.map(async car => {
      const src = `${basePath}/QRBP/engineer?where-car-bpNumber-contains-text=${encodeURI(car.bpNumber)}`
      const qrCode = await QRCode.toDataURL(src)

      return {
        car,
        qrCode,
      }
    })
  )

  if (!car) return <></>

  return (
    <div>
      <QRSheetForCar {...{car, qrCodeArr}} />
    </div>
  )
}
