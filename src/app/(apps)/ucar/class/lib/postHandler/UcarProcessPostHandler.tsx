// import {requestDeliberySS} from '@app/(apps)/ucar/class/lib/postHandler/ requestDeliberySS'
// import {postHandlerProps} from '@app/(apps)/ucar/class/UcarCL'
// import {OKTP_CONSTANTS} from '@app/oktpCommon/constants'

// import { formatDate } from '@cm/class/Days/date-utils/formatters'
// import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
// import {knockEmailApi} from '@cm/lib/methods/knockEmailApi'

// export const UcarProcessPostHandler = () => {
//   type methodsType = {confirmMsg: string; method: (props: postHandlerProps) => Promise<void>}

//   const methods: {
//     [key in string]: methodsType
//   } = {
//     配送手配: {
//       confirmMsg: 'CRへ配送手配が実施されます。',
//       method: async (props: postHandlerProps) => {
//         const res = await requestDeliberySS({type: `配送手配`, ucar: props.ucar})
//       },
//     },
//     配送停止: {
//       confirmMsg: 'CRへ配送キャンセルが実施されます。',
//       method: async (props: postHandlerProps) => {
//         const res = await requestDeliberySS({type: `配送停止`, ucar: props.ucar})
//       },
//     },
//     現地処理: {
//       confirmMsg: '現地処理書式をCRにて発行します',
//       method: async (props: postHandlerProps) => {
//         console.info(`現地処理連現地処理書式をCRにて発行します（未実装）`)
//       },
//     },
//   }

//   return methods
// }
