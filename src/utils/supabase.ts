import { createClient } from '@supabase/supabase-js';

// Supabase configuration with your provided credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://btfinmlyszedyeadqgvl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmlubWx5c3plZHllYWRxZ3ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MTgxMDgsImV4cCI6MjA1NzA5NDEwOH0.3jIu8RS9c7AEBCVu41Ti3aW6B0ogFoEnFWeU_PINfoM';

// Create a single Supabase client instance to avoid multiple instances warning
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    
    // Instead of downloading the file, we'll use the public URL directly
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

// Function to fetch annex report PDF by patient ID
export const getAnnexReport = async (patientId: string) => {
  try {
    console.log('Fetching annex report for patient ID:', patientId);
    
    // Fetch the annex report URL from the 'patient' table
    const { data: patientData, error: patientError } = await supabase
      .from('patient')
      .select('annex_report_url')
      .eq('Patient_ID', patientId)
      .single();
    
    console.log('Patient annex data result:', patientData);
    
    if (patientError) {
      console.error('Error fetching patient annex data:', patientError);
      throw patientError;
    }
    
    if (!patientData || !patientData.annex_report_url) {
      throw new Error('No annex report URL found for this patient ID');
    }
    
    // Get the annex report URL from the patient data
    const reportUrl = patientData.annex_report_url;
    console.log('Annex Report URL:', reportUrl);
    
    if (!reportUrl || typeof reportUrl !== 'string') {
      throw new Error('Invalid annex report URL format');
    }
    
    // Extract file name for display purposes
    const fileName = reportUrl.split('/').pop() || 'annex-report.pdf';
    
    // Return the public URL directly
    return { 
      fileUrl: reportUrl, 
      fileName 
    };
  } catch (error) {
    console.error('Error fetching annex report:', error);
    throw error;
  }
};

// Function to fetch supporting document link from Supabase
export const getSupportingDocument = async () => {
  try {
    console.log('Fetching supporting document link');
    
    // Fetch the supporting document from the 'supporting_documents' table
    const { data, error } = await supabase
      .from('supporting_documents')
      .select('document_url')
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
    
    // Get the document URL from the data
    const documentUrl = data.document_url;
    console.log('Supporting document URL:', documentUrl);
    
    // Extract file name for display purposes
    const fileName = documentUrl.split('/').pop() || 'supporting-document.pdf';
    
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

// Function to upload patient document to Supabase storage
export const uploadPatientDocument = async (file: File, patientId: string, documentType: 'main' | 'annex') => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Create a folder path using patient ID
    const folderPath = `patient-reports/${patientId}`;
    const fileExt = file.name.split('.').pop();
    const fileName = `${documentType}-report-${Date.now()}.${fileExt}`;
    const filePath = `${folderPath}/${fileName}`;
    
    console.log(`Uploading ${documentType} report for patient ${patientId}...`);
    
    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('patient-documents')
      .upload(filePath, file, {
        upsert: true,
      });
      
    if (uploadError) {
      console.error('File upload error:', uploadError);
      throw uploadError;
    }
    
    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('patient-documents')
      .getPublicUrl(filePath);
      
    console.log(`${documentType} report uploaded successfully, URL:`, publicUrl);
    
    return publicUrl;
    
  } catch (error) {
    console.error('Error in uploadPatientDocument:', error);
    throw error;
  }
};

// Function to check if patient ID already exists
export const checkPatientIdExists = async (patientId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('patient')
      .select('Patient_ID')
      .eq('Patient_ID', patientId);
      
    if (error) {
      throw error;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking patient ID:', error);
    throw error;
  }
};

// Function to create a new patient record
export const createPatientRecord = async (patientData: {
  patientId: string;
  patientName: string;
  phoneNumber: string;
  reportUrl: string | null;
  annexReportUrl: string | null;
}) => {
  try {
    const { error } = await supabase
      .from('patient')
      .insert([
        {
          Patient_ID: patientData.patientId,
          patient_name: patientData.patientName,
          phone_number: patientData.phoneNumber,
          report_url: patientData.reportUrl,
          annex_report_url: patientData.annexReportUrl
        }
      ]);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error creating patient record:', error);
    throw error;
  }
};
