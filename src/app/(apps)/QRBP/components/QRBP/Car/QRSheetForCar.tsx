'use client'

import {Page, View, Document, Image, PDFViewer, Font, Text} from '@react-pdf/renderer'
import {basePath, superTrim} from '@cm/lib/methods/common'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'
import {ColStack, grayStyle, leftRightStyle, P, RowStack, styles, Table, Tr} from '@cm/lib/react-pdf'

const Td = (props: any) => {
  const {children, colSpan, ...restProps} = props
  const baseColWidth = 25 // single column width as a percentage
  const width = `${baseColWidth * (colSpan || 1)}%` // calculate new width based on colSpan

  return (
    <View
      {...restProps}
      style={{
        padding: '0 5px',
        width,
        textAlign: `center`,
        ...styles.tableCol,
        ...restProps.style,
      }}
    >
      <Text style={{fontSize: 11, margin: `auto 0`}}>{children}</Text>
    </View>
  )
}

// PDF文書のコンポーネント
const QRSheetForCar = ({car, qrCodeArr}) => {
  const src = `${basePath}/QRBP/engineer?where-car-bpNumber-contains-text=${encodeURI(car.bpNumber)}`
  const nonTrimList = ['bpNumber']
  Object.keys(car).forEach(key => {
    if (typeof car[key] === 'string' && !nonTrimList.includes(key)) {
      car[key] = superTrim(car[key])
    }
  })

  const ChakoProcesser = new BP_Car(car).findProcessByName('着工許可')?.User
  const chakkoData = {
    name: ChakoProcesser?.name,
    date: formatDate(ChakoProcesser?.date),
    type: ChakoProcesser?.type,
    style: {backgroundColor: 'darkgray'},
  }

  Font.register({
    family: 'Nasu-Regular',
    src: '/fonts/Nasu-Regular.ttf',
  })
  Font.register({
    family: 'Nasu-Bold',
    src: '/fonts/Nasu-Bold.ttf',
  })

  return (
    <div className={`col-stack w-full p-4  `}>
      {src}
      {/* <PDFDownloadLink
        document={<PDF_Document {...{car, qrCodeArr, chakkoData, ChakoProcesser}} />}
        fileName={`${car.bpNumber}.pdf`}
        className="t-btn"
      >
        DOWNLOAD
      </PDFDownloadLink> */}

      <PDFViewer className={`border-sub-main h-[800px] w-full border-2 p-2`}>
        <PDF_Document {...{car, qrCodeArr, chakkoData, ChakoProcesser}} />
      </PDFViewer>
    </div>
  )
}

export default QRSheetForCar
const PDF_Document = ({car, qrCodeArr, chakkoData, ChakoProcesser}) => {
  const Left = props => {
    return (
      <View style={{...leftRightStyle}}>
        <Table style={styles.table}>
          <Tr>
            <Td style={grayStyle}>受注番号</Td>
            <Td>{car?.bpNumber?.substring(3, 8)}</Td>
            <Td style={grayStyle}>色</Td>
            <Td>{car?.color}</Td>
          </Tr>
          <Tr>
            <Td style={{...grayStyle, height: 60}} colSpan={1}>
              作業期間
            </Td>
            <Td colSpan={3}></Td>
          </Tr>
          <Tr>
            <Td style={grayStyle} colSpan={1} className={``}>
              お客様
            </Td>
            <Td colSpan={3} className={`text-base font-bold`}>
              {car?.customerName}
            </Td>
          </Tr>
          <Tr>
            <Td style={grayStyle} colSpan={1}>
              <ColStack>
                <P>車種</P>
                <P>プレート</P>
              </ColStack>
            </Td>
            <Td colSpan={3} className={``}>
              <ColStack>
                <P>{car?.carName}</P>
                <P>{car?.plate}</P>
              </ColStack>
            </Td>
          </Tr>

          <Tr>
            <Td colSpan={2}>{car?.Store?.name}</Td>
            <Td colSpan={2}>{car?.CrUser?.User.name}</Td>
          </Tr>

          <Tr>
            <Td style={grayStyle}>
              <P style={{fontWeight: 'bold', fontSize: 16}}>B</P>
            </Td>
            <Td>{''}</Td>
            <Td style={grayStyle}>
              <P style={{fontWeight: 'bold', fontSize: 16}}>P</P>
            </Td>
            <Td>{''}</Td>
          </Tr>
          <Tr style={{height: 100}}>
            <Td style={grayStyle} colSpan={1}>
              損傷部位
            </Td>
            <Td colSpan={3}></Td>
          </Tr>
          <Tr style={{height: 100}}>
            <Td style={grayStyle} colSpan={1}>
              連絡
            </Td>
            <Td colSpan={3}></Td>
          </Tr>
          <Tr style={{height: 320}}>
            <Td colSpan={4}></Td>
          </Tr>

          <Tr>
            <Td style={grayStyle}>拠点</Td>
            <Td style={{fontSize: 10}}>{car?.Store?.name}</Td>
            <Td style={grayStyle}>拠点AD</Td>
            <Td>{car?.User?.name}</Td>
          </Tr>

          <Tr>
            <Td style={grayStyle}>発行日</Td>
            <Td>{formatDate(new Date())}</Td>
            <Td style={grayStyle}>引渡予定日</Td>
            <Td>{formatDate(car?.scheduledAt)}</Td>
          </Tr>
        </Table>
      </View>
    )
  }

  const Right = props => {
    return (
      <View style={{...leftRightStyle}}>
        <View
          style={{margin: 'auto auto', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginBottom: 'auto', padding: 3}}
        >
          {qrCodeArr.map((data, i) => {
            const {qrCode, car} = data

            const main = !car.representativeCarBpNumber

            return (
              <View
                key={i}
                style={{
                  border: '2px solid gray',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginTop: 20,
                  ...(main
                    ? {width: '100%'}
                    : {
                        width: '50%',
                        fontSize: 10,
                      }),
                }}
              >
                <P>{car.bpNumber}</P>
                <P>{main ? 'メイン' : 'サブ'}</P>
                <Image
                  src={qrCode}
                  style={{
                    width: main ? 160 : 120,
                    height: main ? 160 : 120,
                  }}
                />
              </View>
            )
          })}
        </View>
        {/* <Image src={qrCodeData} style={{width: 200, height: 200, margin: 'auto auto '}} /> */}
        <View style={{...chakkoData.style, padding: 5, marginTop: 'auto'}}>
          <P>着工許可者: ({chakkoData.name})</P>
          <P> {ChakoProcesser?.date ? formatDate(ChakoProcesser?.date) : '許可なし'}</P>
        </View>
      </View>
    )
  }

  return (
    <Document style={styles.document}>
      <Page style={styles.page} size="A4">
        <RowStack style={{display: 'flex', flexDirection: 'row'}}>
          <Left car={car} />
          <Right />
        </RowStack>
      </Page>
    </Document>
  )
}
