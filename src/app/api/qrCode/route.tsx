import {NextRequest, NextResponse} from 'next/server'
import QRCode from 'qrcode'

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')

    if (!url) {
      return NextResponse.json({error: 'URL parameter is required'}, {status: 400})
    }
    const qrCodeBuffer = await QRCode.toBuffer(url)
    const response = new NextResponse(qrCodeBuffer)
    response.headers.set('Content-Type', 'image/png')
    return response
  } catch (error) {
    console.error('QRコード生成エラー:', error)
    return NextResponse.json({error: 'QRコードの生成に失敗しました'}, {status: 500})
  }
}
