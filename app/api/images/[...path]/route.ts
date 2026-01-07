/**
 * Image Proxy API Route
 * GET /api/images/[...path]
 *
 * Proxies images from Garage S3 storage (which doesn't support anonymous access)
 * This route fetches images server-side with credentials and serves them publicly
 */

import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';

// Initialize S3 client for Garage (server-side only)
const s3Client = new S3Client({
  endpoint: process.env.GARAGE_ENDPOINT!,
  region: process.env.GARAGE_REGION || 'garage',
  credentials: {
    accessKeyId: process.env.GARAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.GARAGE_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const imageKey = path.join('/');

    if (!imageKey) {
      return NextResponse.json(
        { error: 'Image path is required' },
        { status: 400 }
      );
    }

    // Fetch image from Garage using S3 credentials
    const command = new GetObjectCommand({
      Bucket: process.env.GARAGE_BUCKET!,
      Key: imageKey,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Return image with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': response.ContentType || 'image/jpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    });

  } catch (error: any) {
    console.error('❌ Failed to fetch image from Garage:', error);

    // Handle specific S3 errors
    if (error.name === 'NoSuchKey') {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch image', details: error.message },
      { status: 500 }
    );
  }
}
