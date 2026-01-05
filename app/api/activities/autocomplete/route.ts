/**
 * API Route: /api/activities/autocomplete
 * Returns unique people and tags for autocomplete suggestions
 */

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { AutocompleteData } from '@/types/activity';

/**
 * GET /api/activities/autocomplete
 * Returns arrays of unique people and tags from all activities
 */
export async function GET() {
  try {
    // Get unique people tags (unnest array and get distinct values)
    const peopleResult = await sql`
      SELECT DISTINCT UNNEST(people) as person
      FROM activities
      WHERE people IS NOT NULL AND array_length(people, 1) > 0
      ORDER BY person
    `;

    // Get unique general tags
    const tagsResult = await sql`
      SELECT DISTINCT UNNEST(tags) as tag
      FROM activities
      WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
      ORDER BY tag
    `;

    // Map results to string arrays
    const people = peopleResult.map((row: any) => row.person).filter(Boolean);
    const tags = tagsResult.map((row: any) => row.tag).filter(Boolean);

    const autocompleteData: AutocompleteData = {
      people,
      tags,
    };

    return NextResponse.json(autocompleteData);
  } catch (error) {
    console.error('Database error fetching autocomplete data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch autocomplete data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
