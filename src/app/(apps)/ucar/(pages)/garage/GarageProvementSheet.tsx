export {}
// /* eslint-disable no-irregular-whitespace */
// 'use client'

// import React from 'react'
// import {Page, View, Document, PDFDownloadLink, PDFViewer, Font, Text} from '@react-pdf/renderer'
// import {RowStack, styles, Table, Td} from '@cm/lib/react-pdf'
// import {H1, OwnerInfo, Provement, Signs} from '@app/(apps)/ucar/(pages)/garage/components'

// Font.register({
//   family: 'Nasu-Regular',
//   src: '/fonts/Nasu-Regular.ttf',
// })
// Font.register({
//   family: 'Nasu-Bold',
//   src: '/fonts/Nasu-Bold.ttf',
// })
// // Create Document Component

// const MyDocument = () => {
//   const B_Text = props => {
//     const {style, children, ...restProps} = props
//     return (
//       <Text
//         {...restProps}
//         style={{
//           ...styles.tableCol,
//           padding: `0 5px`,
//           ...style,
//         }}
//       >
//         {children}
//       </Text>
//     )
//   }

//   const HeightenedTr = ({children}) => {
//     return <RowStack style={{height: 20}}>{children}</RowStack>
//   }
//   return (
//     <Document style={styles.document}>
//       <Page style={{...styles.page, fontSize: 10}} size="A4" orientation="landscape">
//         {/* <View style={{width: 650}}>
//           <RowStack style={{justifyContent: 'flex-end'}}>
//             <Signs />
//           </RowStack>
//           <View>
//             <B_Text style={{textAlign: `center`}}>自動車保管場所証明申請書</B_Text>
//           </View>
//           <RowStack>
//             <B_Text style={{width: `22%`, textAlign: `center`}}>車名</B_Text>
//             <B_Text style={{width: `22%`, textAlign: `center`}}>型式</B_Text>
//             <B_Text style={{width: `22%`, textAlign: `center`}}>車台番号</B_Text>
//             <B_Text style={{width: `34%`, textAlign: `center`}}>自動車の大きさ</B_Text>
//           </RowStack>
//           <RowStack style={{height: 60}}>
//             <B_Text style={{width: `22%`, textAlign: `center`}}>---</B_Text>
//             <B_Text style={{width: `22%`, textAlign: `center`}}>---</B_Text>
//             <B_Text style={{width: `22%`, textAlign: `center`}}>---</B_Text>
//             <B_Text style={{width: `34%`, textAlign: `center`}}>---</B_Text>
//           </RowStack>

//           <RowStack style={{height: 30}}>
//             <B_Text style={{width: `22%`}}>自動車の使用の本拠の位置</B_Text>
//             <B_Text style={{width: `78%`, textAlign: `left`}}></B_Text>
//           </RowStack>
//           <RowStack style={{height: 30}}>
//             <B_Text style={{width: `22%`}}>自動車の保管場所の位置</B_Text>
//             <B_Text style={{width: `78%`, textAlign: `left`}}>同上</B_Text>
//           </RowStack>

//           <RowStack style={{height: 30}}>
//             <B_Text style={{width: `22%`}}>※保管場所標章番号</B_Text>
//             <B_Text style={{width: `78%`}}></B_Text>
//           </RowStack>
//           <OwnerInfo />
//         </View> */}
//         <View style={{width: 650}}>
//           <RowStack style={{justifyContent: 'flex-end'}}>
//             <Signs />
//           </RowStack>
//           <Table>
//             <HeightenedTr>
//               <Td style={{width: `100%`}}>
//                 <H1>自動車保管場所証明申請書</H1>
//               </Td>
//             </HeightenedTr>
//             <HeightenedTr>
//               <Td style={{width: `22%`}}>車名</Td>
//               <Td style={{width: `22%`}}>型式</Td>
//               <Td style={{width: `22%`}}>車台番号</Td>
//               <Td style={{width: `34%`}}>自動車の大きさ</Td>
//             </HeightenedTr>
//             <HeightenedTr>
//               <Td style={{width: `22%`}}>test</Td>
//               <Td style={{width: `22%`}}>test</Td>
//               <Td style={{width: `22%`}}>test</Td>
//               <Td style={{width: `34%`}}>test</Td>
//             </HeightenedTr>

//             <HeightenedTr>
//               <Td style={{width: `22%`}}>自動車の使用の本拠の位置</Td>
//               <Td style={{width: `78%`, textAlign: `left`}}></Td>
//             </HeightenedTr>
//             <HeightenedTr>
//               <Td style={{width: `22%`}}>自動車の保管場所の位置</Td>
//               <Td style={{width: `78%`, textAlign: `left`}}>同上</Td>
//             </HeightenedTr>

//             <HeightenedTr>
//               <Td style={{width: `22%`}}>※保管場所標章番号</Td>
//               <Td style={{width: `78%`}}></Td>
//             </HeightenedTr>

//             <View>
//               <OwnerInfo />
//             </View>
//             <View>
//               <Provement />
//             </View>
//           </Table>
//         </View>
//       </Page>
//     </Document>
//   )
// }

// // Render the PDF in a link for download
// export const GarageProvementSheet = () => {
//   return (
//     <div className={`col-stack w-full p-4  `}>
//       <PDFDownloadLink document={<MyDocument />} fileName={`${`test`}.pdf`} className="t-btn">
//         DOWNLOAD
//       </PDFDownloadLink>

//       <PDFViewer className={`border-sub-main h-[800px] w-full border-2 p-2`}>
//         <MyDocument />
//       </PDFViewer>
//     </div>
//   )
// }
