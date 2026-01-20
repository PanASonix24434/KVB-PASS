import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check for missing environment variables
const missingEnvVars: string[] = [];
if (!supabaseUrl) missingEnvVars.push('VITE_SUPABASE_URL');
if (!supabaseAnonKey) missingEnvVars.push('VITE_SUPABASE_ANON_KEY');

// Create a dummy client if env vars are missing to prevent app crash
// This allows the app to at least show an error message
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Export error info for error handling
export const hasSupabaseConfig = !!supabaseUrl && !!supabaseAnonKey;
export const missingSupabaseVars = missingEnvVars;
