/**
 * Image Upload API Route
 * POST /api/images/upload
 *
 * Accepts multipart/form-data with an image file
 * Optimizes the image and uploads to Garage S3 storage
 * Returns the image_key for database storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { optimizeImage, validateImage } from '@/lib/imageOptimizer';
import { uploadImage } from '@/lib/garage';

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate image
    const validation = await validateImage(buffer, 10); // 10MB max
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Optimize image
    console.log(`📸 Optimizing image: ${file.name} (${(buffer.length / 1024).toFixed(2)} KB)`);
    const optimized = await optimizeImage(buffer, file.type);
    console.log(
      `✅ Optimized: ${optimized.width}x${optimized.height}, ` +
      `${(optimized.size / 1024).toFixed(2)} KB (${((optimized.size / buffer.length) * 100).toFixed(1)}% of original)`
    );

    // Upload to Garage
    const imageKey = await uploadImage(
      optimized.buffer,
      optimized.contentType,
      file.name
    );

    // Return success with image_key
    return NextResponse.json({
      success: true,
      imageKey,
      metadata: {
        width: optimized.width,
        height: optimized.height,
        size: optimized.size,
        contentType: optimized.contentType,
      },
    });

  } catch (error) {
    console.error('❌ Image upload failed:', error);

    return NextResponse.json(
      {
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
