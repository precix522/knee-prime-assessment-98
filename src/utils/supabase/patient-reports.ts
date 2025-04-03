
import { supabase } from './client';

// Function to fetch patient report PDF by patient ID
export const getPatientReport = async (patientId: string) => {
  try {
    console.log('Fetching patient data for ID:', patientId);
    
    // First, check if the patient exists to provide better error messages
    const { data: patientExists, error: checkError } = await supabase
      .from('patient')
      .select('Patient_ID')
      .eq('Patient_ID', patientId);
      
    console.log('Patient exists check result:', patientExists);
    
    if (checkError) {
      console.error('Error checking patient existence:', checkError);
      throw new Error(`Database error: ${checkError.message}`);
    }
    
    if (!patientExists || patientExists.length === 0) {
      throw new Error(`Patient ID "${patientId}" not found in the database`);
    }
    
    // Fetch the report URL from the 'patient' table
    const { data: patientData, error: patientError } = await supabase
      .from('patient')
      .select('report_url')
      .eq('Patient_ID', patientId)
      .single();
    
    console.log('Patient data result:', patientData);
    
    if (patientError) {
      console.error('Error fetching patient data:', patientError);
      throw patientError;
    }
    
    if (!patientData) {
      throw new Error('No report URL found for this patient ID');
    }
    
    // Get the report URL from the patient data
    const reportUrl = patientData.report_url;
    console.log('Report URL:', reportUrl);
    
    if (!reportUrl || typeof reportUrl !== 'string') {
      throw new Error('Invalid report URL format');
    }
    
    // Extract file name for display purposes
    const fileName = reportUrl.split('/').pop() || 'patient-report.pdf';
    
    // Return the public URL directly
    return { 
      fileUrl: reportUrl, 
      fileName 
    };
  } catch (error) {
    console.error('Error fetching patient report:', error);
    throw error;
  }
};

// Updated function to fetch supporting documents for the Annex view
export const getAnnexReport = async (patientId: string) => {
  try {
    console.log('Fetching annex report for patient ID:', patientId);
    
    // Use a fallback URL directly since the table doesn't exist
    const fallbackUrl = 'https://btfinmlyszedyeadqgvl.supabase.co/storage/v1/object/public/supporting-documents//Orange%20and%20Blue%20Minimal%20and%20Professional%20Company%20Annual%20Report%20(3).pdf';
    const fileName = 'annex-report.pdf';
    
    console.log('Using fallback annex report URL:', fallbackUrl);
    
    return { 
      fileUrl: fallbackUrl, 
      fileName 
    };
  } catch (error) {
    console.error('Error in annex report handling:', error);
    // Always return the fallback URL on any error
    const fallbackUrl = 'https://btfinmlyszedyeadqgvl.supabase.co/storage/v1/object/public/supporting-documents//Orange%20and%20Blue%20Minimal%20and%20Professional%20Company%20Annual%20Report.pdf';
    const fileName = 'annex-report.pdf';
    
    return { 
      fileUrl: fallbackUrl, 
      fileName 
    };
  }
};

// Function to fetch supporting document link from Supabase
export const getSupportingDocument = async () => {
  try {
    console.log('Fetching supporting document');
    
    // Use the fallback URL directly since the table doesn't exist
    const fallbackUrl = 'https://btfinmlyszedyeadqgvl.supabase.co/storage/v1/object/public/supporting-documents//Orange%20and%20Blue%20Minimal%20and%20Professional%20Company%20Annual%20Report.pdf';
    console.log('Using fallback supporting document URL:', fallbackUrl);
    
    // Extract file name for display purposes
    const fileName = fallbackUrl.split('/').pop() || 'supporting-document.pdf';
    
    return { 
      fileUrl: fallbackUrl, 
      fileName 
    };
  } catch (error) {
    console.error('Error in supporting document handling:', error);
    
    // If there's an error, return the hardcoded URL
    const fallbackUrl = 'https://btfinmlyszedyeadqgvl.supabase.co/storage/v1/object/public/supporting-documents//Orange%20and%20Blue%20Minimal%20and%20Professional%20Company%20Annual%20Report.pdf';
    const fileName = fallbackUrl.split('/').pop() || 'supporting-document.pdf';
    
    return { 
      fileUrl: fallbackUrl, 
      fileName 
    };
  }
};
