import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[gigg-admin] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set in .env. ' +
      'Copy .env.example to .env and fill in your Supabase credentials.'
  );
}

/**
 * Supabase client for the frontend — uses anon key (subject to RLS).
 * Used only for auth. All data fetching goes through the Express backend.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
