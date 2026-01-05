/**
 * API Route: /api/activities
 * Handles listing all activities (GET) and creating new activities (POST)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { CreateActivityInput } from '@/types/activity';

/**
 * GET /api/activities
 * List all activities, sorted by activity_date descending (newest first)
 */
export async function GET() {
  try {
    const activities = await sql`
      SELECT * FROM activities
      ORDER BY activity_date DESC
    `;

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Database error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/activities
 * Create a new activity
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateActivityInput = await request.json();

    // Validate required fields
    if (!body.title || !body.duration_minutes || !body.activity_date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, duration_minutes, activity_date' },
        { status: 400 }
      );
    }

    // Validate data types
    if (typeof body.duration_minutes !== 'number' || body.duration_minutes <= 0) {
      return NextResponse.json(
        { error: 'duration_minutes must be a positive number' },
        { status: 400 }
      );
    }

    // Insert into database with v0.3.0 fields
    const [activity] = await sql`
      INSERT INTO activities (
        title,
        notes,
        duration_minutes,
        activity_date,
        distance_km,
        elevation_gain_m,
        people,
        tags,
        weather_conditions,
        temperature_c
      )
      VALUES (
        ${body.title},
        ${body.notes || null},
        ${body.duration_minutes},
        ${body.activity_date},
        ${body.distance_km || null},
        ${body.elevation_gain_m || null},
        ${body.people || []},
        ${body.tags || []},
        ${body.weather_conditions || null},
        ${body.temperature_c || null}
      )
      RETURNING *
    `;

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error('Database error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
