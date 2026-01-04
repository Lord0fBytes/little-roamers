/**
 * API Route: /api/walks/[id]
 * Handles getting, updating, and deleting individual walks
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UpdateWalkInput } from '@/types/walk';

/**
 * GET /api/walks/[id]
 * Get a single walk by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('walks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Walk not found' },
          { status: 404 }
        );
      }

      console.error('Supabase error fetching walk:', error);
      return NextResponse.json(
        { error: 'Failed to fetch walk', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ walk: data });
  } catch (error) {
    console.error('Unexpected error fetching walk:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/walks/[id]
 * Update a walk by ID
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateWalkInput = await request.json();

    // Build update object (only include fields that were provided)
    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    if (body.duration_minutes !== undefined) {
      if (typeof body.duration_minutes !== 'number' || body.duration_minutes <= 0) {
        return NextResponse.json(
          { error: 'duration_minutes must be a positive number' },
          { status: 400 }
        );
      }
      updateData.duration_minutes = body.duration_minutes;
    }
    if (body.walk_date !== undefined) updateData.walk_date = body.walk_date;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Update in database
    const { data, error } = await supabase
      .from('walks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Walk not found' },
          { status: 404 }
        );
      }

      console.error('Supabase error updating walk:', error);
      return NextResponse.json(
        { error: 'Failed to update walk', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ walk: data });
  } catch (error) {
    console.error('Unexpected error updating walk:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/walks/[id]
 * Delete a walk by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('walks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting walk:', error);
      return NextResponse.json(
        { error: 'Failed to delete walk', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error deleting walk:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
