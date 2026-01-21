import {S3Client} from '@aws-sdk/client-s3'

let s3Client: S3Client | null = null

// クライアントをリセット（認証情報変更時に使用）
export const resetS3Client = () => {
  s3Client = null
}

export const getS3Client = (): S3Client => {
  if (!s3Client) {
    const region = process.env.AWS_REGION?.trim()
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim()
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim()


    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials are not properly configured')
    }

    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  }

  return s3Client
}

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME?.trim() ?? ''
export const AWS_REGION = process.env.AWS_REGION?.trim() ?? ''
