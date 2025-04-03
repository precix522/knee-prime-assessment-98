
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
        throw error;
      }
      
      console.log(`Bucket "${bucketName}" created successfully.`);
      return true;
    }
    
    console.log(`Bucket "${bucketName}" already exists.`);
    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw error;
  }
};

// Function to upload patient document to Supabase storage
export const uploadPatientDocument = async (file: File, patientId: string, documentType: 'main' | 'annex') => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }
    
    const bucketName = 'Patient-report';
    
    // Check if we can access the bucket first
    try {
      // Check if bucket exists without trying to create it (which requires special permissions)
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket(bucketName);
      
      // If we get an error, the bucket might not exist or we don't have permissions
      if (bucketError) {
        console.error('Error accessing storage bucket:', bucketError);
        throw new Error(`Bucket access error: ${bucketError.message}`);
      }
    } catch (err) {
      console.error('Cannot access storage bucket:', err);
      return {
        success: false,
        url: 'https://placeholder-url.com/no-report',
        error: err instanceof Error ? err.message : 'Failed to access storage bucket'
      };
    }
    
    // Create a folder path using patient ID
    const folderPath = `patient-reports/${patientId}`;
    const fileExt = file.name.split('.').pop();
    const fileName = `${documentType}-report-${Date.now()}.${fileExt}`;
    const filePath = `${folderPath}/${fileName}`;
    
    console.log(`Uploading ${documentType} report for patient ${patientId} to bucket '${bucketName}'...`);
    
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
