/**
 * Garage S3 Storage Client
 * Utilities for uploading, deleting, and managing images in Garage S3-compatible storage
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

// Lazy initialization - only create S3 client when actually needed (server-side only)
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (s3Client) return s3Client;

  // Validate environment variables
  if (!process.env.GARAGE_ENDPOINT) {
    throw new Error('GARAGE_ENDPOINT is not defined in environment variables');
  }
  if (!process.env.GARAGE_ACCESS_KEY_ID) {
    throw new Error('GARAGE_ACCESS_KEY_ID is not defined in environment variables');
  }
  if (!process.env.GARAGE_SECRET_ACCESS_KEY) {
    throw new Error('GARAGE_SECRET_ACCESS_KEY is not defined in environment variables');
  }
  if (!process.env.GARAGE_BUCKET) {
    throw new Error('GARAGE_BUCKET is not defined in environment variables');
  }

  // Initialize S3 client for Garage
  s3Client = new S3Client({
    endpoint: process.env.GARAGE_ENDPOINT,
    region: process.env.GARAGE_REGION || 'garage',
    credentials: {
      accessKeyId: process.env.GARAGE_ACCESS_KEY_ID,
      secretAccessKey: process.env.GARAGE_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true, // Required for S3-compatible services
  });

  return s3Client;
}

function getBucketName(): string {
  if (!process.env.GARAGE_BUCKET) {
    throw new Error('GARAGE_BUCKET is not defined in environment variables');
  }
  return process.env.GARAGE_BUCKET;
}

/**
 * Upload an image buffer to Garage S3 storage
 * @param buffer - Image buffer (optimized by sharp)
 * @param contentType - MIME type (e.g., 'image/jpeg', 'image/png')
 * @param originalFilename - Original filename for extension detection
 * @returns Image key (e.g., 'walks/abc123-def456.jpg')
 */
export async function uploadImage(
  buffer: Buffer,
  contentType: string,
  originalFilename?: string
): Promise<string> {
  try {
    // Generate unique filename
    const uuid = randomUUID();
    const extension = getExtensionFromContentType(contentType) || getExtensionFromFilename(originalFilename);
    const imageKey = `walks/${uuid}.${extension}`;

    // Upload to Garage
    const command = new PutObjectCommand({
      Bucket: getBucketName(),
      Key: imageKey,
      Body: buffer,
      ContentType: contentType,
    });

    await getS3Client().send(command);

    console.log(`✅ Uploaded image: ${imageKey}`);
    return imageKey;
  } catch (error) {
    console.error('❌ Failed to upload image to Garage:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete an image from Garage S3 storage
 * @param imageKey - Image key (e.g., 'walks/abc123.jpg')
 * @returns true if deleted successfully
 */
export async function deleteImage(imageKey: string): Promise<boolean> {
  if (!imageKey) {
    console.warn('⚠️ Attempted to delete image with empty key');
    return false;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: imageKey,
    });

    await getS3Client().send(command);

    console.log(`✅ Deleted image: ${imageKey}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete image ${imageKey}:`, error);
    // Don't throw - deletion failures shouldn't block operations
    return false;
  }
}

/**
 * Check if an image exists in Garage S3 storage
 * @param imageKey - Image key to check
 * @returns true if image exists
 */
export async function imageExists(imageKey: string): Promise<boolean> {
  if (!imageKey) return false;

  try {
    const command = new HeadObjectCommand({
      Bucket: getBucketName(),
      Key: imageKey,
    });

    await getS3Client().send(command);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get public URL for an image
 * This function is safe for client-side use
 * Returns a Next.js API route that proxies the image from Garage
 *
 * @param imageKey - Image key (e.g., 'walks/abc123.jpg')
 * @returns Full URL to access the image through Next.js proxy
 */
export function getImageUrl(imageKey: string | null | undefined): string | null {
  if (!imageKey) return null;

  // Return Next.js API route that proxies the image
  // This works around Garage's lack of anonymous access support
  return `/api/images/${imageKey}`;
}

/**
 * Helper: Get file extension from MIME type
 */
function getExtensionFromContentType(contentType: string): string {
  const typeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };

  return typeMap[contentType.toLowerCase()] || 'jpg';
}

/**
 * Helper: Get file extension from filename
 */
function getExtensionFromFilename(filename?: string): string {
  if (!filename) return 'jpg';

  const extension = filename.split('.').pop()?.toLowerCase();
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

  return extension && validExtensions.includes(extension) ? extension : 'jpg';
}
