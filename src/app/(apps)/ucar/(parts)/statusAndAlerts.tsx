// 'use client'

// import {optionType} from '@cm/class/Fields/col-operator-types'
// import {UcarPaperWorkNotes} from '@prisma/generated/prisma/client'

// import {differenceInDays} from 'date-fns'

// export const getCurrentStatuses = ({UcarData}) => {
//   let result: optionType[] = [{value: `-`}]

//   const master = [
//     {value: `未受付`, color: `#c6c6c6`, isTrue: UcarData => !UcarData.arrivedAt},
//     {
//       value: `不備あり`,
//       color: `#e8882f`,
//       isTrue: UcarData => {
//         return (
//           UcarData?.UcarPaperWorkNotes?.filter((note: UcarPaperWorkNotes) => note.type === `不備` && note.resolvedAt === null)
//             .length > 0
//         )
//       },
//     },
//     // {value: `書類完`, color: `#006f80`, isTrue: UcarData => UcarData.passedAt},
//     {value: `名抹完`, color: `#00802f`, isTrue: UcarData => UcarData.meihenMasshoShoribi},
//     {
//       value: `印鑑期限`,
//       color: `#ff4920`,
//       isTrue: UcarData => {
//         const interval = differenceInDays(UcarData.inkanCertificateExpiredAt, new Date())
//         return !UcarData.passedAt && UcarData.inkanCertificateExpiredAt && interval < 30
//       },
//     },
//   ]

//   result = master ?? result

//   return result
// }
