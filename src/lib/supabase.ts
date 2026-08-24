import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.warn(
    '[CaVe] Supabase URL not configured. Please update your .env file.\n' +
    'Running with mock data.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
