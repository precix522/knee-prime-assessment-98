
import { supabase } from './client';

// Function to check if a bucket exists
export const checkBucketExists = async (bucketName: string) => {
  try {
    // Check if bucket exists
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketError) {
      console.error('Error checking buckets:', bucketError);
      return { success: false, exists: false, error: bucketError.message };
    }
    
    // Look for the bucket in the list
    const bucketExists = bucketData.some(bucket => bucket.name === bucketName);
    
    console.log(`Bucket "${bucketName}" exists: ${bucketExists}`);
    return { 
      success: true, 
      exists: bucketExists, 
      error: null 
    };
  } catch (error) {
    console.error('Error checking if bucket exists:', error);
    return { 
      success: false, 
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error checking bucket' 
    };
  }
};

// Function to ensure bucket exists - just checks, doesn't create (due to RLS)
export const ensureBucketExists = async (bucketName: string) => {
  try {
    // Check if the bucket exists
    const bucketStatus = await checkBucketExists(bucketName);
    
    if (!bucketStatus.success) {
      return { 
        success: false, 
        error: `Failed to check if bucket exists: ${bucketStatus.error}` 
      };
    }
    
    if (!bucketStatus.exists) {
      console.log(`Bucket "${bucketName}" does not exist. Please create it in the Supabase dashboard.`);
      return { 
        success: false, 
        error: 'Bucket does not exist. Please create it in the Supabase dashboard.' 
      };
    }
    
    console.log(`Bucket "${bucketName}" exists.`);
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
    
    // First, check if the bucket exists
    const bucketResult = await checkBucketExists(bucketName);
    if (!bucketResult.success || !bucketResult.exists) {
      console.error('Bucket does not exist or could not be checked:', bucketResult.error);
      return {
        success: false,
        url: 'https://placeholder-url.com/no-report',
        error: `Storage bucket doesn't exist: ${bucketResult.error || 'Unknown error'}`
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
    return {
      success: false,
      url: 'https://placeholder-url.com/no-report',
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
};
