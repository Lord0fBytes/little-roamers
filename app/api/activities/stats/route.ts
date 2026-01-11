/**
 * API Route: /api/activities/stats
 * Handles statistics calculations for dashboard
 */

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export interface ActivityStats {
  totalActivities: number;
  totalHours: number;
  totalDistance: number;
  hoursThisYear: number;
  weeklyActivity: {
    week: string;
    count: number;
  }[];
  weatherPatterns: {
    condition: string;
    count: number;
    percentage: number;
  }[];
}

/**
 * GET /api/activities/stats
 * Get aggregated statistics for all activities
 */
export async function GET() {
  try {
    // Get total activities, hours, and distance
    const [totals] = await sql`
      SELECT
        COUNT(*)::int as total_activities,
        COALESCE(SUM(duration_minutes) / 60.0, 0)::numeric(10,1) as total_hours,
        COALESCE(SUM(distance_km), 0)::numeric(10,1) as total_distance
      FROM activities
    `;

    // Get hours this year (since January 1st of current year)
    const currentYear = new Date().getFullYear();
    const [yearTotals] = await sql`
      SELECT
        COALESCE(SUM(duration_minutes) / 60.0, 0)::numeric(10,1) as hours_this_year
      FROM activities
      WHERE EXTRACT(YEAR FROM activity_date) = ${currentYear}
    `;

    // Get weekly activity counts for last 12 weeks
    const weeklyData = await sql`
      SELECT
        DATE_TRUNC('week', activity_date)::date as week_start,
        COUNT(*)::int as count
      FROM activities
      WHERE activity_date >= CURRENT_DATE - INTERVAL '12 weeks'
      GROUP BY DATE_TRUNC('week', activity_date)
      ORDER BY week_start ASC
    `;

    // Format weekly data
    const weeklyActivity = weeklyData.map(row => ({
      week: new Date(row.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: row.count
    }));

    // Get weather patterns (only for activities that have weather_conditions)
    const weatherData = await sql`
      SELECT
        weather_conditions as condition,
        COUNT(*)::int as count
      FROM activities
      WHERE weather_conditions IS NOT NULL AND weather_conditions != ''
      GROUP BY weather_conditions
      ORDER BY count DESC
    `;

    // Calculate total activities with weather to get percentages
    const totalWithWeather = weatherData.reduce((sum, row) => sum + row.count, 0);

    const weatherPatterns = weatherData.map(row => ({
      condition: row.condition,
      count: row.count,
      percentage: totalWithWeather > 0
        ? Math.round((row.count / totalWithWeather) * 100)
        : 0
    }));

    const stats: ActivityStats = {
      totalActivities: totals.total_activities || 0,
      totalHours: Number(totals.total_hours) || 0,
      totalDistance: Number(totals.total_distance) || 0,
      hoursThisYear: Number(yearTotals.hours_this_year) || 0,
      weeklyActivity,
      weatherPatterns
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Database error calculating stats:', error);
    return NextResponse.json(
      { error: 'Failed to calculate statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
