
import { supabase } from './client';

// Function to check if bucket exists and create if not
const ensureBucketExists = async (bucketName: string) => {
  try {
    // Check if bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error checking buckets:', error);
      throw error;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket '${bucketName}' does not exist, attempting to create...`);
      
      // Try to create the bucket
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true  // Make bucket public by default
      });
      
      if (createError) {
        console.error(`Failed to create bucket '${bucketName}':`, createError);
        throw createError;
      }
      
      console.log(`Bucket '${bucketName}' created successfully`);
    } else {
      console.log(`Bucket '${bucketName}' exists`);
    }
    
    return true;
  } catch (error) {
    console.error('Error in ensureBucketExists:', error);
    throw error;
  }
};

// Function to upload patient document to Supabase storage
export const uploadPatientDocument = async (file: File, patientId: string, documentType: 'main' | 'annex' | 'xray' | 'mri') => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }
    
    const BUCKET_NAME = 'patient-reports';
    
    // Ensure bucket exists before proceeding
    await ensureBucketExists(BUCKET_NAME);
    
    // Create folder path based on patient ID (use underscore instead of slash for patientId to avoid path issues)
    const safePatientId = patientId.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    const folderPath = `${safePatientId}`;
    const fileExt = file.name.split('.').pop();
    const fileName = `${documentType}-report-${timestamp}.${fileExt}`;
    const filePath = `${folderPath}/${fileName}`;
    
    console.log(`Uploading ${documentType} report for patient ${patientId} to bucket '${BUCKET_NAME}'...`);
    console.log(`File path: ${filePath}`);
    
    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
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
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
      
    console.log(`${documentType} report uploaded successfully, URL:`, publicUrl);
    
    return publicUrl;
    
  } catch (error) {
    console.error('Error in uploadPatientDocument:', error);
    throw error;
  }
};
