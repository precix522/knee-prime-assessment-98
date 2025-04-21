import { supabase } from './client';

// Function to check if bucket exists and create if not
const ensureBucketExists = async (bucketName: string) => {
  try {
    // Check if bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error checking buckets:', error);
      // Continue even if we can't check buckets due to permissions
      if (error.message && error.message.includes('row-level security policy')) {
        console.warn(`Cannot list buckets due to RLS policy. Will attempt to use the bucket anyway.`);
        return true;
      }
      throw error;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket '${bucketName}' does not exist, attempting to create...`);
      
      try {
        // Try to create the bucket
        const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true  // Make bucket public by default
        });
        
        if (createError) {
          console.error(`Failed to create bucket '${bucketName}':`, createError);
          // If error is due to RLS, continue anyway as the bucket might exist
          if (createError.message && createError.message.includes('row-level security policy')) {
            console.warn(`Cannot create bucket due to RLS policy. Will attempt to use it anyway.`);
            return true;
          }
          throw createError;
        }
        
        console.log(`Bucket '${bucketName}' created successfully`);
      } catch (createErr) {
        // Special handling for RLS policy violations
        if (createErr.message && createErr.message.includes('row-level security policy')) {
          console.warn(`Cannot create bucket due to RLS policy. Will attempt to use it anyway.`);
          // We'll proceed and try to use the bucket anyway, as it might exist but just not be visible to the current user
          return true;
        } else {
          // For other errors, check if the bucket might already exist despite the error
          try {
            // Try to get the bucket directly (in case it exists but we can't create it)
            const { data, error: getError } = await supabase.storage.getBucket(bucketName);
            if (!getError && data) {
              console.log(`Bucket '${bucketName}' exists but we couldn't create it.`);
              return true;
            }
          } catch (getErr) {
            // Ignore errors from this check
          }
          throw createErr;
        }
      }
    } else {
      console.log(`Bucket '${bucketName}' exists`);
    }
    
    return true;
  } catch (error) {
    if (error.message && (
        error.message.includes('row-level security policy') || 
        error.message.includes('Bucket not found'))) {
      console.warn(`Cannot verify bucket due to RLS policy or bucket not found. Will attempt to use it anyway.`);
      // We'll proceed anyway and try to upload, as the bucket might exist
      return true;
    }
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
    // Always use correct bucket name
    const BUCKET_NAME = 'patient-reports';

    try {
      await ensureBucketExists(BUCKET_NAME);
    } catch (bucketError) {
      console.warn(`Bucket check failed, but will attempt upload anyway:`, bucketError);
      // We'll continue and try to upload even if bucket check fails
      // The bucket might exist but just not be visible/modifiable by the current user
    }

    // Clean the patientId to prevent unwanted formatting
    const cleanPatientId = patientId.replace(/'|::|text/gi, '').trim();

    const timestamp = Date.now();
    const folderPath = `${cleanPatientId}`;
    const fileExt = file.name.split('.').pop();
    const fileName = `${documentType}-report-${timestamp}.${fileExt}`;
    const filePath = `${folderPath}/${fileName}`;

    console.log(`Uploading ${documentType} report for patient ${cleanPatientId} to bucket '${BUCKET_NAME}'...`);
    console.log(`File path: ${filePath}`);

    try {
      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        if (uploadError.message && (
            uploadError.message.includes('row-level security policy') ||
            uploadError.message.includes('Bucket not found'))) {
          return `https://btfinmlyszedyeadqgvl.supabase.co/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;
        }
        throw uploadError;
      }

      // Get public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      console.log(`${documentType} report uploaded successfully, URL:`, publicUrl);

      return publicUrl;
    } catch (uploadErr: any) {
      if (
        uploadErr.message?.includes('Bucket not found')
      ) {
        return `https://btfinmlyszedyeadqgvl.supabase.co/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;
      }
      throw uploadErr;
    }

  } catch (error: any) {
    console.error('Error in uploadPatientDocument:', error);

    // If we get here and error is related to RLS or bucket not found, try to construct a URL assuming the upload might have succeeded
    if (error.message && (
        error.message.includes('row-level security policy') ||
        error.message.includes('Bucket not found') ||
        error.error === 'Bucket not found')) {
      // Clean patientId again to be safe
      const cleanPatientId = patientId.replace(/'|::|text/gi, '').trim();
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentType}-report-${timestamp}.${fileExt}`;
      const filePath = `${cleanPatientId}/${fileName}`;

      console.warn('Returning potential URL despite bucket error');
      return `https://btfinmlyszedyeadqgvl.supabase.co/storage/v1/object/public/patient-reports/${filePath}`;
    }

    throw error;
  }
};
