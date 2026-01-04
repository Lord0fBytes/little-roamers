/**
 * API Route: /api/activities/[id]
 * Handles getting, updating, and deleting individual activities
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UpdateActivityInput } from '@/types/activity';

/**
 * GET /api/activities/[id]
 * Get a single activity by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Activity not found' },
          { status: 404 }
        );
      }

      console.error('Supabase error fetching activity:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activity', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ activity: data });
  } catch (error) {
    console.error('Unexpected error fetching activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/activities/[id]
 * Update an activity by ID
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateActivityInput = await request.json();

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
    if (body.activity_date !== undefined) updateData.activity_date = body.activity_date;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Update in database
    const { data, error } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Activity not found' },
          { status: 404 }
        );
      }

      console.error('Supabase error updating activity:', error);
      return NextResponse.json(
        { error: 'Failed to update activity', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ activity: data });
  } catch (error) {
    console.error('Unexpected error updating activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/activities/[id]
 * Delete an activity by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting activity:', error);
      return NextResponse.json(
        { error: 'Failed to delete activity', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error deleting activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
