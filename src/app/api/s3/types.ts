import {requestResultType} from '@cm/types/types'

export interface S3UploadRequest {
  bucketKey: string
  deleteImageUrl?: string
}

export interface S3UploadResponse extends requestResultType {
  result?: {
    url?: string
  }
}

export interface S3DeleteRequest {
  url: string
  bucketKey?: string
}

export interface ProcessedFile {
  buffer: Buffer
  mimetype: string
  ext: string
  originalName: string
  size: number
}
