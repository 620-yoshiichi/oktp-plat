import React from 'react'
import {Page, Document, Text, View, StyleSheet, Font} from '@react-pdf/renderer'

Font.register({
  family: 'Nasu-Regular',
  src: '/fonts/Nasu-Regular.ttf',
  fontWeight: 'normal',
})
Font.register({
  family: 'Nasu-Bold',
  src: '/fonts/Nasu-Bold.ttf',
  fontWeight: 'bold',
})

const styles = StyleSheet.create({
  document: {
    fontFamily: 'Nasu-Regular',
  },
  page: {
    padding: 40,
    fontSize: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  middleRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  leftSection: {
    width: '50%',
    paddingRight: 20,
  },
  rightSection: {
    width: '50%',
    paddingLeft: 20,
  },
  label: {
    fontSize: 9,
    marginBottom: 3,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 14,
    marginBottom: 12,
    paddingLeft: 5,
    fontFamily: 'Nasu-Bold',
  },
  contentBox: {
    border: '1 solid black',
    padding: 15,
    minHeight: 200,
    marginTop: 20,
  },
  contentText: {
    fontSize: 10,
    lineHeight: 1.6,
  },
})

type InadequacyPdfProps = {
  storeManagerName?: string
  staffName?: string
  sateiID: string
  carName?: string
  customerName?: string
  inkanCertificateExpiredAt?: Date | string | null
  returnDate: Date | string
  inadequacyType: string
  hqReceptionistName?: string
  content: string
}

export const InadequacyPdf: React.FC<InadequacyPdfProps> = ({
  storeManagerName,
  staffName,
  sateiID,
  carName,
  customerName,
  inkanCertificateExpiredAt,
  returnDate,
  inadequacyType,
  hqReceptionistName,
  content,
}) => {
  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return ''
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return ''
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  }

  return (
    <Document style={styles.document}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>不備返送票</Text>

        {/* 上部行：左側に店長・スタッフ・査定番号、右側に不備返却日・不備区分・本部受付者 */}
        <View style={styles.topRow}>
          <View style={styles.leftSection}>
            <Text style={styles.label}>店長</Text>
            <Text style={styles.value}>{storeManagerName || ''}</Text>

            <Text style={styles.label}>スタッフ</Text>
            <Text style={styles.value}>{staffName || ''}</Text>

            <Text style={styles.label}>査定番号</Text>
            <Text style={styles.value}>{sateiID}</Text>
          </View>

          <View style={styles.rightSection}>
            <Text style={styles.label}>不備返却日</Text>
            <Text style={styles.value}>{formatDate(returnDate)}</Text>

            <Text style={styles.label}>不備区分</Text>
            <Text style={styles.value}>{inadequacyType}</Text>

            <Text style={styles.label}>本部受付者</Text>
            <Text style={styles.value}>{hqReceptionistName || ''}</Text>
          </View>
        </View>

        {/* 中央行：左側に車名・お客様名・印鑑証明期限 */}
        <View style={styles.middleRow}>
          <View style={styles.leftSection}>
            <Text style={styles.label}>車名</Text>
            <Text style={styles.value}>{carName || ''}</Text>

            <Text style={styles.label}>お客様名</Text>
            <Text style={styles.value}>{customerName || ''}</Text>

            <Text style={styles.label}>印鑑証明期限</Text>
            <Text style={styles.value}>{formatDate(inkanCertificateExpiredAt)}</Text>
          </View>
        </View>

        {/* 下部：不備内容 */}
        <View style={styles.contentBox}>
          <Text style={styles.contentText}>{content || ''}</Text>
        </View>
      </Page>
    </Document>
  )
}
