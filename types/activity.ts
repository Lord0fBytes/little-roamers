/**
 * Activity TypeScript interfaces for Little Roamers v0.2.0
 *
 * Note: This is a simplified version for v0.2.0.
 * Additional fields (distance, elevation, GPS, images, etc.) will be added in v0.3.0+
 */

export interface Activity {
  id: string;
  title: string;
  notes?: string;
  duration_minutes: number;
  activity_date: string; // ISO 8601 date string
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

export interface CreateActivityInput {
  title: string;
  notes?: string;
  duration_minutes: number;
  activity_date: string;
}

export interface UpdateActivityInput {
  title?: string;
  notes?: string;
  duration_minutes?: number;
  activity_date?: string;
}
