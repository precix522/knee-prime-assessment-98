
import { supabase } from './client';

// Function to check if a bucket exists and create it if it doesn't
export const ensureBucketExists = async (bucketName: string) => {
  try {
    // Check if bucket exists
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .getBucket(bucketName);
    
    if (bucketError) {
      console.log(`Bucket "${bucketName}" does not exist. Attempting to create it...`);
      
      // Create the bucket if it doesn't exist
      const { data, error } = await supabase
        .storage
        .createBucket(bucketName, {
          public: true, // Make files publicly accessible
          fileSizeLimit: 10485760, // Limit file size to 10MB (adjust as needed)
        });
      
      if (error) {
        console.error('Error creating bucket:', error);
        return { success: false, error: error.message };
      }
      
      console.log(`Bucket "${bucketName}" created successfully.`);
      return { success: true, error: null };
    }
    
    console.log(`Bucket "${bucketName}" already exists.`);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error checking bucket' 
    };
  }
};

// Function to upload patient document to Supabase storage
export const uploadPatientDocument = async (file: File, patientId: string, documentType: 'main' | 'annex') => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Use 'Patient-report' as the bucket name
    const bucketName = 'Patient-report';
    
    // First, ensure the bucket exists
    const bucketResult = await ensureBucketExists(bucketName);
    if (!bucketResult.success) {
      console.error('Failed to ensure bucket exists:', bucketResult.error);
      return {
        success: false,
        url: 'https://placeholder-url.com/no-report',
        error: `Failed to ensure storage bucket exists: ${bucketResult.error}`
      };
    }
    
    // Create a path using 'patient-reports' as the folder name inside the 'Patient-report' bucket
    const folderName = 'patient-reports';
    const fileExt = file.name.split('.').pop();
    const fileName = `${documentType}-report-${Date.now()}.${fileExt}`;
    const filePath = `${folderName}/${patientId}/${fileName}`;
    
    console.log(`Uploading ${documentType} report for patient ${patientId} to bucket '${bucketName}', path: ${filePath}`);
    
    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600'
      });
      
    if (uploadError) {
      console.error('File upload error:', uploadError);
      return {
        success: false,
        url: 'https://placeholder-url.com/no-report',
        error: uploadError.message
      };
    }
    
    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    console.log(`${documentType} report uploaded successfully, URL:`, publicUrl);
    
    return {
      success: true,
      url: publicUrl,
      error: null
    };
    
  } catch (error) {
    console.error('Error in uploadPatientDocument:', error);
    // Return an object with error information
    return {
      success: false,
      url: 'https://placeholder-url.com/no-report',
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
};
