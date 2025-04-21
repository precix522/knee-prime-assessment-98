
import { supabase } from './client';

// Function to upload patient document to Supabase storage
export const uploadPatientDocument = async (file: File, patientId: string, documentType: 'main' | 'annex' | 'xray' | 'mri') => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Create folder path based on patient ID with timestamp for uniqueness
    const timestamp = Date.now();
    const folderPath = `patient-reports/${patientId}_${timestamp}`;
    const fileExt = file.name.split('.').pop();
    const fileName = `${documentType}-report-${timestamp}.${fileExt}`;
    const filePath = `${folderPath}/${fileName}`;
    
    console.log(`Uploading ${documentType} report for patient ${patientId} to bucket 'patient-reports'...`);
    
    // Upload the file with authorization override for public upload
    // This works when a proper RLS policy is set on the bucket to allow anonymous uploads
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('patient-reports')
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
      .from('patient-reports')
      .getPublicUrl(filePath);
      
    console.log(`${documentType} report uploaded successfully, URL:`, publicUrl);
    
    return publicUrl;
    
  } catch (error) {
    console.error('Error in uploadPatientDocument:', error);
    throw error;
  }
};
