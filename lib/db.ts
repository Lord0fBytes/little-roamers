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
 * Type definitions for database tables
 */
export interface Activity {
  id: string;
  title: string;
  notes: string | null;
  duration_minutes: number;
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
  created_at?: string;
  updated_at?: string;
}

export interface ActivityUpdate {
  id?: string;
  title?: string;
  notes?: string | null;
  duration_minutes?: number;
  activity_date?: string;
  updated_at?: string;
}
