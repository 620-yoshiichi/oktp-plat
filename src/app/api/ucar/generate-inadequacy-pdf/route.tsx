import {NextRequest, NextResponse} from 'next/server'
import {PDFDocument, rgb} from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import fs from 'fs'
import path from 'path'

const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      storeManagerName,
      staffName,
      sateiID,
      carName,
      customerName,
      inkanCertificateExpiredAt,
      returnDate,
      inadequacyType,
      hqReceptionistName,
      content,
    } = body

    // PDFドキュメントを作成
    const pdfDoc = await PDFDocument.create()
    // fontkitを登録（カスタムフォントを使用するために必要）
    pdfDoc.registerFontkit(fontkit)
    const page = pdfDoc.addPage([595, 842]) // A4サイズ (ポイント単位)
    const {width, height} = page.getSize()

    // 日本語フォントを読み込む（必須）
    const regularFontPath = path.join(process.cwd(), 'public', 'fonts', 'Nasu-Regular.ttf')
    const boldFontPath = path.join(process.cwd(), 'public', 'fonts', 'Nasu-Bold.ttf')

    if (!fs.existsSync(regularFontPath)) {
      throw new Error(`日本語フォント（Regular）が見つかりません: ${regularFontPath}`)
    }
    if (!fs.existsSync(boldFontPath)) {
      throw new Error(`日本語フォント（Bold）が見つかりません: ${boldFontPath}`)
    }

    const regularFontBytes = fs.readFileSync(regularFontPath)
    const boldFontBytes = fs.readFileSync(boldFontPath)

    // カスタムフォントを埋め込む（subsetオプションでサブセット化）
    const japaneseFont = await pdfDoc.embedFont(regularFontBytes, {subset: true})
    const japaneseBoldFont = await pdfDoc.embedFont(boldFontBytes, {subset: true})

    // タイトル
    page.drawText('不備返送票', {
      x: width / 2,
      y: height - 60,
      size: 18,
      font: japaneseBoldFont,
      color: rgb(0, 0, 0),
    })

    // 左側セクション
    const leftX = 50
    const rightX = width / 2 + 20
    let currentY = height - 120

    const labelSize = 9
    const valueSize = 10
    const lineHeight = 20

    // 店長
    page.drawText('店長', {
      x: leftX,
      y: currentY,
      size: labelSize,
      font: japaneseBoldFont,
      color: rgb(0, 0, 0),
    })
    page.drawText(storeManagerName || '', {
      x: leftX + 5,
      y: currentY - 15,
      size: valueSize,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    })
    currentY -= lineHeight * 2

    // スタッフ
    page.drawText('スタッフ', {
      x: leftX,
      y: currentY,
      size: labelSize,
      font: japaneseBoldFont,
      color: rgb(0, 0, 0),
    })
    page.drawText(staffName || '', {
      x: leftX + 5,
      y: currentY - 15,
      size: valueSize,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    })
    currentY -= lineHeight * 2

    // 査定番号
    page.drawText('査定番号', {
      x: leftX,
      y: currentY,
      size: labelSize,
      font: japaneseBoldFont,
      color: rgb(0, 0, 0),
    })
    page.drawText(sateiID || '', {
      x: leftX + 5,
      y: currentY - 15,
      size: valueSize,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    })
    currentY -= lineHeight * 2

    // 車名
    page.drawText('車名', {
      x: leftX,
      y: currentY,
      size: labelSize,
      font: japaneseBoldFont,
      color: rgb(0, 0, 0),
    })
    page.drawText(carName || '', {
      x: leftX + 5,
      y: currentY - 15,
      size: valueSize,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    })
    currentY -= lineHeight * 2

    // お客様名
    page.drawText('お客様名', {
      x: leftX,
      y: currentY,
      size: labelSize,
      font: japaneseBoldFont,
      color: rgb(0, 0, 0),
    })
    page.drawText(customerName || '', {
      x: leftX + 5,
      y: currentY - 15,
      size: valueSize,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    })
    currentY -= lineHeight * 2

    // 印鑑証明期限
    page.drawText('印鑑証明期限', {
      x: leftX,
      y: currentY,
      size: labelSize,
      font: japaneseBoldFont,
      color: rgb(0, 0, 0),
    })
    page.drawText(formatDate(inkanCertificateExpiredAt), {
      x: leftX + 5,
      y: currentY - 15,
      size: valueSize,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    })

    // 右側セクション
    currentY = height - 120

    // 不備返却日
    page.drawText('不備返却日', {
      x: rightX,
      y: currentY,
      size: labelSize,
      font: japaneseBoldFont,
      color: rgb(0, 0, 0),
    })
    page.drawText(formatDate(returnDate), {
      x: rightX + 5,
      y: currentY - 15,
      size: valueSize,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    })
    currentY -= lineHeight * 2

    // 不備区分
    page.drawText('不備区分', {
      x: rightX,
      y: currentY,
      size: labelSize,
      font: japaneseBoldFont,
      color: rgb(0, 0, 0),
    })
    page.drawText(inadequacyType || '', {
      x: rightX + 5,
      y: currentY - 15,
      size: valueSize,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    })
    currentY -= lineHeight * 2

    // 本部受付者
    page.drawText('本部受付者', {
      x: rightX,
      y: currentY,
      size: labelSize,
      font: japaneseBoldFont,
      color: rgb(0, 0, 0),
    })
    page.drawText(hqReceptionistName || '', {
      x: rightX + 5,
      y: currentY - 15,
      size: valueSize,
      font: japaneseFont,
      color: rgb(0, 0, 0),
    })

    // 不備内容ボックス
    const contentBoxY = height - 450
    const contentBoxHeight = 150
    const contentBoxWidth = width - 100

    // ボーダーを描画
    page.drawRectangle({
      x: 50,
      y: contentBoxY,
      width: contentBoxWidth,
      height: contentBoxHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    })

    // 不備内容を描画（複数行対応）
    const contentLines = (content || '').split('\n')
    let contentY = contentBoxY + contentBoxHeight - 20
    for (const line of contentLines) {
      if (contentY < contentBoxY + 10) break
      page.drawText(line, {
        x: 60,
        y: contentY,
        size: valueSize,
        font: japaneseFont,
        color: rgb(0, 0, 0),
        maxWidth: contentBoxWidth - 20,
      })
      contentY -= lineHeight
    }

    // PDFをバイト配列に変換
    const pdfBytes = await pdfDoc.save()

    // BufferをNextResponseで返す
    const response = new NextResponse(Buffer.from(pdfBytes))
    response.headers.set('Content-Type', 'application/pdf')
    response.headers.set('Content-Disposition', `attachment; filename="不備返送票_${sateiID || 'unknown'}.pdf"`)

    return response
  } catch (error) {
    console.error('PDF生成エラー:', error)
    return NextResponse.json({error: 'PDFの生成に失敗しました'}, {status: 500})
  }
}
