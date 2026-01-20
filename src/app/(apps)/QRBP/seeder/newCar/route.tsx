export const dynamic = 'auto'

import {fetchAlt} from '@cm/lib/http/fetch-client'
import { basePath } from '@cm/lib/methods/common'

import {NextRequest, NextResponse} from 'next/server'

const GAS_API_KEY = `https://script.google.com/macros/s/AKfycbzshePE75BQDJnbEkYw2PDnln7Vj38oCitPeGnt-28kyn6U8v2hDCJIcNqeQWh024o/exec`

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: false,
    message: 'This endpoint is no longer available.',
  })
  const rootPath = 'QRBP'
  const dataModelName = 'newCar'
  const deleteMode = req.nextUrl.searchParams.get('delete') === 'true'
  if (deleteMode) {
    return NextResponse.json({})
  }

  async function getItems() {
    const data = await fetchAlt(GAS_API_KEY, {
      action: 'QRBP_NEW_CAR_APP_DATA',
    })
    return data
  }

  const data = await getItems()

  const dataCount = data.length
  const chunks: any[] = []
  const size = 250
  while (data.length > 0) {
    chunks.push(data.splice(0, size))
  }

  chunks.map(async (chunk, idx) => {
    const res = await fetchAlt(`${basePath}/${rootPath}/seeder/${dataModelName}/batch-update`, {
      chunkIdx: idx,
      data: chunk,
    })
  })

  return NextResponse.json({
    success: true,
    dataCount,
    message: `${size}件ごと、合計${chunks.length}回のバッチ処理で、データ更新を開始します。`,
  })
}
