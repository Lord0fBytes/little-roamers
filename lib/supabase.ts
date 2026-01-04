/**
 * Supabase client utilities for Little Roamers
 *
 * This file provides both browser and server-side Supabase clients.
 * The browser client is used in Client Components and API routes.
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables check
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.\n' +
    'Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

/**
 * Browser/Client-side Supabase client
 * Use this in Client Components and API routes
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // No authentication for Little Roamers
  },
});

/**
 * Type definitions for database tables
 */
export interface Database {
  public: {
    Tables: {
      activities: {
        Row: {
          id: string;
          title: string;
          notes: string | null;
          duration_minutes: number;
          activity_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          notes?: string | null;
          duration_minutes: number;
          activity_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          notes?: string | null;
          duration_minutes?: number;
          activity_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
