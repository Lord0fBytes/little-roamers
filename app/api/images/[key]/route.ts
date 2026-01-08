/**
 * Image Delete API Route
 * DELETE /api/images/[key]
 *
 * Deletes an image from Garage S3 storage by its key
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteImage } from '@/lib/garage';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;

    if (!key) {
      return NextResponse.json(
        { error: 'Image key is required' },
        { status: 400 }
      );
    }

    // Delete from Garage
    const success = await deleteImage(key);

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Image ${key} deleted successfully`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete image',
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Image deletion failed:', error);

    return NextResponse.json(
      {
        error: 'Failed to delete image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
