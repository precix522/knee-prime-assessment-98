
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
    console.log('Fetching supporting documents for ID: 12345');
    
    // Fetch the supporting document from the 'Supporting Document' table
    const { data, error } = await supabase
      .from('Supporting Document')
      .select('document_url, document_name')
      .eq('id', '12345')
      .single();
    
    console.log('Supporting document data result:', data);
    
    if (error) {
      console.error('Error fetching supporting document:', error);
      throw error;
    }
    
    if (!data || !data.document_url) {
      throw new Error('No supporting document found with ID 12345');
    }
    
    // Get the document URL from the data
    const documentUrl = data.document_url;
    console.log('Supporting document URL:', documentUrl);
    
    if (!documentUrl || typeof documentUrl !== 'string') {
      throw new Error('Invalid document URL format');
    }
    
    // Use provided document name or extract from URL
    const fileName = data.document_name || documentUrl.split('/').pop() || 'supporting-document.pdf';
    
    // Return the document URL and file name
    return { 
      fileUrl: documentUrl, 
      fileName 
    };
  } catch (error) {
    console.error('Error fetching supporting document:', error);
    // If there's an error, use a fallback URL
    const fallbackUrl = 'https://btfinmlyszedyeadqgvl.supabase.co/storage/v1/object/public/supporting-documents//Orange%20and%20Blue%20Minimal%20and%20Professional%20Company%20Annual%20Report.pdf';
    const fileName = 'supporting-document.pdf';
    
    return { 
      fileUrl: fallbackUrl, 
      fileName 
    };
  }
};

// Function to fetch supporting document link from Supabase
export const getSupportingDocument = async () => {
  try {
    console.log('Fetching supporting document link');
    
    // Using the Supporting Document table instead of supporting_documents
    const { data, error } = await supabase
      .from('Supporting Document')
      .select('document_url, document_name')
      .eq('id', '12345')
      .single();
    
    console.log('Supporting document data result:', data);
    
    if (error) {
      console.error('Error fetching supporting document:', error);
      throw error;
    }
    
    if (!data || !data.document_url) {
      // If no document found in the table, return the hardcoded URL
      const fallbackUrl = 'https://btfinmlyszedyeadqgvl.supabase.co/storage/v1/object/public/supporting-documents//Orange%20and%20Blue%20Minimal%20and%20Professional%20Company%20Annual%20Report.pdf';
      console.log('No supporting document found in database, using fallback URL');
      
      // Extract file name for display purposes
      const fileName = fallbackUrl.split('/').pop() || 'supporting-document.pdf';
      
      return { 
        fileUrl: fallbackUrl, 
        fileName 
      };
    }
    
    // Get the document URL and name from the data
    const documentUrl = data.document_url;
    console.log('Supporting document URL:', documentUrl);
    
    // Use provided document name or extract from URL
    const fileName = data.document_name || documentUrl.split('/').pop() || 'supporting-document.pdf';
    
    // Return the document URL and file name
    return { 
      fileUrl: documentUrl, 
      fileName 
    };
  } catch (error) {
    console.error('Error fetching supporting document:', error);
    
    // If there's an error, return the hardcoded URL
    const fallbackUrl = 'https://btfinmlyszedyeadqgvl.supabase.co/storage/v1/object/public/supporting-documents//Orange%20and%20Blue%20Minimal%20and%20Professional%20Company%20Annual%20Report.pdf';
    const fileName = fallbackUrl.split('/').pop() || 'supporting-document.pdf';
    
    return { 
      fileUrl: fallbackUrl, 
      fileName 
    };
  }
};
