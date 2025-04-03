
import { createClient } from '@supabase/supabase-js';

// Supabase configuration with credentials
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://btfinmlyszedyeadqgvl.supabase.co';
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmlubWx5c3plZHllYWRxZ3ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MTgxMDgsImV4cCI6MjA1NzA5NDEwOH0.3jIu8RS9c7AEBCVu41Ti3aW6B0ogFoEnFWeU_PINfoM';

// Create a single Supabase client instance to avoid multiple instances warning
export const supabase = createClient(supabaseUrl, supabaseKey);
