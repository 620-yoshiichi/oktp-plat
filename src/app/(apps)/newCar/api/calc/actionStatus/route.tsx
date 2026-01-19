



import { NextRequest, NextResponse } from 'next/server'

export const POST = async (req: NextRequest) => {
  console.warn('orderUpsert route is not used')
  return NextResponse.json({ success: true, message: `Unauthorized`, result: null }, { status: 401, statusText: `Unauthorized` })
  return NextResponse.json({ message: `this api is not implemented` })
}
