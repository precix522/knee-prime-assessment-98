
import { createClient } from '@supabase/supabase-js';

// Supabase configuration with credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rsfcyjriyawmudyzfygl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZmN5anJpeWF3bXVkeXpmeWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MDkxODMsImV4cCI6MjA2MDE4NTE4M30.FJTVmUCta_Yl0nrq6SuDiKBZy1JCdNHrXn4kf4jZL3Q';

// Create a single Supabase client instance to avoid multiple instances warning
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
