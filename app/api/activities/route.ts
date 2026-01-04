/**
 * API Route: /api/activities
 * Handles listing all activities (GET) and creating new activities (POST)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CreateActivityInput } from '@/types/activity';

/**
 * GET /api/activities
 * List all activities, sorted by activity_date descending (newest first)
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('activity_date', { ascending: false });

    if (error) {
      console.error('Supabase error fetching activities:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activities', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ activities: data || [] });
  } catch (error) {
    console.error('Unexpected error fetching activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    // Insert into database
    const { data, error } = await supabase
      .from('activities')
      .insert({
        title: body.title,
        notes: body.notes || null,
        duration_minutes: body.duration_minutes,
        activity_date: body.activity_date,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating activity:', error);
      return NextResponse.json(
        { error: 'Failed to create activity', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ activity: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
