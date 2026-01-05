/**
 * Activity TypeScript interfaces for Little Roamers v0.3.0
 *
 * Enhanced with metric units, social tags, and weather data.
 * Location data (GPS, location name) will be added in v1.1.0
 */

export interface Activity {
  id: string;
  title: string;
  notes?: string;

  // Activity Metrics (Metric Units)
  duration_minutes: number;
  distance_km?: number;         // Distance in kilometers
  elevation_gain_m?: number;     // Elevation gain in meters

  // Social & Organization
  people?: string[];             // Array of @people tags (e.g., ["@sarah", "@kids"])
  tags?: string[];               // Array of general tags (e.g., ["mountain", "trail"])

  // Weather Context
  weather_conditions?: string;   // e.g., "Sunny", "Cloudy", "Rainy"
  temperature_c?: number;        // Temperature in Celsius

  // Timestamps
  activity_date: string;         // ISO 8601 date string
  created_at: string;            // ISO 8601 timestamp
  updated_at: string;            // ISO 8601 timestamp
}

export interface CreateActivityInput {
  title: string;
  notes?: string;
  duration_minutes: number;
  activity_date: string;

  // v0.3.0 optional fields
  distance_km?: number;
  elevation_gain_m?: number;
  people?: string[];
  tags?: string[];
  weather_conditions?: string;
  temperature_c?: number;
}

export interface UpdateActivityInput {
  title?: string;
  notes?: string;
  duration_minutes?: number;
  activity_date?: string;

  // v0.3.0 optional fields
  distance_km?: number;
  elevation_gain_m?: number;
  people?: string[];
  tags?: string[];
  weather_conditions?: string;
  temperature_c?: number;
}

/**
 * Autocomplete data structure
 */
export interface AutocompleteData {
  people: string[];
  tags: string[];
}
