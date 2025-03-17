
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

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

// Function to fetch patient report PDF by patient ID
export const getPatientReport = async (patientId: string) => {
  try {
    const supabaseClient = await getSupabase();
    
    // Fetch the file path from a table that maps patient IDs to report files
    // Assuming you have a 'patient_reports' table with patientId and reportPath columns
    const { data: reportData, error: reportError } = await supabaseClient
      .from('patient_reports')
      .select('report_path')
      .eq('patient_id', patientId)
      .single();
    
    if (reportError) throw reportError;
    if (!reportData) throw new Error('No report found for this patient ID');
    
    // Now get the actual file from storage
    const { data: fileData, error: fileError } = await supabaseClient
      .storage
      .from('reports') // Your bucket name
      .download(reportData.report_path);
    
    if (fileError) throw fileError;
    
    // Convert the blob to a URL that can be used in an iframe or object tag
    const fileUrl = URL.createObjectURL(fileData);
    return { fileUrl, fileName: reportData.report_path.split('/').pop() };
    
  } catch (error) {
    console.error('Error fetching patient report:', error);
    throw error;
  }
};
