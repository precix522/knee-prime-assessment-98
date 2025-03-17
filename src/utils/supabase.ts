
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';

// Lazy initialization pattern for Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabase = async () => {
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      throw error;
    }
  }
  return supabaseInstance;
};

// Export a default instance for convenience
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
