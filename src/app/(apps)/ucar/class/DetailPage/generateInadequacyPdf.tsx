'use server'

export type GenerateInadequacyPdfParams = {
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

export const generateInadequacyPdf = async (params: GenerateInadequacyPdfParams): Promise<string> => {
  try {
    // API Routeを呼び出してPDF Bufferを取得
    // サーバーアクション内では、相対URLまたは絶対URLを使用可能
    const apiUrl = process.env.NEXT_PUBLIC_BASEPATH
      ? `${process.env.NEXT_PUBLIC_BASEPATH}/api/ucar/generate-inadequacy-pdf`
      : '/api/ucar/generate-inadequacy-pdf'

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`PDF生成APIエラー: ${response.status} ${response.statusText} - ${errorText}`)
    }

    // Bufferを取得
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // BufferをBase64に変換
    return buffer.toString('base64')
  } catch (error) {
    console.error('PDF生成エラー:', error)
    throw error
  }
}
