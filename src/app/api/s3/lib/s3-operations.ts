import {PutObjectCommand, DeleteObjectCommand} from '@aws-sdk/client-s3'
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'
import {GetObjectCommand} from '@aws-sdk/client-s3'
import {v4 as uuidv4} from 'uuid'
import {getS3Client, S3_BUCKET_NAME, AWS_REGION} from './s3-client'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export async function uploadFileToS3(
  buffer: Buffer,
  bucketKey: string,
  mimetype: string,
  ext: string
): Promise<UploadResult> {
  const s3 = getS3Client()
  const key = `${bucketKey}/${uuidv4()}.${ext}`

  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  }

  console.info({Bucket: params.Bucket, Key: params.Key, ContentType: params.ContentType})

  try {
    await s3.send(new PutObjectCommand(params))
    const url = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`
    console.log('画像追加 成功')
    return {success: true, url}
  } catch (error) {
    console.error('画像追加 エラー', error)
    return {success: false, error: error instanceof Error ? error.message : 'Unknown error'}
  }
}

export async function deleteFileFromS3(imageUrl: string, bucketKey: string): Promise<boolean> {
  const s3 = getS3Client()
  const key = imageUrl.split('/').pop()

  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: `${bucketKey}/${key}`,
  }

  console.info(params)

  try {
    await s3.send(new DeleteObjectCommand(params))
    console.log('画像削除 成功')
    return true
  } catch (error) {
    console.error('画像削除 エラー', error)
    return false
  }
}

export async function generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string | null> {
  const s3 = getS3Client()

  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: key,
  }

  try {
    const url = await getSignedUrl(s3, new GetObjectCommand(params), {expiresIn})
    return url
  } catch (error) {
    console.error('署名付きURL生成 エラー', error)
    return null
  }
}
