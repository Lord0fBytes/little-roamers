/**
 * Walk TypeScript interfaces for Little Roamers v0.1.0
 *
 * Note: This is a simplified version for v0.1.0.
 * Additional fields (distance, elevation, GPS, images, etc.) will be added in v0.3.0+
 */

export interface Walk {
  id: string;
  title: string;
  notes?: string;
  duration_minutes: number;
  walk_date: string; // ISO 8601 date string
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

export interface CreateWalkInput {
  title: string;
  notes?: string;
  duration_minutes: number;
  walk_date: string;
}

export interface UpdateWalkInput {
  title?: string;
  notes?: string;
  duration_minutes?: number;
  walk_date?: string;
}
