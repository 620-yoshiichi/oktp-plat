import {hashPassword} from 'src/cm/lib/crypt'

import {NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'

export const POST = async () => {
  let result = {}

  const allUsers = await prisma.user.findMany()

  result = await Promise.all(
    allUsers.map(async user => {
      const hashedPw = await hashPassword(user.password)

      return await prisma.user.update({
        where: {id: user.id},
        data: {password: hashedPw},
      })
    })
  )
  return NextResponse.json({result})
}
