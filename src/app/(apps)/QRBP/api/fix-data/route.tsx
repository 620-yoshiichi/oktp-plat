import {NextResponse} from 'next/server'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Prisma} from '@prisma/client'

export const POST = async () => {
  const args: Prisma.CarDeleteManyArgs = {
    where: {
      CrUser: null,
      representativeCarBpNumber: null,
      createdAt: {
        gte: new Date(`2024-10-15T11:17:45.416Z`),
      },
      Process: {
        none: {},
      },
    },
  }
  const {result: deleteTarget} = await doStandardPrisma(`car`, `deleteMany`, args)

  return NextResponse.json({deleteTarget})
}

// const {errorProcesses: fixBpDefaultValues} = await (async () => {
//   const errorProcesses = await prisma.process.findMany({
//     where: {
//       type: {
//         contains: 'éå¸¸',
//       },
//     },
//   })

//   errorProcesses.forEach(async p => {
//     await prisma.process.update({
//       where: {id: p.id},
//       data: {type: '通常'},
//     })
//   })
//   return {errorProcesses}
// })()
// const {errorCustomers: fixedRentaCustomerData} = await (async () => {
//   const errorCustomers = await prisma.rentaCustomer.findMany({
//     where: {
//       type: 'æ°è¦',
//     },
//   })

//   errorCustomers.forEach(async p => {
//     await prisma.rentaCustomer.update({
//       where: {id: p.id},
//       data: {type: '新規'},
//     })
//   })
//   return {errorCustomers}
// })()
