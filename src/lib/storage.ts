import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const endpoint = process.env.MINIO_ENDPOINT!;

const s3 = new S3Client({
  endpoint,
  region: 'us-east-1', // MinIO ignores region but the SDK requires a value
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true, // Required for MinIO — prevents virtual-hosted style URLs
});

export const BUCKET_UPLOADS = process.env.MINIO_BUCKET_UPLOADS ?? 'uploads';
export const BUCKET_AVATARS = process.env.MINIO_BUCKET_AVATARS ?? 'avatars';

export async function uploadFile(
  bucket: string,
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType }));
  return `${endpoint}/${bucket}/${key}`;
}

export async function deleteFile(bucket: string, key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

/** Extracts the object key from a MinIO public URL, or returns null if not a MinIO URL. */
export function getKeyFromUrl(url: string, bucket: string): string | null {
  const prefix = `${endpoint}/${bucket}/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

export function isMinIOUrl(url: string): boolean {
  return url.startsWith(endpoint);
}
