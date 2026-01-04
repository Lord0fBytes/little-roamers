/**
 * API Route: /api/walks
 * Handles listing all walks (GET) and creating new walks (POST)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CreateWalkInput } from '@/types/walk';

/**
 * GET /api/walks
 * List all walks, sorted by walk_date descending (newest first)
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('walks')
      .select('*')
      .order('walk_date', { ascending: false });

    if (error) {
      console.error('Supabase error fetching walks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch walks', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ walks: data || [] });
  } catch (error) {
    console.error('Unexpected error fetching walks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/walks
 * Create a new walk
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateWalkInput = await request.json();

    // Validate required fields
    if (!body.title || !body.duration_minutes || !body.walk_date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, duration_minutes, walk_date' },
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
      .from('walks')
      .insert({
        title: body.title,
        notes: body.notes || null,
        duration_minutes: body.duration_minutes,
        walk_date: body.walk_date,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating walk:', error);
      return NextResponse.json(
        { error: 'Failed to create walk', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ walk: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating walk:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
