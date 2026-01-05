/**
 * API Route: /api/activities/[id]
 * Handles getting, updating, and deleting individual activities
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
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

    const [activity] = await sql`
      SELECT * FROM activities
      WHERE id = ${id}
    `;

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Database error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity', details: error instanceof Error ? error.message : 'Unknown error' },
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

    // v0.3.0 fields
    if (body.distance_km !== undefined) updateData.distance_km = body.distance_km || null;
    if (body.elevation_gain_m !== undefined) updateData.elevation_gain_m = body.elevation_gain_m || null;
    if (body.people !== undefined) updateData.people = body.people || [];
    if (body.tags !== undefined) updateData.tags = body.tags || [];
    if (body.weather_conditions !== undefined) updateData.weather_conditions = body.weather_conditions || null;
    if (body.temperature_c !== undefined) updateData.temperature_c = body.temperature_c || null;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Update in database - postgres.js handles the SET clause automatically
    const [activity] = await sql`
      UPDATE activities
      SET ${sql(updateData, ...Object.keys(updateData))}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Database error updating activity:', error);
    return NextResponse.json(
      { error: 'Failed to update activity', details: error instanceof Error ? error.message : 'Unknown error' },
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

    await sql`
      DELETE FROM activities
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Database error deleting activity:', error);
    return NextResponse.json(
      { error: 'Failed to delete activity', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
