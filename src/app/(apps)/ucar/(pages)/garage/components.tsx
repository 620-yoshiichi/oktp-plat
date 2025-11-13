export {}

// /* eslint-disable no-irregular-whitespace */
// import {ColStack, RowStack} from '@cm/lib/react-pdf'
// import {Text, View} from '@react-pdf/renderer'

// export const SignBlock = ({children}) => {
//   return <View style={{width: 65, height: 65, border: 1, textAlign: `center`}}>{children}</View>
// }

// export const Signs = () => {
//   return (
//     <RowStack>
//       <SignBlock>
//         <Text>署長</Text>
//         <View style={{borderTop: `1px solid gray`}}></View>
//       </SignBlock>
//       <SignBlock>
//         <Text>副署長</Text>
//         <View style={{borderTop: `1px solid gray`}}></View>
//       </SignBlock>
//       <SignBlock>
//         <Text>官</Text>
//         <View style={{borderTop: `1px solid gray`}}></View>
//       </SignBlock>
//       <SignBlock>
//         <Text>課長</Text>
//         <View style={{borderTop: `1px solid gray`}}></View>
//       </SignBlock>
//       <SignBlock>
//         <Text>課</Text>
//         <View style={{borderTop: `1px solid gray`}}></View>
//       </SignBlock>
//     </RowStack>
//   )
// }

// export const OwnerInfo = () => {
//   return (
//     <View>
//       <ColStack style={{width: `100%`, gap: 10}}>
//         <Text style={{textAlign: `center`}}>
//           自動車の保管場所の位置欄記載の場所は、申請に係る自動車の保管場所として確保されていることを証明願います。
//         </Text>
//         <Text style={{textAlign: `right`}}>
//           <Text>年月日</Text>
//         </Text>
//         <RowStack>
//           <Text style={{width: `60%`, paddingLeft: 50}}>岡山南 警察署長 殿</Text>
//           <Text style={{width: ``}}>〒</Text>
//         </RowStack>
//         <RowStack>
//           <View style={{width: 350}}>
//             <Signs />
//           </View>

//           <View style={{marginLeft: 50, width: 300}}>
//             <RowStack>
//               <Text style={{marginLeft: 50}}>住所</Text>
//             </RowStack>
//             <RowStack>
//               <Text>申請者</Text>
//               <Text style={{marginLeft: `auto`}}>（086）897 局 1004 番</Text>
//             </RowStack>

//             <RowStack style={{alignItems: `center`}}>
//               <ColStack style={{marginLeft: 50}}>
//                 <Text style={{fontSize: 8}}>フリガナ</Text>
//                 <Text>氏名</Text>
//               </ColStack>
//               <ColStack
//                 style={{
//                   marginLeft: 20,
//                   alignItems: 'flex-start',
//                 }}
//               >
//                 <Text>岡山トヨペット株式会社</Text>
//                 <Text>代表取締役 末長 一範</Text>
//               </ColStack>
//             </RowStack>
//           </View>
//         </RowStack>
//       </ColStack>
//     </View>
//   )
// }

// export const H1 = props => {
//   const {style, children, ...restProps} = props

//   return (
//     <Text
//       {...restProps}
//       style={{
//         fontWeight: 900,
//         fontSize: 18,
//         fontFamily: `Nasu-Bold`,
//         ...style,
//       }}
//     >
//       自動車保管場所証明書
//     </Text>
//   )
// }

// export const Provement = () => {
//   return (
//     <ColStack style={{gap: 5, padding: `0 30px`}}>
//       <RowStack style={{justifyContent: `center`}}>
//         <Text style={{width: `15%`}}>{`第              号`}</Text>
//         <H1
//           style={{
//             width: `70%`,
//             textAlign: `center`,
//             margin: `auto`,
//           }}
//         >
//           自動車保管場所証明書
//         </H1>
//       </RowStack>
//       <RowStack>
//         <Text>自動車の保管場所の位置欄記載の場所は、上記申請に係る自動車の保管場所として確保されていることを証明する。</Text>
//       </RowStack>
//       <RowStack>
//         <Text>年 月 日 </Text>
//       </RowStack>
//       <RowStack>
//         <Text>警察署長 印</Text>
//       </RowStack>
//     </ColStack>
//   )
// }
// // 備考 １
// //               自動車の使用の本拠の位置が、旧自動車（申請者が保有者である自動車であって申請に係るもの以外のものをいう。以下同じ。）に係る使用の本拠の位置と同一であり、かつ、申請に係る場所が旧自動車の保
// //              管場所とされているときは、保管場所標章番号欄に旧自動車に表示されている保管場所標章に係る保管場所標章番号を記載して、所在図の添付を省略することができる。ただし、警察署長は、保管場所の付近
// //              の目標となる地物及びその位置を知るため特に必要があると認めるときは、所在図の提出を求めることができる。
// //               ２用紙の大きさは、日本産業規格Ａ列４番とする。

// export const Remarks = () => {
//   return (
//     <View style={{padding: 20}}>
//       <RowStack style={{flexWrap: `nowrap`, fontSize: 7, color: `gray`}}>
//         <Text style={{width: `5%`}}>{`備考`}</Text>
//         <ColStack>
//           <Text style={{}}>
//             1.自動車の使用の本拠の位置が、旧自動車（申請者が保有者である自動車であって申請に係るもの以外のものをいう。以下同じ。）に係る使用の本拠の位置と同一であり、かつ、申請に係る場所が旧自動車の保管場所とされているときは、保管場所標章番号欄に旧自動車に表示されている保管場所標章に係る保管場所標章番号を記載して、所在図の添付を省略することができる。ただし、警察署長は、保管場所の付近の目標となる地物及びその位置を知るため特に必要があると認めるときは、所在図の提出を求めることができる。
//           </Text>
//           <Text style={{width: `90%`}}>２.用紙の大きさは、日本産業規格Ａ列４番とする。</Text>
//         </ColStack>
//       </RowStack>
//     </View>
//   )
// }
