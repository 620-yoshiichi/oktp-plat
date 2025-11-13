'use client'
import React, {CSSProperties, useEffect, useState} from 'react'
import {Page, View, Document, Image, PDFDownloadLink, PDFViewer, Font} from '@react-pdf/renderer'

import QRCode from 'qrcode'
import {P, styles} from '@cm/lib/react-pdf'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {Paper} from '@cm/components/styles/common-components/paper'
import {getSrc} from '@app/(apps)/ucar/(pages)/admin/InstantQr/conts'

import DynamicLoader from '@cm/components/utils/loader/Loader'

// PDF文書のコンポーネント
const InstantQrSheet = ({ucar}) => {
  const page1Image = '/image/ucar/qr_pdf_1.png'
  const page2Image = '/image/ucar/qr_pdf_2.png'
  // const src = `${basePath}/QRBP/engineer?where-car-bpNumber-contains-text=${encodeURI(ucar.id)}`
  const {sateiID} = ucar

  Font.register({
    family: 'Nasu-Regular',
    src: '/fonts/Nasu-Regular.ttf',
  })
  Font.register({
    family: 'Nasu-Bold',
    src: '/fonts/Nasu-Bold.ttf',
  })

  const pdfName = `QRシート改_${sateiID}.pdf`
  const [qrSrc, setqrSrc] = useState<any>(null)
  const [isReady, setisReady] = useState(false)
  useEffect(() => {
    setisReady(false)
    const origin = getSrc({sateiID})
    const createQRCodeArr = async () => {
      const result = await Promise.all(
        origin.map(async (value, i) => {
          try {
            const dataUrl = await QRCode.toDataURL(value)
            return dataUrl
          } catch (error) {
            console.warn({i, value}, error) //////////
            return value
          }
        })
      )
      const srces = Object.fromEntries(result.map((value, index) => [index + 1, value]))
      setqrSrc(srces)
    }
    createQRCodeArr().then(() => {
      setisReady(true)
    })
  }, [])

  if (!isReady) return <DynamicLoader />

  return (
    <C_Stack className={``}>
      <R_Stack>
        <PDFDownloadLink
          document={<PDF_Document {...{pdfName, ucar, page1Image, page2Image, qrSrc}} />}
          fileName={pdfName}
          className="t-link"
        >
          DOWNLOAD
        </PDFDownloadLink>
      </R_Stack>

      <Paper>
        <PDFViewer
          style={{
            height: '80vh',
            width: '100%',
          }}
        >
          <PDF_Document {...{pdfName, ucar, page1Image, page2Image, qrSrc}} />
        </PDFViewer>
      </Paper>
    </C_Stack>
  )
}

export default InstantQrSheet

const PDF_Document = ({pdfName, ucar, page1Image, page2Image, qrSrc}) => {
  const {sateiID, carName, plate, created_at, color, modelYear, pickUpLocation, remarks, shaken, selfDriving, email} = ucar
  const Page1 = () => {
    return (
      <Page
        {...{
          style: {width: 842, height: 595, position: 'relative'},
          size: 'A4',
          orientation: 'landscape',
        }}
      >
        <View>
          <Image src={page1Image} style={{width: '100%', height: '100%', zIndex: -10}} />
          <Data style={{left: 80, top: 30}}>{new Date().toLocaleDateString()}</Data>
          <Data style={{left: 80, top: 58}}>{sateiID}</Data>
          <Data style={{left: 220, top: 58}}>{created_at}</Data>

          <Data style={{left: 360, top: 58}}>{pickUpLocation}</Data>
          <Data style={{left: 500, top: 58}}>{selfDriving}</Data>
          <Data style={{left: 80, top: 77}}>{carName}</Data>
          <Data style={{left: 220, top: 77}}>{color}</Data>
          <Data style={{left: 360, top: 77}}>{remarks}</Data>

          <Data style={{left: 80, top: 95}}>{plate}</Data>
          <Data style={{left: 220, top: 95}}>{modelYear}</Data>
          <Data style={{left: 360, top: 95}}>{shaken}</Data>
          <Data style={{left: 500, top: 95}}>{email}</Data>

          <QRCodeEl style={{left: 100, top: 130}} src={qrSrc?.['1']} />
          <QRCodeEl style={{left: 290, top: 130}} src={qrSrc?.['2']} />
          <Data style={{left: 230, top: 225, width: 200, color: `red`}}>{`事故車の場合は `}</Data>
          <Data style={{left: 230, top: 240, width: 200, color: `red`}}>{`中古車グループ(馬場)に必ず連絡してください`}</Data>
          <QRCodeEl style={{left: 100, top: 298}} src={qrSrc?.['3']} />
          <QRCodeEl style={{left: 290, top: 298}} src={qrSrc?.['4']} />
          <QRCodeEl style={{left: 100, top: 450}} src={qrSrc?.['5']} />
          <QRCodeEl style={{left: 290, top: 450}} src={qrSrc?.['6']} />
          <QRCodeEl style={{left: 100 + 410, top: 130}} src={qrSrc?.['7']} />
          <QRCodeEl style={{left: 290 + 410, top: 130}} src={qrSrc?.['8']} />
          <QRCodeEl style={{left: 100 + 410, top: 298}} src={qrSrc?.['9']} />
          <QRCodeEl style={{left: 290 + 410, top: 298}} src={qrSrc?.['10']} />
          <QRCodeEl style={{left: 100 + 410, top: 450}} src={qrSrc?.['11']} />
          <QRCodeEl style={{left: 290 + 410, top: 450}} src={qrSrc?.['12']} />
        </View>
      </Page>
    )
  }

  const Page2 = () => {
    return (
      <Page
        {...{
          style: {width: 842, height: 595, position: 'relative'},
          size: 'A4',
          orientation: 'landscape',
        }}
      >
        <View>
          <Image src={page2Image} style={{width: '100%', height: '100%', zIndex: -10}} />
          <QRCodeEl style={{left: 450, top: 145}} src={qrSrc?.['13']} />
          <QRCodeEl style={{left: 450, top: 275}} src={qrSrc?.['14']} />
          <QRCodeEl style={{left: 635, top: 145}} src={qrSrc?.['15']} />
          <QRCodeEl style={{left: 635, top: 275}} src={qrSrc?.['16']} />
          <QRCodeEl style={{left: 635, top: 430}} src={qrSrc?.['17']} />
          <Data style={{left: 80, top: 40}}>{carName}</Data>
          <Data style={{left: 80, top: 58}}>{plate}</Data>

          <Data style={{left: 270, top: 58}}>{email}</Data>

          <Data style={{left: 125, top: 90}}>{sateiID}</Data>
        </View>
      </Page>
    )
  }

  return (
    <Document style={styles.document} title={pdfName} subject={pdfName}>
      <Page1 />
      <Page2 />
    </Document>
  )
}

const QRCodeEl = ({style, src}) => {
  const qrCodeStyle = {
    width: 80,
    height: 80,
  }

  return (
    <Data style={style}>
      <Image src={src} style={qrCodeStyle} />
    </Data>
  )
}

const Data = (props: {style: CSSProperties; children: any}) => {
  const style = props.style as any
  return (
    <View style={{position: 'absolute', left: 10, top: 10, fontSize: 9, ...style}}>
      <P>{props.children}</P>
    </View>
  )
}
