/**
 * PostgreSQL database client for Little Roamers
 *
 * This uses postgres.js for direct PostgreSQL connections.
 * Works with local PostgreSQL servers or containerized instances.
 */

import postgres from 'postgres';

// Environment variables check
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'Missing DATABASE_URL environment variable. Please check your .env.local file.\n' +
    'Required: DATABASE_URL (PostgreSQL connection string)'
  );
}

/**
 * PostgreSQL client using postgres.js
 *
 * Connection string format:
 * postgresql://username:password@host:port/database
 *
 * Example:
 * postgresql://postgres:password@localhost:5432/little_roamers
 */
export const sql = postgres(connectionString, {
  // Connection pool settings
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
});

/**
 * Type definitions for database tables (v0.4.0)
 */
export interface Activity {
  id: string;
  title: string;
  notes: string | null;

  // Activity Metrics (Metric Units)
  duration_minutes: number;
  distance_km: number | null;
  elevation_gain_m: number | null;

  // Social & Organization
  people: string[];
  tags: string[];

  // Weather Context
  weather_conditions: string | null;
  temperature_c: number | null;

  // Media (v0.4.0+)
  image_key: string | null;

  // Timestamps
  activity_date: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityInsert {
  id?: string;
  title: string;
  notes?: string | null;
  duration_minutes: number;
  activity_date: string;

  // v0.3.0 optional fields
  distance_km?: number | null;
  elevation_gain_m?: number | null;
  people?: string[];
  tags?: string[];
  weather_conditions?: string | null;
  temperature_c?: number | null;

  // v0.4.0 optional fields
  image_key?: string | null;

  created_at?: string;
  updated_at?: string;
}

export interface ActivityUpdate {
  id?: string;
  title?: string;
  notes?: string | null;
  duration_minutes?: number;
  activity_date?: string;

  // v0.3.0 optional fields
  distance_km?: number | null;
  elevation_gain_m?: number | null;
  people?: string[];
  tags?: string[];
  weather_conditions?: string | null;
  temperature_c?: number | null;

  // v0.4.0 optional fields
  image_key?: string | null;

  updated_at?: string;
}
