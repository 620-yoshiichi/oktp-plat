import { NextRequest, NextResponse } from 'next/server'
import { fileTypeFromBuffer } from 'file-type'
import { isRouteAccessAllowed } from '@app/api/prisma/isAllowed'
import { uploadFileToS3, deleteFileFromS3, generatePresignedUrl } from './lib/s3-operations'
import { S3UploadResponse } from './types'

/**
 * POST: ファイルアップロード
 */
export async function POST(req: NextRequest) {
  let result: S3UploadResponse = {
    success: false,
    message: '画像を更新できませんでした',
    result: {},
  }

  try {
    // アクセス制御
    const isAllowed = await isRouteAccessAllowed(req)
    console.log('[S3 API POST] Access check:', {
      isAllowed,
      host: req.headers.get('host'),
      forwardedHost: req.headers.get('x-forwarded-host'),
    })

    if (!isAllowed) {
      return NextResponse.json({ success: false, message: 'アクセス権限がありません' }, { status: 403 })
    }

    // FormData解析
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const bucketKey = formData.get('bucketKey') as string
    const deleteImageUrl = formData.get('deleteImageUrl') as string | null

    // バリデーション
    if (!bucketKey) {
      return NextResponse.json({ success: false, message: 'bucketKey is required' }, { status: 400 })
    }

    let uploadedUrl: string | undefined

    // ファイルアップロード
    if (file) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // file-typeでMIMEタイプを確認
      const fileType = await fileTypeFromBuffer(buffer)
      const mimetype = fileType?.mime || file.type
      const ext = fileType?.ext || file.name.split('.').pop() || ''



      const uploadResult = await uploadFileToS3(buffer, bucketKey, mimetype, ext)

      if (!uploadResult.success) {
        return NextResponse.json(
          { success: false, message: 'ファイルのアップロードに失敗しました', error: uploadResult.error },
          { status: 500 }
        )
      }

      uploadedUrl = uploadResult.url
    }

    // 古い画像の削除
    if (deleteImageUrl) {
      await deleteFileFromS3(deleteImageUrl, bucketKey)
    }

    result = {
      success: true,
      message: '画像を更新しました',
      result: {
        url: uploadedUrl,
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('S3 API Error:', error)
    result.error = error
    return NextResponse.json(result, { status: 500 })
  }
}

/**
 * DELETE: ファイル削除
 */
export async function DELETE(req: NextRequest) {
  try {
    // アクセス制御
    if (!(await isRouteAccessAllowed(req))) {
      return NextResponse.json({ success: false, message: 'アクセス権限がありません' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')
    const bucketKey = searchParams.get('bucketKey')

    if (!url) {
      return NextResponse.json({ success: false, message: 'url is required' }, { status: 400 })
    }

    if (!bucketKey) {
      return NextResponse.json({ success: false, message: 'bucketKey is required' }, { status: 400 })
    }

    const deleted = await deleteFileFromS3(url, bucketKey)

    if (deleted) {
      return NextResponse.json({ success: true, message: '画像を削除しました' })
    } else {
      return NextResponse.json({ success: false, message: '画像の削除に失敗しました' }, { status: 500 })
    }
  } catch (error) {
    console.error('S3 DELETE Error:', error)
    return NextResponse.json({ success: false, message: '画像の削除に失敗しました', error }, { status: 500 })
  }
}

/**
 * GET: 署名付きURL生成
 */
export async function GET(req: NextRequest) {
  try {
    // アクセス制御
    if (!(await isRouteAccessAllowed(req))) {
      return NextResponse.json({ success: false, message: 'アクセス権限がありません' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600', 10)

    if (!key) {
      return NextResponse.json({ success: false, message: 'key is required' }, { status: 400 })
    }

    const signedUrl = await generatePresignedUrl(key, expiresIn)

    if (signedUrl) {
      return NextResponse.json({ success: true, url: signedUrl })
    } else {
      return NextResponse.json({ success: false, message: '署名付きURLの生成に失敗しました' }, { status: 500 })
    }
  } catch (error) {
    console.error('S3 GET Error:', error)
    return NextResponse.json({ success: false, message: '署名付きURLの生成に失敗しました', error }, { status: 500 })
  }
}
