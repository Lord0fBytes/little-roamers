/**
 * Image Optimization Utilities
 * Uses sharp to resize and compress images before upload
 */

import sharp from 'sharp';

// Configuration
const MAX_WIDTH = 2000;
const MAX_HEIGHT = 2000;
const JPEG_QUALITY = 85;
const PNG_QUALITY = 85;
const WEBP_QUALITY = 85;

export interface OptimizedImage {
  buffer: Buffer;
  contentType: string;
  width: number;
  height: number;
  size: number;
}

/**
 * Optimize an image buffer for web upload
 * - Resizes to max 2000x2000 (preserves aspect ratio)
 * - Compresses with quality settings
 * - Strips metadata except orientation
 * - Converts HEIC/HEIF to JPEG
 *
 * @param inputBuffer - Original image buffer
 * @param originalMimeType - Original MIME type (if known)
 * @returns Optimized image with metadata
 */
export async function optimizeImage(
  inputBuffer: Buffer,
  originalMimeType?: string
): Promise<OptimizedImage> {
  try {
    // Initialize sharp instance
    let pipeline = sharp(inputBuffer);

    // Get image metadata
    const metadata = await pipeline.metadata();
    const { width = 0, height = 0, format } = metadata;

    // Determine output format
    const outputFormat = determineOutputFormat(format, originalMimeType);

    // Resize if needed (preserves aspect ratio)
    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      pipeline = pipeline.resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Apply format-specific optimization
    switch (outputFormat) {
      case 'jpeg':
        pipeline = pipeline.jpeg({
          quality: JPEG_QUALITY,
          mozjpeg: true, // Use mozjpeg for better compression
        });
        break;

      case 'png':
        pipeline = pipeline.png({
          quality: PNG_QUALITY,
          compressionLevel: 9,
        });
        break;

      case 'webp':
        pipeline = pipeline.webp({
          quality: WEBP_QUALITY,
        });
        break;

      default:
        // Default to JPEG for unknown formats
        pipeline = pipeline.jpeg({
          quality: JPEG_QUALITY,
          mozjpeg: true,
        });
    }

    // Strip metadata (except orientation) and process
    pipeline = pipeline.rotate(); // Auto-rotate based on EXIF
    const buffer = await pipeline.toBuffer({ resolveWithObject: false });

    // Get final metadata
    const finalMetadata = await sharp(buffer).metadata();

    return {
      buffer,
      contentType: getContentType(outputFormat),
      width: finalMetadata.width || 0,
      height: finalMetadata.height || 0,
      size: buffer.length,
    };
  } catch (error) {
    console.error('❌ Image optimization failed:', error);
    throw new Error(`Failed to optimize image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate image file
 * @param buffer - Image buffer
 * @param maxSizeMB - Maximum file size in MB (default: 10MB)
 * @returns Validation result with error message if invalid
 */
export async function validateImage(
  buffer: Buffer,
  maxSizeMB: number = 10
): Promise<{ valid: boolean; error?: string }> {
  // Check file size
  const sizeMB = buffer.length / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `Image too large: ${sizeMB.toFixed(2)}MB (max: ${maxSizeMB}MB)`,
    };
  }

  // Check if it's a valid image
  try {
    const metadata = await sharp(buffer).metadata();

    // Check format
    const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'heif', 'heic', 'gif'];
    if (!metadata.format || !allowedFormats.includes(metadata.format)) {
      return {
        valid: false,
        error: `Invalid image format: ${metadata.format}. Allowed: JPEG, PNG, WebP, HEIC, GIF`,
      };
    }

    // Check dimensions
    const { width = 0, height = 0 } = metadata;
    if (width < 1 || height < 1) {
      return {
        valid: false,
        error: 'Invalid image dimensions',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Not a valid image file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Helper: Determine output format based on input format
 */
function determineOutputFormat(
  format?: string,
  mimeType?: string
): 'jpeg' | 'png' | 'webp' {
  // Convert HEIC/HEIF to JPEG
  if (format === 'heif' || format === 'heic') {
    return 'jpeg';
  }

  // Preserve PNG for transparency
  if (format === 'png' || mimeType === 'image/png') {
    return 'png';
  }

  // Preserve WebP
  if (format === 'webp' || mimeType === 'image/webp') {
    return 'webp';
  }

  // Default to JPEG (most compatible and smallest)
  return 'jpeg';
}

/**
 * Helper: Get MIME type from format
 */
function getContentType(format: string): string {
  const typeMap: Record<string, string> = {
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
  };

  return typeMap[format] || 'image/jpeg';
}
