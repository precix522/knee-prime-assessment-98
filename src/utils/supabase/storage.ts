
import { supabase } from './client';

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
    
    console.log(`Uploading ${documentType} report for patient ${patientId} to bucket 'Patient-report'...`);
    
    // Upload the file with authorization override for public upload
    // This works when a proper RLS policy is set on the bucket to allow anonymous uploads
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('Patient-report')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600'
      });
      
    if (uploadError) {
      console.error('File upload error:', uploadError);
      throw uploadError;
    }
    
    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('Patient-report')
      .getPublicUrl(filePath);
      
    console.log(`${documentType} report uploaded successfully, URL:`, publicUrl);
    
    return publicUrl;
    
  } catch (error) {
    console.error('Error in uploadPatientDocument:', error);
    throw error;
  }
};
