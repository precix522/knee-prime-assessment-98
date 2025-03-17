
import { createClient } from '@supabase/supabase-js';

// Supabase configuration with your provided credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://btfinmlyszedyeadqgvl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmlubWx5c3plZHllYWRxZ3ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MTgxMDgsImV4cCI6MjA1NzA5NDEwOH0.3jIu8RS9c7AEBCVu41Ti3aW6B0ogFoEnFWeU_PINfoM';

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
    
    // Fetch the report URL from the 'patient' table
    // Based on your actual table structure
    const { data: patientData, error: patientError } = await supabaseClient
      .from('patient')
      .select('report URL')
      .eq('Patient ID', patientId)
      .single();
    
    if (patientError) throw patientError;
    if (!patientData) throw new Error('No report found for this patient ID');
    
    // Get the report URL from the patient data
    const reportUrl = patientData['report URL'];
    
    if (!reportUrl || typeof reportUrl !== 'string') {
      throw new Error('Invalid report URL format');
    }
    
    // Now get the actual file from storage
    const { data: fileData, error: fileError } = await supabaseClient
      .storage
      .from('Patient-report') // Your bucket name
      .download(reportUrl);
    
    if (fileError) throw fileError;
    if (!fileData) throw new Error('Could not retrieve the report file');
    
    // Convert the blob to a URL that can be used in an iframe or object tag
    const fileUrl = URL.createObjectURL(fileData);
    const fileName = reportUrl.split('/').pop() || 'patient-report.pdf';
    
    return { fileUrl, fileName };
    
  } catch (error) {
    console.error('Error fetching patient report:', error);
    throw error;
  }
};
